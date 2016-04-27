module.exports = function(io) {
	var express = require('express');
	var router = express.Router();

	var wpi = require('wiring-pi');
	wpi.setup('wpi');

	var omx = require('omxdirector');
	var fs = require('fs');

	var pin = 0; 

	var status = 0;
	var currentSong = "";
	omx.setVideoDir('/home/pi/webapp/songs');
	io.on('connection', function(socket){
	  console.log('a user connected');
		fs.readdir('./songs/', function (err, files) {
		  if (err) console.error(err);
  	  socket.emit('songs', {files : files});
		});

	  socket.on('song:status', function(data,fn) {
	  	fs.readdir('./songs/', function (err, files) {
		  	if (err) console.error(err);
	  		fn({files:files, status:omx.getStatus()});
	  	});
	  });

	  socket.on('song:play', function(data,fn) {
	  	if(omx.isLoaded()) { 
	  		if(!omx.isPlaying()) {
	  			if(data.song === currentSong) {
	  				omx.play();
	  			} else {
	  				omx.stop();
						omx.play(data.song, {audioOutput: 'local'});
						currentSong = data.song;
	  			}
	  		} else {
  				omx.stop();
					omx.play(data.song, {audioOutput: 'local'});
					currentSong = data.song;
	  		}
	  	} else {
				omx.play(data.song, {audioOutput: 'local'});
				currentSong = data.song;
			}
			fn(data);
	  });

	  socket.on('song:stop', function(data) {
			omx.stop();
	  });

	  socket.on('song:pause', function(data) {
	  	console.log("Pausing");
			omx.pause();
	  });

	  socket.on('vol:up', function(data) {
			omx.volup();
	  });

	  socket.on('vol:down', function(data) {
			omx.voldown();
	  });

	});	

	// PWM
	router.post('/led',function(req,res){
		pin = req.body.pin;
		id = parseInt(pin.id);
		if(pin.mode === 'output'){
			wpi.pinMode(id, wpi.OUTPUT);
			wpi.digitalWrite(id, parseInt(pin.status));
		} else {
			wpi.softPwmCreate(id, 0, 100);
			wpi.softPwmWrite(id, parseInt(pin.pwm));
		}
		res.send(JSON.stringify({ 'pin': pin }));;
	});

	router.get('/songs', function(req, res, next) {
		// omx.play('example.mp3', {audioOutput: 'local'});
		fs.readdir('./songs/', function (err, files) {
		  if (err) return console.error(err);
		  res.send(files);
		});
	});

	router.get('/songs/:action/:song', function(req, res, next) {
		omx.stop();
		if(req.params.action === 'stop') {
			omx.stop();
		}
		else if(req.params.action === 'play') {
			setTimeout(function() {
				omx.play(req.params.song, {audioOutput: 'local'});
			}, 1000);
		}
		res.send(JSON.stringify({song: req.params.song}));
	});
	return router;
}
