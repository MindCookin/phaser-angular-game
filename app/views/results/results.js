'use strict';

angular.module('myApp.results', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/results', {
    templateUrl: 'app/views/results/results.html',
    controller: 'ResultsCtrl'
  });
}])

.controller('ResultsCtrl', [function() {

}]);
