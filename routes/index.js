module.exports = function(io) {
    var express = require('express');
    var router = express.Router();
    var MPlayer = require('mplayer');
    var _ = require('underscore');
    var path = require('path');
    var fs = require('fs');

    var getMp3 = function(file) {
        return (path.extname(file) === '.mp3')
    };
    var getPls = function(file) {
        return (path.extname(file) === '.pls')
    };
    var currentSong = null;
    var currentFm = null;

    var player = new MPlayer({
        verbose: false,
        debug: false
    });

    io.on('connection', function(socket) {
        console.log('a user connected @ ' + socket.id);
        fs.readdir('./songs/', function(err, files) {
            if (err) console.error(err);
            mp3Files = _.filter(files, getMp3);
            plsFiles = _.filter(files, getPls);
            io.sockets.emit('song:stats', {
                mp3: mp3Files,
                pls: plsFiles,
                playing: currentSong,
                fm: currentFm
            });
        });

        ////// Emit status of player on events
        player.on('status', function(data) {
            socket.emit('player:status', {
                status: data
            });
            if (data.title) currentSong = data.title;
        });

        ////// Play provided track
        socket.on('song:play', function(data) {
            currentSong = null;
            player.volume(data.volume);
            file = '/home/pi/webapp/songs/' + data.song;
            if (path.extname(file) === '.pls') {
                player.openPlaylist(file, {
                    cache: 128,
                    cacheMin: 1
                });
                currentFm = data.song;
            } else {
                player.openFile(file);
                currentSong = data.song;
                currentFm = null;
            }
        });

        ////// Stop playing current track
        socket.on('song:stop', function(data) {
            player.stop();
            currentSong = null;
            currentFm = null;
        });

        ////// Volume control
        socket.on('song:vol', function(data, fn) {
            if (data.volume < 0) data.volume = 0;
            if (data.volume > 100) data.volume = 100;
            player.volume(data.volume);
            fn(data);
        });

        socket.on('disconnect', function() {
            console.log('User disconnected @ ' + socket.id);
        });

        ////// Send list of files
        setInterval(function() {
            fs.readdir('./songs/', function(err, files) {
                if (err) console.error(err);
                mp3Files = _.filter(files, getMp3);
                plsFiles = _.filter(files, getPls);
                io.sockets.emit('song:stats', {
                    mp3: mp3Files,
                    pls: plsFiles,
                    playing: currentSong,
                    fm: currentFm
                });
            });
        }, 3000);
    });

    // var wpi = require('wiring-pi');
    // wpi.setup('wpi');
    // var omx = require('omxdirector');	
    // var pin = 0; 
    // var status = 0;
    // PWM
    // router.post('/led',function(req,res){
    // 	pin = req.body.pin;
    // 	id = parseInt(pin.id);
    // 	if(pin.mode === 'output'){
    // 		// wpi.pinMode(id, wpi.OUTPUT);
    // 		// wpi.digitalWrite(id, parseInt(pin.status));
    // 	} else {
    // 		// wpi.softPwmCreate(id, 0, 100);
    // 		// wpi.softPwmWrite(id, parseInt(pin.pwm));
    // 	}
    // 	res.send(JSON.stringify({ 'pin': pin }));;
    // });

    return router;
}