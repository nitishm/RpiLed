'use strict';

/**
 * @ngdoc function
 * @name webappApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the webappApp
 */
angular.module('webappApp')
    .constant('_', window._)
    .controller('MainCtrl', function($resource, $scope, socket, _) {

        var getSongName = function(str) {
          if (str)
            return str.substring(str.lastIndexOf("/") + 1, str.length);
          else
            return str;
        }

        var updatePlaylist = function(socket, playlist) {
          socket.emit('song:playlist', {
            playlist: playlist,
          });
        }

        var isPlaylist = false;

        $scope.loading = true;

        $scope.isPlaying = false;
        $scope.fmPlaying = false;
        $scope.currentSong = null;
        $scope.currentFm = null;
        $scope.playlist = new Array();

        // Functions
        $scope.playSong = playSong;
        $scope.stopSong = stopSong;
        $scope.volUpSong = volUpSong;
        $scope.volDnSong = volDnSong;
        $scope.addToPlaylist = addToPlaylist;
        $scope.startPlaylist = startPlaylist;
        $scope.clearPlaylist = clearPlaylist;
        $scope.shufflePlaylist = shufflePlaylist;


        socket.on('song:stats', function(data) {
            // console.log(data);
            $scope.playlist = data.playlist;
            
            // Update songs and fm list
            if(data.mp3 || data.pls) {
                $scope.songs = data.mp3;
                $scope.fms = data.pls;
            }

            // Update current player status
            if (data.playing) {
              $scope.isPlaying = true;
              $scope.currentAlbum = data.album;
              $scope.currentArtist = data.artist;
            }
            else $scope.isPlaying = false;
            $scope.volume = data.volume;
            $scope.currentFm = data.fm;
            $scope.currentSong = data.playing;

            // Show song/fm list
            $scope.loading = false;
        });

        socket.on('player:status', function(data) {
            // console.log(data);
            $scope.currentSong = getSongName(data.status.filename);

            // Handle FM case
            if (data.status.title) {
                $scope.currentSong = data.status.title;
            }

            // Update playing status
            if (data.status.filename) {
                $scope.isPlaying = true;
            } else {
                $scope.isPlaying = false;
            }
        });

        socket.on('song:next', function() {
          startPlaylist();
        });

        function playSong(song, playlist) {
            isPlaylist = playlist;
            socket.emit('song:play', {
                song: song,
            });
            $scope.isPlaying = true;
        }

        function stopSong() {
            socket.emit('song:stop', {}, null);
            $scope.currentSong = null;
            $scope.currentFm = null;
            $scope.isPlaying = false;
        }

        function volUpSong() {
            socket.emit('song:vol', {
                volume: 'up'
            });
        }

        function volDnSong() {
            socket.emit('song:vol', {
                volume: 'down'
            });
        }

        function addToPlaylist(song) {
            $scope.playlist.unshift(song);
            updatePlaylist(socket, $scope.playlist);
        }

        function startPlaylist() {
            stopSong();
            var next = $scope.playlist.pop();
            console.log(next);
            if (next)
              playSong(next, true);
              updatePlaylist(socket, $scope.playlist);
        }

        function clearPlaylist() {
          $scope.playlist = [];
          updatePlaylist(socket, $scope.playlist);
        }

        function shufflePlaylist() {
          $scope.playlist = _.shuffle($scope.playlist);
          updatePlaylist(socket, $scope.playlist);
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