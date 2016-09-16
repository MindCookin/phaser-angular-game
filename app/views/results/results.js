'use strict';

angular.module('myApp.results', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {

  $routeProvider.when('/results', {
    templateUrl: 'app/views/results/results.html',
    controller: 'ResultsCtrl'
  });

}])

.controller('ResultsCtrl', ['$scope', 'GameResults', function($scope, GameResults) {

	var data = GameResults.get();
	var last = data.results.slice(-1)[0];

	$scope.score = last.score;
	$scope.highscore = data.highscore;
	$scope.others = data.results.slice(data.results.length - 2);
	$scope.last = last;
}]);
