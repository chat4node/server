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

var express = require('express');
var app = express();
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongo = require('mongodb').MongoClient;

var settings = {
	"mongodb" : 'localhost',
	"port" : process.env.PORT || 8081,
	"documentRoot" : __dirname,
};

var mongodb = null;
mongo.connect('mongodb://' + settings.mongodb + '/chat4node', function(err, db) {
	if (err)
		console.err(err);
	mongodb = db;
});	


server.listen(settings.port);

app.use(express.static(path.join(__dirname, 'public')));
app.get('/', function(req, res) {
	res.sendFile(__dirname + '/public/index.html');
});


function verifyAdminRights(user) {
	return true;
}

function poll() {
//	if (socket)
//		socket.emit('news', { test: 2 });
//	setTimeout(poll, 100);
}

io.on('connection', function(socket) {
	var user = null;

	socket.emit('welcome', { 'item1' : '2'} );

	socket.on('admin', function(data) {
		if (!verifyAdminRights(user))
			socket.emit('admin', { action : data.action, status : 'fail' });
		else {
			switch (data.action) {
				case 'editUser':
					break;
				case 'listGroups':
					break;
				case 'listUsers':
					mongodb.collection('users').find({}).toArray(function(err, docs) {
						if (!err)
							socket.emit('admin', { action : 'listUsers', status : 'ok', users : docs });
					});
					break;
			}
		}
	});

	socket.on('disconnect', function() {
		if (user)
			console.log(user.username + ' disconnected');
	});

	socket.on('login', function(data) {
		var collection = mongodb.collection('users');
		collection.find({ 'username' : data.username }).toArray(function(err, docs) {					
			if (err) {
				socket.emit('chaterror', { 'message' : 'Some error' });
			}
			else if (docs.length == 1) {
				if (data.password == docs[0].password) {
					user = docs[0];

					socket.emit('login', { status: 'ok'} );
					mongodb.collection('connections').deleteMany({ 'username' : data.username }, function(err, res) {
						console.log('Add new entry');
						mongodb.collection('connections').insert( {'username' : data.username, 'id' : this } );
					});
				}
				else {
					socket.emit('login', { status: 'failed', message: 'Bad Username / Password' } );
				}
			}
			else {
				socket.emit('login', { status : 'failed' });				
			}
		});
	});
});

//setTimeout(poll, 1000);
