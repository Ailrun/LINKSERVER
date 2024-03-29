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
router.post('/register/:usrKey', function(req, res, next) {
  var usrKey = req.params.usrKey;
  var token = req.body.nameValuePairs.token;
  console.log(req.body.nameValuePairs.token);
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

const boxInviteURL = '/message/:usrKey/:boxKey/boxInvite';
const boxInviteQuery = ('SELECT U1.usrName, BofU.boxName, U2.pushToken\
                        FROM usrList U2\
                        JOIN usrList U1 ON U1.usrKey=?\
                        JOIN boxOfUsrList BofU ON BofU.boxKey=?\
                        AND BofU.usrKey=U1.usrKey\
                        WHERE U2.usrID=?;');
function boxInvite(req, res, next) {
  var invitingUsrKey = req.params.usrKey;
  var invitingBoxKey = req.params.boxKey;
  var invitedUsrID = req.body.usrID;
  var queryParams = [invitingUsrKey, invitingBoxKey, invitedUsrID];
  connection.query(boxInviteQuery, queryParams, function(error, inviteData) {
    if (error != undefined) {
      res.status(503).json({
//        'result' : false,
        'message' : 'there is some error in box inviting'
      });
      console.log(error);
    }
    else {
      var message = new gcm.Message({
        collapseKey: 'LinkBox',
        delayWhileIdle: true,
        timeToLive: 3,
        data: {
          result : true,
          object : {
            type : "boxInvite",
            usrName : inviteData[0].usrName,
            boxName : inviteData[0].boxName,
            message : req.body.message
          }
        }
      });

      sender.send(message, inviteData[0].pushToken, 4, function (err, result) {
        console.log(result);
      });

      res.status(200).send("Message Sent !!");
    }
  });
}
router.post(boxInviteURL, boxInvite);

const urlAddedURL = '/message/:usrKey/:boxKey/urlAdded';
const urlAddedQuery = ('SELECT U1.usrName, BofU1.boxName, U2.pushToken\
                       FROM usrList U2\
                       JOIN usrList U1 ON U1.usrKey=?\
                       JOIN boxOfUsrList BofU1 ON BofU1.boxKey=?\
                       AND BofU1.usrKey=U2.usrKey\
                       WHERE EXISTS\
                       (SELECT 1\
                       FROM boxOfUsrList BofU\
                       WHERE BofU.boxKey=?\
                       AND BofU.usrKey=U2.usrKey);');
function urlAdded(req, res, next) {
  var invitingUsrKey = req.params.usrKey;
  var invitingBoxKey = req.params.boxKey;
  var queryParams = [invitingUsrKey, invitingBoxKey];
  connection.query(urlAddedQuery, queryParams, function(error, inviteData) {
    if (error != undefined) {
      res.json({
//        'result' : false,
        'message' : 'there is some error in broadcast url'
      });
    }
    else {
      var message = new gcm.Message({
        collapseKey: 'LinkBox',
        delayWhileIdle: true,
        timeToLive: 3,
        data: {
          result : true,
          object : {
            type : "urlAdded",
            urlName : req.body.urlName,
            inviteDatas : inviteData
          }
        }
      });
      sender.send(message, inviteData.pushToken, 4, function (error, result) {
        console.log(result);
      });
      res.status(200).send("Message Sent !!");
    }
  });
}
router.post(urlAddedURL, urlAdded);

const goodAddedURL = '/message/:usrKey/:urlKey';
const goodAddedQuery = ('');
function goodAdded(req, res, next) {
  var queryParams = [];
  connection.query(goodAddedQuery, queryParams, function(error, goodData) {
    if (error != undefined) {
      res.status(503).json({
//        'result' : false,
        'message' : 'there is some error in broadcast good'
      });
    }
    else {
      var message = new gcm.Message({
        collapseKey: 'LinkBox',
        delayWhileIdle: true,
        timeToLive: 3,
        data: {
          result : true,
          object : {
            type : 'goodAdded',
            urlName : req.body.urlName,
            inviteDatas : goodData
          }
        }
      });
      sender.send(message, goodData.pushToken, 4, function (error, result) {
        console.log(result);
      });
      res.status(200).send("Message Sent !!");
    }
  });
}

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

  sender.send(message, null, 4, function (err, result) {
    console.log(result);
  });

  res.status(200).send("Message Sent !!");
});

module.exports = router;
