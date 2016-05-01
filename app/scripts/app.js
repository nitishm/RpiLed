'use strict';

/**
 * @ngdoc overview
 * @name webappApp
 * @description
 * # webappApp
 *
 * Main module of the application.
 */
angular
  .module('webappApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch',
    'angularSpinner',
    'btford.socket-io',
    'ui.sortable'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl',
        controllerAs: 'main'
      })
      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .otherwise({
        redirectTo: '/'
      });
  })
  .factory('socket', function (socketFactory) {
      var socket = socketFactory();
      return socket;
  });
  // .factory('socket', function ($rootScope) {
  //   var socket = io.connect();
  //   return {
  //     on: function (eventName, callback) {
  //       socket.on(eventName, function () {  
  //         var args = arguments;
  //         $rootScope.$apply(function () {
  //           callback.apply(socket, args);
  //         });
  //       });
  //     },
  //     emit: function (eventName, data, callback) {
  //       socket.emit(eventName, data, function () {
  //         var args = arguments;
  //         $rootScope.$apply(function () {
  //           if (callback) {
  //             callback.apply(socket, args);
  //           }
  //         });
  //       })
  //     }
  //   };
  // });
