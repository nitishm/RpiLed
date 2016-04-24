'use strict';

/**
 * @ngdoc function
 * @name webappApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webappApp
 */
angular.module('webappApp')
  .controller('MainCtrl', function ($resource, $scope) {
  	
    var url = 'http://10.0.0.223:3001/led';
    function toggleLed(led_status) {
      var led = $resource(url);
      led.save(
        {status:led_status}).$promise.then(function(response){
          $scope.led = response.led;
      });
      if(led_status){  
        $scope.pwmVal = 100;
      } else {
        $scope.pwmVal = 0;
      }
    };

    toggleLed(0);
    $scope.pwmValues = [0,10,20,30,40,50,60,70,80,90,100];
    $scope.pwmVal = 0;

    $scope.toggleLed = toggleLed;

  	$scope.pwmUpdate = function(value) {
  		var led = $resource(url + '/pwm');
  		led.save(
  			{pwm:value}).$promise.then(function(response) {
  				$scope.pwmVal = response.pwmVal;
  			});
  	};
  });
