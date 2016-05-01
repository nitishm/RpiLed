'use strict';

/**
 * @ngdoc function
 * @name webappApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webappApp
 */
angular.module('webappApp')
  .constant('_',window._)
  .controller('MainCtrl', function ($resource, $scope, socket, _) {  
    
    var getSongName = function(str) {
      if(str)
        return str.substring(str.lastIndexOf("/") + 1, str.length);
      else
        return str;
    }
    // TODO : Create playlist
    // Comparison function to not update list if it hasnt changed
    
    $scope.loading = true;

    $scope.isPlaying   = false;
    $scope.fmPlaying   = false;
    $scope.currentSong = null;
    $scope.currentFm   = null;
    
    $scope.volume = 50;

    $scope.playSong  = playSong;
    $scope.stopSong  = stopSong;
    $scope.volUpSong = volUpSong;
    $scope.volDnSong = volDnSong;


    socket.on('song:stats', function (data) {
      // console.log(data);
      // Update songs and fm list
      // $scope.songs = data.mp3;
      // $scope.fms = data.pls;
      if(!(_.isEqual($scope.songs, data.mp3))) {
        // console.log("Not equal");
        $scope.songs = data.mp3;
        $scope.fms = data.pls;
      }
      // Update current player status
      if(data.playing) $scope.isPlaying = true;
      else $scope.isPlaying = false;
      $scope.currentFm = data.fm;
      $scope.currentSong = data.playing;

      // Show song/fm list
      $scope.loading = false;
    });

    socket.on('player:status', function(data) {
      // console.log(data);
      // Update current player volume
      $scope.volume = data.status.volume;
      $scope.currentSong = getSongName(data.status.filename);
      
      // Handle FM case
      if(data.status.title) {
        $scope.currentSong = data.status.title;
      } 

      // Update playing status
      if(data.status.filename) {
        $scope.isPlaying = true;
      } else {
        $scope.isPlaying = false;
      }
    });

    function playSong(song) {
      socket.emit('song:play', { song: song, volume: $scope.volume });    
      $scope.isPlaying = true;
    }

    function stopSong() {
      socket.emit('song:stop', {}, null); 
      $scope.currentSong = null;
      $scope.currentFm = null;    
      $scope.isPlaying = false;
    }

    function volUpSong() {
      socket.emit('song:vol', {volume:$scope.volume + 10}, function(data) {
        $scope.volume = data.volume;
      });     
    }

    function volDnSong() {
      socket.emit('song:vol', {volume:$scope.volume - 10}, function(data) {
        $scope.volume = data.volume;
      });
    }

    ///////////////////    
    // var url = 'http://10.0.0.223:3001/';
    // $scope.gpioPins  = [0,1,2,3,4];
    // $scope.gpioModes = ["output", "pwm"];
    // $scope.pin       = { id:"0", mode:"output", pwm:0, status:0 };
    // $scope.pwmValues = [ 0,10,20,30,40,50,60,70,80,90,100 ];
    // $scope.pwmVal    = 0;
    
    // toggleLed(0);

    // $scope.toggleLed = toggleLed;
    // $scope.update    = update;

    // GPIO functions
    // function toggleLed(status) { 
    //   $scope.pin.status = status;
    //   if(status){
    //     $scope.pin.pwm = 100;
    //   } else {
    //     $scope.pin.pwm = 0;
    //   }
    //   update();
    // };

    // function update() {
    //   $scope.pin.pwm = parseInt($scope.pin.pwm);
    //   if($scope.pin.pwm === 0) {
    //     $scope.pin.status = 0;
    //   } else {
    //     $scope.pin.status = 1;
    //   }
    //   var led = $resource(url + "\led");
    //   led.save({pin:$scope.pin});
    // };


  });
