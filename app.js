var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var fileUpload = require("express-fileupload")

var userRouter = require('./routes/user');
var adminRouter = require('./routes/admin');
const { engine } = require('express-handlebars'); // Import engine function
const db=require('./config/connection')
var session=require('express-session')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Register Handlebars engine with configuration
app.engine('hbs', engine({
    extname: 'hbs',
    defaultLayout: 'layout',
    layoutsDir: __dirname + '/views/layout/',
    partialsDir: __dirname + '/views/partials/'
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(fileUpload())
app.use(session({secret:'key',cookie:{maxAge:600000}}))

db.connect((err)=>{
    if(err) console.log('database connection error');
    else console.log('database connected');

})

app.use('/', userRouter);
app.use('/admin', adminRouter);

// ... rest of your code (error handling, etc.)

module.exports = app;
