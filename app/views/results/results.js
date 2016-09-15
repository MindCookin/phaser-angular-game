'use strict';

angular.module('myApp.results', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/results', {
    templateUrl: 'app/views/results/results.html',
    controller: 'ResultsCtrl'
  });
}])

.controller('ResultsCtrl', ['$scope', 'GameResults', function($scope, GameResults) {

	var lastScore = GameResults.get();

	$scope.score = lastScore.score;
	$scope.highscore = lastScore.highscore;
}]);
