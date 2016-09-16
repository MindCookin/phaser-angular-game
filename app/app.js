/* global angular Chart */

'use strict'

angular.module('myApp', [
  'ngResource',
  'ngRoute',
  'myApp.welcome',
  'myApp.game',
  'myApp.results',
  'chart.js'
])
.config(['$locationProvider', '$routeProvider', function ($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!')

  $routeProvider.otherwise({redirectTo: '/welcome'})

  Chart.defaults.global.colors = ['#333', '#666', '#999', '#AAA', '#DDD', '#FFF', '#4D5360']
}])
