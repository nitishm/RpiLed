module.exports = function(io) {
    var express = require('express');
    var router = express.Router();
    var Mplayer = require('node-mplayer'); 
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
    var volume = 50;
    var playlist = [];

    var player = new Mplayer();

    io.on('connection', function(socket) {
        console.log('a user connected @ ' + socket.id);
        
        fs.readdir('./songs/', function(err, files) {
            if (err) console.error(err);
            mp3Files = _.filter(files, getMp3);
            plsFiles = _.filter(files, getPls);
            player.getVolume(function(data) {
                volume = data;
            })
            io.sockets.emit('player:status', {
                mp3: mp3Files,
                pls: plsFiles,
                volume: volume,
            });
        });

        setInterval(function(){
            console.log(player.checkPlaying());
        }, 1000);
        
        socket.on('player:play', function(data) {
            file = '/home/pi/webapp/songs/' + data.file;
            if (path.extname(file) === '.pls') {

            } else {
                player.setFile(file);
                player.play({volume: 50});
            }
        });

        player.on('end', function() {
            console.log("Ending");
        })
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