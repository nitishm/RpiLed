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

        $scope.loading = true;

        $scope.isPlaying = false;
        $scope.isPaused = false;
        $scope.fmPlaying = false;
        $scope.currentSong = null;
        $scope.currentFm = null;
        $scope.isPlaylist = false
        $scope.playlist = {};

        socket.on('current:info', function(data) {
            // console.log(data);
            $scope.songs = data.mp3;
            $scope.fms = data.pls;
            $scope.loading = false;
            $scope.volume = data.volume;
            $scope.isPlaying = data.playing;
            $scope.isPaused = data.paused;
            $scope.currentSong = data.file;
            if(data.fm) {
                $scope.currentFm = data.file;
                $scope.isFm = true;
            } else {
                $scope.isFm = false;
            }
        });

        socket.on('player:info', function(data) {
            console.log(data);
            if(data.title) {
                $scope.currentSong = data.title;
            } 
            $scope.currentArtist = data.artist;
            $scope.currentAlbum = data.album;
            $scope.progress = data.completed;
        });

        // Functions
        $scope.playSong = playSong;
        $scope.stopSong = stopSong;
        $scope.pauseSong = pauseSong;

        $scope.volUpSong = volUpSong;
        $scope.volDnSong = volDnSong;
        $scope.volMuteSong = volMuteSong;
        
        $scope.addToPlaylist = addToPlaylist;
        $scope.startPlaylist = startPlaylist;
        $scope.clearPlaylist = clearPlaylist;
        $scope.shufflePlaylist = shufflePlaylist;

        function playSong(song) {
            socket.emit('player:play', song);
            $scope.isPaused = false;
        }

        function stopSong() {
            socket.emit('player:stop');
            $scope.isPlaying = false;
            $scope.isPaused = false;
        }

        function pauseSong() {
            socket.emit('player:pause');
            $scope.isPaused = !$scope.isPaused;
        }
        function volUpSong() {
            socket.emit('player:vol', 'up');
        }

        function volDnSong() {
            socket.emit('player:vol', 'down');
        }

        function volMuteSong() {
            socket.emit('player:vol', 'mute');
        }

        function addToPlaylist(song) {
            $scope.playlist.unshift(song);
            // updatePlaylist(socket, $scope.playlist);
        }

        function startPlaylist() {

        }

        function clearPlaylist() {
          $scope.playlist = [];
          // updatePlaylist(socket, $scope.playlist);
        }

        function shufflePlaylist() {
          $scope.playlist = _.shuffle($scope.playlist);
          // updatePlaylist(socket, $scope.playlist);
        }
    });