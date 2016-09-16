/* global angular */

'use strict'

angular.module('myApp')

.factory('Photos', ['$resource',
  function ($resource) {

    var PARAMS = {
      query: {
        method: 'GET',
        params: {
          feature: 'popular',
          consumer_key: 'QJkue2FcLLCIThSa55zjqnqIiVpncLgaS6rfkwOt',
          tags: 1,
          image_size: 440
        }
      }
    }
    var photos

    return {
      fetch: function () {

        var promise = $resource('https://api.500px.com/v1/photos', {}, PARAMS)
                          .query()
                          .$promise

        promise.then(function (data) {
          photos = data.photos
        })

        return promise
      },

      get: function () {
        return photos || []
      }
    }
  }
])
