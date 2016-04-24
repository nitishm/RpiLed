var express = require('express');
var router = express.Router();

var wpi = require('wiring-pi');
wpi.setup('wpi');

var pin = 0; 

var status = 0;

module.exports = router;
/* GET home page. */
router.get('/', function(req, res, next) {
  res.sendfile('app/index.html');
});

router.get('/led', function(req, res, next) {
	res.send(JSON.stringify({ 'led': status }));
});

router.post('/led',function(req,res){
	wpi.pinMode(pin, wpi.OUTPUT);	
	status = req.body.status;
	wpi.digitalWrite(pin, parseInt(status));
	res.send(JSON.stringify({ 'led': status }));
});

// PWM
router.post('/led/pwm',function(req,res){
	wpi.softPwmCreate(pin, 0, 100);
	pwm = req.body.pwm;
  wpi.softPwmWrite(pin, parseInt(pwm));
	res.send(JSON.stringify({ 'pwmVal': pwm }));
});

module.exports = router;
