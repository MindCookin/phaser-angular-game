'use strict';

angular.module('myApp.game', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/game', {
    templateUrl: 'app/views/game/game.html',
    controller: 'GameCtrl'
  });
}])

.controller('GameCtrl', ['Photos', '$scope', '$rootScope', '$timeout', 'Game.Preloader', 'Game.Logic', function(Photos, $scope, $rootScope, $timeout, Preloader, Logic) {

  $scope.assetsLoaded = false;

  Photos.fetch()
    .then(function(data) {
      return data.photos.map(function (obj) {
        return obj.image_url;
      });
    })
    .then(function (photosURL) {

      var game = new Phaser.Game('100%', '100%', Phaser.CANVAS, 'game', null,true);

      game.state.add('Preloader', Preloader(photosURL), true);
      game.state.add('Game', Logic);

      var myScope = $scope;
      $scope.assetsLoaded = false;

      $rootScope.$on('loaded', function (event) {
        $scope.$apply(function () {
            $scope.assetsLoaded = true;
        });

        $timeout(
          function() {
            $scope.$apply(function () {
              $scope.hidePreloader = true; 
              game.state.start('Game');
            });
          }
        , 2000);
      })

    });
}])

.factory('Game.Preloader', ['$rootScope', function($rootScope) {

  var _photosURL;

  var Preloader = function () {};

  Preloader.prototype = {

      init: function () {
          this.input.maxPointers = 1;
          this.scale.pageAlignHorizontally = true;
      },

      preload: function () {

        this.load.path = 'app/assets/';

        this.load.bitmapFont('fat-and-tiny');
        this.load.bitmapFont('digits');

        this.load.images(_photosURL);
      },

      create: function () {

        $rootScope.$broadcast('loaded');
      } 
  }

  return function (photosURL) {

    _photosURL = photosURL;

    return Preloader;
  }
}])

.factory('Game.Logic', ['Photos', '$rootScope', '$location', 'GameResults', function(Photos, $rootScope, $location, GameResults) {

  var Game = function () {

    this.score = 0;
    this.scoreText = null;

    this.bigText = null;

    this.stars = null;
    this.timer = null;
  };

  Game.prototype = {

    init: function () {

        this.score = 0;
    },

    create: function () {

        this.timeText = this.add.bitmapText(this.world.centerX + 32, 128, 'digits', '10', 1024);
        this.timeText.anchor.set(0.5);
        this.timeText.smoothed = false;
        this.timeText.alpha = 0.3;

        this.stars = this.add.group();

        this.scoreText = this.add.bitmapText(64, 12, 'fat-and-tiny', 'SCORE: 0', 32);
        this.scoreText.smoothed = false;
        this.scoreText.tint = 0x000000;
        //this.scoreText.visible = false;

        this.timer = this.time.create(false);
        this.timer.add(10000, this.timeUp, this);
        this.timer.start();

        this.rawPhotoData = Photos.get();

        this.playing = true;
        this.speed = 1;

        this.currentIndex = 0;
        this.showNextPhoto();
    },

      update: function () {

          if (this.timeText.visible) {
              this.timeText.text = 10 - Math.floor(this.timer.seconds);
          }

          if (this.playing && this.input.keyboard.pressEvent) {

            var ev = this.input.keyboard.pressEvent;
            var succes = this.currentTags.some(function (value) {
              return value.indexOf(ev.key) === 0;
            })

            this.input.keyboard.pressEvent = null;
            this.keysPressed.push(ev.key);

            if (succes) {
              this.success();
            }
          }

          if (this.playing && this.currentPhoto.x - (this.currentPhoto.width / 2) > this.world.width) {
            this.gameOver();
          }

          this.currentPhoto.x += this.speed;
      },

      success: function () {

        this.playing = false;

        var tween = this.add.tween(this.currentPhoto).to({
          x: this.world.centerX,
          y: this.world.centerY,
          width: 10000,
          height: 10000,
          alpha: 0
        }, 300, "Sine.easeOut", true, 100);

        tween.onComplete.add(this.addScore, this);
      },

      calcPoints: function () {

        var worldWidth = this.world.width;
        var photoRightCorner = this.currentPhoto.x;
        var percentageOfScreen = (worldWidth - photoRightCorner) / worldWidth;
        var positionScore = Math.floor(percentageOfScreen * 10);

        var speedScore = Math.floor(this.speed);

        var keysNeeded = this.keysPressed.length;
        var keysNeededScore = Math.max(10 - keysNeeded, 0);

        this.totalKeys = this.totalKeys || [];
        this.totalKeys.concat(this.keysPressed);

        console.log(positionScore, speedScore, keysNeededScore)

        return positionScore + speedScore + keysNeededScore;
      },

      addScore: function (tween) {

          //this.currentPhoto.destroy();

          this.score += this.calcPoints();
          this.scoreText.text = "SCORE: " + this.score;

          this.showNextPhoto();
      },

      showNextPhoto: function () {
        this.currentIndex += 1;
        this.currentPhoto = this.add.image(0, this.world.centerY, this.rawPhotoData[this.currentIndex].image_url);
        this.currentPhoto.anchor.set(0.5);
        this.currentPhoto.x -= this.currentPhoto.width / 2;
        this.currentTags = this.rawPhotoData[this.currentIndex].tags;
        this.currentPhoto.alpha = 0;

        this.speed *= 2;

        this.playing = true;
        this.keysPressed = [];

        this.add.tween(this.currentPhoto).to({alpha: 1}, 1000, "Sine.easeOut", true, 100); 

        console.log(this.currentTags);
      },

      gameOver: function () {

        var newScore = this.score;

        GameResults.set({
          score: newScore
        });

        this.game.destroy();

        $rootScope.$apply(function() {
          $location.path('/results');
        });
      }
  };

  return Game;
}])
