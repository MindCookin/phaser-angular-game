'use strict';

angular.module('myApp')

.factory('Photos', ['$resource',
    function($resource) {
      return $resource('https://api.500px.com/v1/photos', {}, {
        query: {
          method: 'GET',
          params: {
            feature: 'fresh_today',
            sort: 'created_at',
            image_size: 3,
            include_store: 'store_download',
            include_states: 'voted',
            tags: 1
          },
          isArray: true
        }
      });
    }
  ])

.factory('OAuth', ['$resource',
    function($resource) {
      return $resource('https://api.500px.com/v1/oauth/request_token', {}, {
        query: {
          method: 'POST',
          params: {
            oauth_callback: window.location.href
          }
        }
      });
    }
  ]);
