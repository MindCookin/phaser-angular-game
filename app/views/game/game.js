'use strict';

angular.module('myApp.game', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/game', {
    templateUrl: 'views/game/game.html',
    controller: 'GameCtrl'
  });
}])

.controller('GameCtrl', [function() {

}]);
