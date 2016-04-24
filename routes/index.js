var express = require('express');
var router = express.Router();

var wpi = require('wiring-pi');
wpi.setup('wpi');

var pin = 0; 

var status = 0;

module.exports = router;

// PWM
router.post('/led',function(req,res){
	pin = req.body.pin;
	id = parseInt(pin.id);
	if(pin.mode === 'output'){
		console.log("output");
		wpi.pinMode(id, wpi.OUTPUT);
		wpi.digitalWrite(id, parseInt(pin.status));
	} else {
		console.log("pwm");
		wpi.softPwmCreate(id, 0, 100);
		wpi.softPwmWrite(id, parseInt(pin.pwm));
	}
	res.send(JSON.stringify({ 'pin': pin }));;
});

module.exports = router;
