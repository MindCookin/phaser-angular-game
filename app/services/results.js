'use strict';

angular.module('myApp')

.factory('GameResults', function() {

	var results = [{
		score: 100,
		keysPressed: 20,
		maxSpeed: 2,
		tags: {
			successful: 5,
			total: 30
			}
		}, {
		score: 300,
		keysPressed: 10,
		maxSpeed: 1.7,
		tags: {
			successful: 7,
			total: 28
			}
		}, {
		score: 400,
		keysPressed: ['a', 'f'],
		maxSpeed: 1,
		tags: {
			successful: ['asdasd', '12312', '345435', '345345'],
			total: ['asdasd', '12312', 'ssdfsdf', 'adsas', 'qwe', 'pookopk']
			}
		}
	];

	function calcHighscore () {

		return results
			.map(function (v) {
				return v.score;
			})
			.reduce(function(a, b){
				return Math.max(a, b);
			})
	}

  	return {
		set: function (newResults) {
			results.push(newResults);
		},
		get: function () {
			return {
				results: results,
				highscore: calcHighscore() 
			};
		}
	}
});