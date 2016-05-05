module.exports = function(io) {
    var express = require('express');
    var router = express.Router();
    var Mpg = require('mpg123');
    var _ = require('underscore');
    var path = require('path');
    var fs = require('fs');
    var chokidar = require('chokidar');
    var id3 = require('id3js');
    var master = null;
    var connectedClients = [];

    var removeClient = function(id) {
        if(connectedClients.length) {
            var index = connectedClients.indexOf(id);
            if (index >= 0) {
                connectedClients.splice( index, 1 );
                console.log('User disconnected @ ' + id);
            }
        }
    }

    var addClient = function(id) {
        console.log('Total users connected @ ');
        connectedClients.push(id);
        console.log(connectedClients);
    }

    var getMp3 = function(file) {
        return (path.extname(file) === '.mp3')
    };
    var getPls = function(file) {
        return (path.extname(file) === '.pls')
    };

    var getUrl = function(filename, callback) {
        fs.readFile(filename, function read(err, data) {
            if (err) {
                throw err;
            }
            data = data.toString();
            content = data.match(/File.*=(.*)/)[1];
            callback(content);
        });
    }

    var updateStats = function(io) {
        fs.readdir('./songs/', function(err, files) {
            if (err) console.error(err);
            current.mp3 = _.filter(files, getMp3);             
            current.pls = _.filter(files, getPls);
            io.sockets.emit('current:info', {
                mp3: current.mp3,
                pls: current.pls,
                volume: current.volume,
                playing: current.playing,
                paused: current.paused,
                file: current.file,
                fm: current.fm,
                playlist: current.playlist,
                isPlaylist: current.isPlaylist
            });
        });
    }
    
    ////////// Handle Chokidar events for file changes //////////
    var watcher = chokidar.watch('./songs/', {
        persistent: true
    });

    watcher.on('add', function(data) {
        // console.log("Added");
        updateStats(io);
    });
    watcher.on('unlink', function(data) {
        // console.log("Unlinked");
        updateStats(io);
    });
    watcher.on('change', function(data) {
        // console.log("changed");
        updateStats(io);
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

    var player = new Mpg();

    player.on('pause', function() {

    });

    player.on('end', function() {
        io.to(connectedClients[0]).emit('player:next');        
        current.playing = false;
        current.paused = false;
        updateStats(io);
    });

    player.on('volume', function(data) {
        updateStats(io);
    });

    player.on('info', function(data) {
        // console.log(data);
        io.sockets.emit('player:info', data);
    });

    io.on('connection', function(socket) {
        addClient(socket.id);
        updateStats(io);
        ////////// Handle MPlayer events //////////

        ////////// Handle Socket Events //////////
        
        ////// Play fm or track
        socket.on('player:play', function(data) {
            file = '/home/pi/webapp/songs/' + data.song;
            if (path.extname(file) === '.pls') {
                getUrl(file, function(data) {
                    player.play(data);
                    current.fm = true;
                });
            } else {
                player.play(file);
                current.fm = false;
            }
            if(data.playlist)
                current.isPlaylist = true;
            else
                current.isPlaylist = false;
            current.playing = true;
            current.paused = false;
            current.file = data.song;
            updateStats(io);
        });

        ////// Stop playing current track
        socket.on('player:stop', function() {
            if(current.playing) {
                player.stop();
            }
            current.playing = false;
            current.paused = false;
            current.isPlaylist = false;
        });

        socket.on('player:pause', function(data) {
            if(current.playing){
                player.pause();
                current.paused = !current.paused;
                updateStats(io);
            }
        });

        ////// Volume control
        socket.on('player:vol', function(data) {
            if(data === 'up') {
                current.volume = current.volume + 5;
                if(current.volume > 100) current.volume = 100;
            } else if(data === 'down') {
                current.volume = current.volume - 5;
                if(current.volume < 0) current.volume = 0;
            } else {
                current.volume = 0;
            }
            player.volume(current.volume);
        });

        ////// Update playlist to sync with all clients
        socket.on('playlist:update', function(data) {
            current.playlist = data;
            updateStats(io);
        });

        ////// Log disconnection
        socket.on('disconnect', function() {
            removeClient(socket.id);
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