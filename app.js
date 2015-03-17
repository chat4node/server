'use strict';

/*!
 * chat4node
 * Copyright(c) 2015 Barchart.com, Inc. All Rights Reserved.
 */

/*
 * The file is called app.js so that it conforms, more or
 * less, to the way AWS ElasticBeanstalk is set up.
 *
 * The important files in this folder are:
 * app.js (this file)
 * package.json (which contains all of the dependencies)
 * .gitignore
 */

/*
 * Core includes.
 */

var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var mongo = require('mongodb').MongoClient;

var user = null;
var socket = null;

var settings = {
	"port" : process.env.PORT || 8081,
	"documentRoot" : __dirname,
};

server.listen(settings.port);

app.get('/', function(req, res) {
	res.sendFile(__dirname + '/index.html');
});

function poll() {
//	if (socket)
//		socket.emit('news', { test: 2 });
//	setTimeout(poll, 100);
}

io.on('connection', function(s) {
	socket = s;

	socket.emit('welcome', { 'item1' : '1'} );

	socket.on('login', function(data) {
		mongo.connect('mongodb://localhost/chat4node', function(err, db) {
			if (err) {
				socket.emit('chaterror', {});
			}
			else {
				var collection = db.collection('users');
				collection.find({ 'username' : data.username }).toArray(function(err, docs) {					
					if (err) {
						socket.emit('chaterror', { 'message' : 'Some error' });
					}
					else if (docs.length == 0) {
						socket.emit('chaterror', { message : 'Bad login' });
					}
					else {
						user = docs[0];
						if (data.password == user.password) {
							db.collection('connections').deleteMany({ 'username' : data.username }, function(err, res) {
								console.log('Add new entry');
								db.collection('connections').insert( {'username' : data.username, 'id' : this } );
							});
						}
						else {
							socket.emit('chaterror', { message: 'Bar username/password'} );
						}
					}
				});
			}
		});
	});
});

//setTimeout(poll, 1000);
