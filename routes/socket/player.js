module.exports = function(io) {
    var express = require('express');
    var router = express.Router();
    var MPlayer = require('mplayer');
    var _ = require('underscore');
    var path = require('path');
    var fs = require('fs');
    var chokidar = require('chokidar');
    var id3 = require('id3js');
    
    var masterClient;

    var getMp3 = function(file) {
        return (path.extname(file) === '.mp3')
    };
    var getPls = function(file) {
        return (path.extname(file) === '.pls')
    };

    var updateStats = function(io) {
        fs.readdir('./songs/', function(err, files) {
            if (err) console.error(err);
            current.mp3 = _.filter(files, getMp3);             
            current.pls = _.filter(files, getPls);
            io.sockets.emit('song:stats', {
                mp3: current.mp3,
                pls: current.pls,
                playing: current.song,
                album: current.album,
                artist: current.artist,
                fm: current.fm,
                volume: current.volume,
                playlist: current.playlist
            });
        });
    }

    var watcher = chokidar.watch('./songs/', {
        persistent: true
    });

    var current = {
        mp3: [],
        pls: [],
        album: null,
        artist: null,
        fm: null,
        volume: 50,
        playlist: []
    }

    var player = new MPlayer({
        verbose: false,
        debug: false
    });
    
    var startTime = Date.now();

    io.on('connection', function(socket) {
        console.log('a user connected @ ' + socket.id);
        if(!masterClient) masterClient = socket.id;
        socket.send(socket.id);
        updateStats(io);

        ////////// Handle MPlayer events //////////

        player.on('status', function(data) {
            io.sockets.emit('player:status', {
                status: data
            });
            if (data.title) current.song = data.title;
            updateStats(io);
        });

        player.on('stop', function(id) {
            console.log("Stop called by " + id);
            if(socket.id === id)
                io.sockets.emit('song:next', {id: id});
            updateStats(io);
        });

        ////////// Handle Socket Events //////////
        
        ////// Play fm or track
        socket.on('song:play', function(data) {
            file = '/home/pi/webapp/songs/' + data.song;
            if (path.extname(file) === '.pls') {
                player.openPlaylist(file, {
                    cache: 128,
                    cacheMin: 1
                });
                current.song = null;
                current.title = null;
                current.album = null;
                current.artist = null;
                current.fm = data.song;
            } else {
                player.openFile(file);
                current.fm = null;
                id3({ file: file, type: id3.OPEN_LOCAL }, function(err, tags) {
                    if(tags) {
                        current.album = tags.v2.album;
                        current.artist = tags.v2.artist;
                    }
                });
                current.song = data.song;
            }
            updateStats(io);
        });

        ////// Stop playing current track
        socket.on('song:stop', function(data) {
            player.stop(masterClient);
            current.song = null;
            current.fm = null;
            updateStats(io);
        });

        socket.on('song:pause', function() {
            player.pause();
        });
        
        ////// Volume control
        socket.on('song:vol', function(data, fn) {
            if (data.volume === 'up') {
                current.volume = current.volume + 10;
                if (current.volume > 100) current.volume = 100;
            }
            if (data.volume === 'down') {
                current.volume = current.volume - 10;
                if (current.volume < 0) current.volume = 0;
            }
            if (data.volume === 'mute') {
                current.volume = 0;
            }
            player.volume(current.volume);
            updateStats(io);
        });

        ////// Update playlist to sync with all clients
        socket.on('song:playlist', function(data) {
            current.playlist = data.playlist;
            updateStats(io);
        });

        ////// Log disconnection
        socket.on('disconnect', function() {
            console.log('User disconnected @ ' + socket.id);
            if(masterClient == socket.id) masterClient = null;
        });

        ////////// Handle Chokidar events for file changes //////////

        watcher.on('add', function(data) {
            console.log("Added");
            updateStats(io);
        });
        watcher.on('unlink', function(data) {
            console.log("Unlinked");
            updateStats(io);
        });
        watcher.on('change', function(data) {
            console.log("changed");
            updateStats(io);
        });
        ////////// Repeated tasks //////////

        ////// Send list of files
        // setInterval(function() {
        //     player.volume(current.volume);
        //     io.sockets.emit('song:stats', {
        //         playing: current.song,
        //         album: current.album,
        //         artist: current.artist,
        //         fm: current.fm,
        //         volume: current.volume,
        //         playlist: current.playlist
        //     });
        // }, 500);
    });

    // var wpi = require('wiring-pi');
    // wpi.setup('wpi');
    // var omx = require('omxdirector');    
    // var pin = 0; 
    // var status = 0;
    // PWM
    // router.post('/led',function(req,res){
    //  pin = req.body.pin;
    //  id = parseInt(pin.id);
    //  if(pin.mode === 'output'){
    //      // wpi.pinMode(id, wpi.OUTPUT);
    //      // wpi.digitalWrite(id, parseInt(pin.status));
    //  } else {
    //      // wpi.softPwmCreate(id, 0, 100);
    //      // wpi.softPwmWrite(id, parseInt(pin.pwm));
    //  }
    //  res.send(JSON.stringify({ 'pin': pin }));;
    // });

    return router;
}