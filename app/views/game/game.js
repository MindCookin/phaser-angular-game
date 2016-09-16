/* global angular Phaser */

'use strict'

angular.module('myApp.game', ['ngRoute'])

.config(['$routeProvider', function ($routeProvider) {
  $routeProvider.when('/game', {
    templateUrl: 'app/views/game/game.html',
    controller: 'GameCtrl'
  })
}])

.controller('GameCtrl', ['Photos', '$scope', '$rootScope', '$timeout', 'Game.Preloader', 'Game.Logic', function (Photos, $scope, $rootScope, $timeout, Preloader, Logic) {

  $scope.assetsLoaded = false

  Photos.fetch()
    .then(function (data) {
      return data.photos.map(function (obj) {
        return obj.image_url
      })
    })
    .then(function (photosURL) {

      var game = new Phaser.Game('100%', '100%', Phaser.CANVAS, 'game', null, true)

      game.state.add('Preloader', Preloader(photosURL), true)
      game.state.add('Game', Logic)

      $scope.assetsLoaded = false

      $rootScope.$on('loaded', function (event) {
        $scope.$apply(function () {
          $scope.assetsLoaded = true
        })

        $timeout(
          function () {
            $scope.$apply(function () {
              $scope.hidePreloader = true
              game.state.start('Game')
            })
          }
          , 2000)
      })
    })

  $rootScope.$on('tips', function (event, data) {
    $scope.$apply(function () {
      $scope.tips = data
    })
  })

  $scope.onSelect = function (selection) {
    $rootScope.$broadcast('selection', selection)
  }
}])

.factory('Game.Preloader', ['$rootScope', function ($rootScope) {

  var _photosURL

  var Preloader = function () {}

  Preloader.prototype = {

    init: function () {
      this.input.maxPointers = 1
      this.scale.pageAlignHorizontally = true
    },

    preload: function () {

      this.load.path = 'app/assets/'

      this.load.bitmapFont('fat-and-tiny')
      this.load.bitmapFont('digits')

      this.load.images(_photosURL)
    },

    create: function () {
      $rootScope.$broadcast('loaded')
    }
  }

  return function (photosURL) {

    _photosURL = photosURL

    return Preloader
  }
}])

.factory('Game.Logic', ['Photos', '$rootScope', '$location', 'GameResults', function (Photos, $rootScope, $location, GameResults) {

  var KEYS = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'z', 'x', 'c', 'v', 'b', 'n', 'm']

  var Game = function () {

    this.score = 0
    this.scoreText = null
  }

  Game.prototype = {

    init: function () {

      this.score = 0

      $rootScope.$on('selection', function (ev, data) {
        this.selectKey(data)
      }.bind(this))
    },

    create: function () {

      this.scoreText = this.add.bitmapText(64, 12, 'fat-and-tiny', 'SCORE: 0', 32)
      this.scoreText.smoothed = false
      this.scoreText.tint = 0x000000

      this.rawPhotoData = Photos.get()

      this.playing = true
      this.speed = 1
      this.totalKeys = []
      this.successfulTags = []
      this.totalTags = []

      this.showNextPhoto()
    },

    update: function () {

      if (this.playing && this.input.keyboard.pressEvent) {

        var ev = this.input.keyboard.pressEvent
        var success = this.currentTags.filter(function (value) {
          return value.indexOf(ev.key) === 0
        })

        this.keysPressed.push(ev.key)
        this.totalKeys.push(ev.key)

        if (success.length > 0) {
          this.success(success)
        }

        this.input.keyboard.pressEvent = null
      }
    },

    success: function (tags) {

      this.playing = false

      this.successfulTags = (this.successfulTags || []).concat(tags)
      this.totalTags = (this.totalTags || []).concat(this.currentTags)

      this.add.tween(this.currentPhoto).to({
        x: this.world.centerX,
        y: this.world.centerY,
        width: 10000,
        height: 10000,
        alpha: 0
      }, 300, 'Sine.easeOut', true, 100)

      var style = { font: 'bold 70px Arial', fill: '#fff', boundsAlignH: 'center', boundsAlignV: 'center' }
      var text = this.game.add.text(0, 0, tags.join('\n').toString(), style)
      text.setShadow(3, 3, 'rgba(0,0,0,0.5)', 2)
      text.anchor.set(0.5)
      text.x = this.world.width / 2
      text.y = this.world.height / 2
      var tween = this.add.tween(text).to({
        alpha: 0,
        width: 0,
        height: 0
      }, 300, 'Sine.easeOut', true, 300)

      tween.onComplete.add(this.addScore, this)
    },

    calcPoints: function () {

      var worldWidth = this.world.width
      var photoRightCorner = this.currentPhoto.x
      var percentageOfScreen = (worldWidth - photoRightCorner) / worldWidth
      var positionScore = Math.floor(percentageOfScreen * 10)

      var speedScore = Math.floor(this.speed)

      var keysNeeded = this.keysPressed.length
      var keysNeededScore = Math.max(10 - keysNeeded, 0)

      this.totalPhotos = (this.totalPhotos || 0) + 1

      return positionScore + speedScore + keysNeededScore
    },

    addScore: function (tween) {

      this.score += this.calcPoints()
      this.scoreText.text = 'SCORE: ' + this.score

      this.currentPhoto.destroy()

      this.showNextPhoto()
    },

    showNextPhoto: function () {

      if (this.photoTween) {
        this.photoTween.stop()
      }

      var photo = Phaser.ArrayUtils.getRandomItem(this.rawPhotoData)

      this.currentPhoto = this.add.image(0, this.world.centerY, photo.image_url)
      this.currentPhoto.anchor.set(0.5)
      this.currentPhoto.x -= this.currentPhoto.width / 2
      this.currentTags = photo.tags
      this.currentPhoto.alpha = 0

      this.speed *= 1.2

      this.playing = true
      this.keysPressed = []

      this.add.tween(this.currentPhoto).to({alpha: 1}, 1000, 'Sine.easeOut', true, 100)
      this.photoTween = this.add.tween(this.currentPhoto).to({x: this.world.width + (this.currentPhoto.width / 2)}, 10000 / this.speed, 'Linear', true, 100)
      this.photoTween.onComplete.add(this.gameOver, this)

      if (!Phaser.Device.desktop) {
        var tips = this.updateTips()
        $rootScope.$broadcast('tips', tips)
      }
    },

    updateTips: function () {

      var tags = this.currentTags[this.game.rnd.integerInRange(0, this.currentTags.length - 1)]

      var tips = []

      if (tags) {
        tips.push(tags.substr(0, 1))
      } else {
        tips.push(KEYS[this.game.rnd.integerInRange(0, 10)])
      }
      tips.push(KEYS[this.game.rnd.integerInRange(0, 10)])
      tips.push(KEYS[this.game.rnd.integerInRange(10, 20)])
      tips.push(KEYS[this.game.rnd.integerInRange(20, KEYS.length - 1)])

      return Phaser.ArrayUtils.shuffle(tips)
    },

    selectKey: function (k) {

      var success = this.currentTags.filter(function (value) {
        return value.indexOf(k) === 0
      })

      this.keysPressed.push(k)
      this.totalKeys.push(k)

      if (success.length > 0) {
        this.success(success)
      } else {
        this.updateTips()
      }
    },

    gameOver: function () {

      GameResults.set({
        score: this.score,
        keysPressed: this.totalKeys,
        maxSpeed: this.speed,
        tags: {
          successful: this.successfulTags,
          total: this.totalTags
        }
      })

      this.game.destroy()

      $rootScope.$apply(function () {
        $location.path('/results')
      })
    }
  }

  return Game
}])
