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
    $scope.pin = {id:0, mode:null, pwm:0, status:0};
    $scope.pwmValues = [0,10,20,30,40,50,60,70,80,90,100];
    $scope.pwmVal = 0;

    $scope.toggleLed = toggleLed;
    $scope.update = update;

    $scope.gpioPins = [0,1,2,3,4];
    $scope.gpioModes = ["output", "pwm"];
        
    function toggleLed(status) {
      if(status){  
        $scope.pin.status = 1;
        $scope.pin.pwm = 100;
      } else {
        $scope.pin.status = 0;
        $scope.pin.pwm = 0;
      }
      update();
    };

    function update() {
      console.log($scope.pin);
      var led = $resource(url);
      led.save({pin:$scope.pin});
    };
  });
