var express = require('express');
var gcm = require('node-gcm');
var mysql = require('mysql');
var router = express.Router();

var server_api_key = 'AIzaSyDFpvBEzqfKIaVsBgLYPFvnTUN-MFU9qf8';
var sender = new gcm.Sender(server_api_key);

var connection =  mysql.createConnection({
  'host' : 'aws-rds-linkbox.cjfjhr6oeu3e.ap-northeast-1.rds.amazonaws.com',
  'user' : 'LINKBOX',
  'password' : 'dlrpqkfhdnflek',
  'database' : 'LINKBOX'
});

const checkRegisterQuery = ('SELECT usrID, pushToken\
                            FROM usrList;');
router.get('/register/all', function(req, res, next) {
  connection.query(checkRegisterQuery, function(error, tokenList) {
    if (error != undefined) {
      res.status(503).json({
//        'result' : false,
        'message' : 'there is some error in get push token'
      });
    }
    else {
      res.json({
        'result' : true,
        'object' : tokenList
      });
    }
  });
});

const registerQuery = ('UPDATE usrList\
                       SET pushToken=?\
                       WHERE usrID=?;');
router.get('/register/:usrKey/:token', function(req, res, next) {
  var token = req.params.token;
  var usrKey = req.params.token;
  connection.query(registerQuery, [token, usrKey], function(error, insertInfo) {
    if (error != undefined) {
      res.status(503).json({
//        'result' : false,
        'message' : 'there is some error in register token'
      });
    }
    else {
      res.json({
        'result' : true
      });
    }
  });
});

const boxInviteQuery = ('SELECT pushToken\
                     FROM usrList\
                     WHERE usrID=?;');
router.post('/message/:usrKey/:boxKey/boxInvite', function(req, res, next) {
  var invitingUsrKey = req.params.usrKey;
  var invitingBoxKey = req.params.boxKey;
  var invitedUsrID = req.body.usrID;
  connection.query(boxInviteQuery, [invitedUsrID], function(error, pushTokenList) {

  });
});

const urlAddedQuery = ('SELECT pushToken\
                       FROM usrList\
                       WHERE usrKey IN\
                       (SELECT usrKey\
                       FROM boxOfUsrList\
                       WHERE boxKey=?);');
router.post('/message/:usrKey/:boxKey/urlAdded', function(req, res, next) {
  var boxKey = req.params.boxKey;
  connection.query(urlAddedQuery, function(error, pushTokenList) {

  });
});

router.get('/message', function(req, res, next) {
  res.render('send');
});

router.post('/message', function(req, res, next) {
  var message = new gcm.Message({
    collapseKey: 'demo',
    delayWhileIdle: true,
    timeToLive: 3,
    data: {
      title: req.body.title,
      message: req.body.message
    }
  });

  sender.send(message, registrationIds, 4, function (err, result) {
    console.log(result);
  });

  res.status(200).send("Message Sent !!");
});

module.exports = router;
