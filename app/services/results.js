/* global angular */

'use strict'

angular.module('myApp')

.factory('GameResults', function () {

  var results = []

  function calcHighscore () {

    return results
      .map(function (v) {
        return v.score
      })
      .reduce(function (a, b) {
        return Math.max(a, b)
      })
  }

  return {
    set: function (newResults) {
      results.push(newResults)
    },
    get: function () {
      return {
        results: results,
        highscore: calcHighscore()
      }
    }
  }
})
