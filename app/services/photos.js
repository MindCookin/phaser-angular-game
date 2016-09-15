'use strict';

angular.module('myApp')

.factory('Photos', ['$resource',
    function($resource) {
      return $resource('https://api.500px.com/v1/photos', {}, {
        query: {
          method: 'GET',
          params: {
            feature: 'popular',
            consumer_key: 'QJkue2FcLLCIThSa55zjqnqIiVpncLgaS6rfkwOt',
            tags: 1,
            image_size: 440
          }
        }
      });
    }
  ])
