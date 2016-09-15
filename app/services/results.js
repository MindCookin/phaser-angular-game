'use strict';

angular.module('myApp')

.factory('GameResults', function() {

	var lastResults = {};

  	return {
		set: function (newResults) {
			lastResults.score = newResults.score;
			lastResults.highscore = Math.max(newResults.score, lastResults.highscore || 0);
		},
		get: function () {
			return lastResults;
		}
	}
});