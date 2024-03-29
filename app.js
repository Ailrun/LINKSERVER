var express = require('express');
var path = require('path');
var logger = require('morgan');
var bodyParser = require('body-parser');

var boxList = require('./routes/boxList');
var boxOfUsrList = require('./routes/boxOfUsrList');
var goodList = require('./routes/goodList');
var urlList = require('./routes/urlList');
var urlOfBoxList = require('./routes/urlOfBoxList');
var usrList = require('./routes/usrList');
var push = require('./routes/push');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/boxOfusrlist', boxOfUsrList);
app.use('/boxList', boxList);
app.use('/goodList', goodList);
app.use('/urlList', urlList);
app.use('/urlOfboxlist', urlOfBoxList);
app.use('/usrList', usrList);
app.use('/push', push);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
