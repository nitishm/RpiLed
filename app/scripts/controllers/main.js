'use strict';

/**
 * @ngdoc function
 * @name webappApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webappApp
 */
angular.module('webappApp')
  .controller('MainCtrl', function ($resource, $scope, socket) {
  	var url = 'http://10.0.0.223:3001/';
    var Songs = $resource(url +"songs/:action/:song", {song: "@song", action:"@action"});
    var StopSongs = $resource(url +"songs/stop");

    $scope.gpioPins  = [0,1,2,3,4];
    $scope.gpioModes = ["output", "pwm"];
    $scope.pin       = { id:"0", mode:"output", pwm:0, status:0 };
    $scope.pwmValues = [ 0,10,20,30,40,50,60,70,80,90,100 ];
    $scope.pwmVal    = 0;
    
    $scope.isPlaying = false;
    $scope.currentSong = null;

    $scope.toggleLed = toggleLed;
    $scope.update    = update;
    $scope.playSong  = playSong;
    $scope.stopSong  = stopSong;
    $scope.pauseSong = pauseSong;
    $scope.volUpSong = volUpSong;
    $scope.volDnSong = volDnSong;

    // setInterval(function() {
    //   stopSong();
    // }, 2000);

    // setTimeout(function() {
    //   stopSong();
    // }, 2000);

    toggleLed(0);

    // Songs.query(function(data) {
    //   $scope.songs = data;
    // });

    socket.on('songs', function (data) {
      $scope.songs = data.files;
      setInterval(function() {
        socket.emit('song:status', {}, function(data) {
          console.log(data);
        $scope.songs = data.files;
        if(data.status.playing) {
          $scope.currentSong = data.status.videos[0];
          $scope.isPlaying = true;
        }
      });
      }, 1000);
    });

    ///////////////////    

    function toggleLed(status) { 
      $scope.pin.status = status;
      if(status){
        $scope.pin.pwm = 100;
      } else {
        $scope.pin.pwm = 0;
      }
      update();
    };

    function update() {
      $scope.pin.pwm = parseInt($scope.pin.pwm);
      if($scope.pin.pwm === 0) {
        $scope.pin.status = 0;
      } else {
        $scope.pin.status = 1;
      }
      var led = $resource(url + "\led");
      led.save({pin:$scope.pin});
    };

    function playSong(song) {
      socket.emit('song:play', { song: song }, function(data) {
        $scope.currentSong = data.song;
      });     

      // Songs.get({ song: song, action: 'play'}).$promise.then(function(data) {
      //   $scope.currentSong = data.song;
      // });
      $scope.isPlaying = true;
    }

    function pauseSong() {
      socket.emit('song:pause', {}, null);     
      $scope.isPlaying = true;
    }

    function stopSong() {
      socket.emit('song:stop', {}, null);     
      // Songs.get({ song: $scope.currentSong, action: 'stop'}, function() {
      //   console.log("Sent request");
      // });
      $scope.isPlaying = false;
    }

    function volUpSong() {
      socket.emit('vol:up', {}, null);     
      // Songs.get({ song: $scope.currentSong, action: 'stop'}, function() {
      //   console.log("Sent request");
      // });
    }

    function volDnSong() {
      socket.emit('vol:down', {}, null);     
      // Songs.get({ song: $scope.currentSong, action: 'stop'}, function() {
      //   console.log("Sent request");
      // });
    }
  });
