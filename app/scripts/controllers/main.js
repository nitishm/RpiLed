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
        $scope.firstLoad = true;
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
            if(!data.fm)
                $scope.currentSong = data.file;
            if(data.fm) {
                $scope.currentFm = data.file;
                $scope.isFm = true;
            } else {
                $scope.isFm = false;
            }
            $scope.playlist = data.playlist;
            $scope.isPlaylist = data.isPlaylist;
            $scope.firstLoad = false;
        });

        socket.on('player:info', function(data) {
            // console.log(data);
            if(data.title) {
                $scope.currentSong = data.title;
            } 
            $scope.currentArtist = data.artist;
            $scope.currentAlbum = data.album;
            $scope.progress = data.completed;
        });

        socket.on('player:next', function() {
            if($scope.isPlaylist)
                startPlaylist();
        });

        // Functions
        $scope.playSong = playSong;
        $scope.stopSong = stopSong;
        $scope.pauseSong = pauseSong;

        $scope.volUpSong = volUpSong;
        $scope.volDnSong = volDnSong;
        $scope.volMuteSong = volMuteSong;
        
        $scope.addToPlaylist = addToPlaylist;
        $scope.removeFromPlaylist = removeFromPlaylist;
        $scope.startPlaylist = startPlaylist;
        $scope.clearPlaylist = clearPlaylist;
        $scope.shufflePlaylist = shufflePlaylist;
        $scope.updatePlaylist = updatePlaylist;

        function playSong(song, isPlaylist) {
            socket.emit('player:play', {song:song, playlist:isPlaylist});
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
            updatePlaylist();
        }

        function removeFromPlaylist(song) {
            var index = $scope.playlist.indexOf(song);
            if (index >= 0) {
                $scope.playlist.splice( index, 1 );
                updatePlaylist();
            }
        }

        function startPlaylist() {
            var next = $scope.playlist.pop();
            console.log("starting playlist with song : " + next);
            playSong(next, true);
            updatePlaylist();
        }

        function clearPlaylist() {
          $scope.playlist = [];
          updatePlaylist();
        }

        function shufflePlaylist() {
          $scope.playlist = _.shuffle($scope.playlist);
          updatePlaylist();
        }

        function updatePlaylist() {
            socket.emit('playlist:update', $scope.playlist);
        }
    });