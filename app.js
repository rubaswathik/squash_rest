var express = require('express');
var app 	= express();
global.__root   	= __dirname + '/';
global.__core		=	'../core/src/';
global.__db_model 	=	require(__core+'db/model');

app.get('/api', function (req, res) {
  res.status(200).send('API works.');
});

var AuthController = require(__root + 'auth/AuthController');
app.use('/api/auth', AuthController);

var UserController = require(__root + 'user/UserController');
app.use('/api/user', UserController);

var AnnouncementController = require(__root + 'announcement/AnnouncementController');
app.use('/api/announcement', AnnouncementController);

module.exports = app;
