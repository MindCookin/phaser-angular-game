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

	$scope.labels = data.results.map(function (value, index) { return 'Game ' + (index + 1); });
	$scope.series = ['Keys Pressed', 'Succesful tags', 'Max speed'];

	$scope.data = data.results.reduce(function (prev, next) { 
		prev[0].push(next.keysPressed.length)
		prev[1].push(next.tags.successful.length)
		prev[2].push(next.maxSpeed)
		return prev;
	}, [[], [], []])
}]);
