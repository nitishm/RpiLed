// var Mplayer = require('node-mplayer'); 
var fs = require('fs');
var _ = require('underscore');
var path = require('path');
var Mpg = require('mpg123');
var player = new Mpg();

var file = '/home/pi/webapp/songs/nutcrackershort.mp3';
player.play(file);
// player.play('http://playerservices.streamtheworld.com/api/livestream-redirect/ARNCITY_SC');
// player.on('track', function(data) {
// 	if(data.indexOf('title') !== -1)
// 	{
// 		info.title = data.split(':')[1];
// 		// console.log(data);
// 	}
// 	if(data.indexOf('StreamTitle') !== -1)
// 	{
// 		info.title = data.split('=')[1];
// 		// console.log(data);
// 	}
// 	if(data.indexOf('artist') !== -1)
// 	{
// 		info.artist = data.split(':')[1];
// 		// console.log(data);
// 	}
// 	if(data.indexOf('album') !== -1)
// 	{
// 		info.album = data.split(':')[1];
// 		// console.log(data);
// 	}
// 	// console.log(data.split(':')[1]);
// 	// track = data.split('=')[1];
// 	// if(track)
// 	// 	console.log(track);
// });

// player.on('volume', function(data) {
// 	console.log("Volume : " + data);
// });

// player.on('info', function(data) {
// 	console.log(data);
// });

player.on('end', function() {
	// info.file = ''
	// player.play('http://playerservices.streamtheworld.com/api/livestream-redirect/ARNCITY_SC');
	console.log("Stopped");
});

// setTimeout(function() {
// 	player.volume(30);
// 	setTimeout(function(){
// 		player.volume(100);
// 		// console.log(info);
// 		setTimeout(function() {
// 			player.stop();
// 		}, 5000);
// 		// player.stop();
// 		// player.play('/home/pi/webapp/songs/Duaa.mp3');
// 	}, 2000);	
// }, 2000);
// var getMp3 = function(file) {
//     return (path.extname(file) === '.mp3')
// };

// // load the library
// var taglib = require('taglib');
// // synchronous API
// fs.readdir('./songs/', function(err, files) {
//     if (err) console.error(err);
//     current.mp3 = _.filter(files, getMp3);             
// });

// var tag = taglib.tagSync(path);

// var player = new Mplayer();
// player.setFile('/home/pi/webapp/songs/EDM.pls');
// player.play({volume: 50, playlist: 1});
// // player.getUrlFromPlaylist('/home/pi/webapp/songs/DubaiCityFm.pls', function(data) {
// // 	player.setFile(data);
// // 	player.play();
// // });

// // setInterval(function() {
// // 	// player.getTitle(function(data) {
// // 	// 	console.log(data);
// // 	// });

// // 	// player.getArtist(function(data) {
// // 	// 	console.log('Artist - ' + data);
// // 	// });

// // 	// player.getAlbum(function(data) {
// // 	// 	console.log('Album - ' + data);
// // 	// });
// // }, 1000);

// // setTimeout(function() {
// // 	player.getUrlFromPlaylist('/home/pi/webapp/songs/EDM.pls', function(data) {
// // 		player.setFile(data);
// // 		player.play();
// // 	});
// // }, 3000);

// // setTimeout(function() {
// // 	player.setFile('/home/pi/webapp/songs/nutcrackershort.mp3');
// // 	player.play();
// // }, 6000);

// // setInterval(function() {
// // 	if(player)
// // 		console.log(player.checkPlaying());
// // }, 1000);

// player.on('title', function(data) {
// 	console.log(data);
// });

// player.on('artist', function(data) {
// 	console.log(data);
// });

// player.on('endplay', function() {
// 	console.log('end');
// });
