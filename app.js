var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
const session = require('express-session');
const flash = require('express-flash');
var logger = require('morgan');
var initializePassport = require('./auth');
var passport = require('passport');
initializePassport(passport);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: true,
  cookie: { 
    secure: false, // This will only work if you have https enabled!
  maxAge: 60*60*1000
 }
}));
// app.use(session({

//   secret: 'secret',
//   resave: false,
//   saveUninitialized: false,
// }));

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


app.use(logger('dev'));
app.use(passport.initialize());
app.use(passport.session())
app.use(flash());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
const db = require('./models');
db.sequelize.sync()
.then(()=> {
    console.log("async db");
})
.catch((err)=> {
    console.log("error: "+ err.message);
})

app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  res.render('404', { title: '404' });
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
