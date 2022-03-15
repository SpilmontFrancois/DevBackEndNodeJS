var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var suiviCommandeService = require('./routes/suiviCommandeService')
var authService = require('./routes/authService')

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/commandes', suiviCommandeService)
app.use('/auth', authService)
app.use('/', indexRouter);

module.exports = app;
