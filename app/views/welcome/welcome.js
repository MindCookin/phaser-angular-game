'use strict';

angular.module('myApp.welcome', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/welcome', {
    templateUrl: 'app/views/welcome/welcome.html',
    controller: 'WelcomeCtrl'
  });
}])

.controller('WelcomeCtrl', ['OAuth', function(OAuth) {

  var auth = OAuth.query();
  console.log(auth);

  //var photos = Photos.query();
  //console.log(photos);
}]);
