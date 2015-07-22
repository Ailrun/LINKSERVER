var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
    'host' : 'aws-rds-linkbox.cjfjhr6oeu3e.ap-northeast-1.rds.amazonaws.com',
    'user' : 'LINKBOX',
    'password' : 'dlrpqkfhdnflek',
    'database' : 'LINKBOX'
});

var loginQuery = ('SELECT *\
                  FROM usrList\
                  WHERE usrID=? AND usrPassword=?;');
var login = function(req, res, next) {
    var usrID = req.body.usrID;
    var usrPassword = req.body.usrPassword;
    var querys = [usrID, usrPassword];
    connection.query(loginQuery, querys, function(error, cursor) {
        console.log(req.body);
        if (error != undefined) {
            res.status(503).json(
                'there is some error in login'
            );
            console.log(error);
        }
        else if (cursor.length > 0) {
            if (cursor[0].facebook == false) {
                res.json({
                    'result' : true,
                    'message' : 'SUCCESS',
                    'object' : cursor[0]
                });
            }
            else {
                res.json({
                    'result' : false,
                    'message' : 'FACEBOOK'
                });
            }
        }
        else {
            res.json({
                'result' : false,
                'message' : 'NOID'
            });
        }
    });
};
router.post('/login', login);

var signupQuery = ('SELECT *\
                   FROM usrList\
                   WHERE usrID=?;');
var signup = function(req, res, next) {
    var usrID = req.body.usrID;
    connection.query(signupQuery, [usrID], function(error, isAlreadyIn) {
        console.log(req.body);
        if (error != undefined) {
            res.status(503).json({
                'result' : false,
                'message' : 'there is some error in signup while checking ID'
            });
            console.log(error);
        }
        else if (isAlreadyIn.length == 0) {
            addUser(req, res, next);
        }
        else {
            res.json({
                'result' : false,
                'message' : 'ID'
            });
        }
    });
};
router.post('/signup', signup);

var addUserQuery = ('INSERT INTO usrList\
                    (usrID, usrPassword, usrName,\
                    usrProfile, premium, facebook)\
                    VALUES\
                    (?, ?, ?,\
                    ?, FALSE, FALSE);');
var addUser = function(req, res, next) {
    var usrID = req.body.usrID;
    var usrPassword = req.body.usrPassword;
    var usrName = req.body.usrName;
    var usrProfile = req.body.usrProfile;
    var querys = [usrID, usrPassword, usrName, usrProfile];
    connection.query(addUserQuery, querys, function(error, insertInfo) {
        console.log(req.body);
        if (error != undefined) {
            res.status(503).json({
                'result' : false,
                'message' : 'there is some error in signup while insert User'
            });
            console.log(error);
        }
        else {
            res.json({
                'result' : true,
                'message' : 'SUCCESS'
            });
        }
    });
};

var facebookQuery = ('SELECT *\
                     FROM usrList\
                     WHERE usrID=?;');
var facebook = function(req, res, next) {
    var queryParams = [req.body.usrID];
    connection.query(facebookQuery, queryParams, function(error, isAlreadyIn) {
        console.log(req.body);
        if (error != undefined) {
            res.status(503).json(
                'there is some error in facebook login while checking ID'
            );
            console.log(error);
        }
        else if (isAlreadyIn.length == 0) {
            facebookSignup(req, res, next);
        }
        else {
            facebookLogin(isAlreadyIn[0], res, next);
        }
    });
};
router.post('/facebook', facebook);

var facebookSignupQuery = ('INSERT INTO usrList\
                           (usrID, usrPassword, usrName,\
                           usrProfile, premium, facebook)\
                           VALUES\
                           (?, ?, ?,\
                           ?, FALSE, TRUE)');
var facebookSignup = function(req, res, next) {
    var usrID = req.body.usrID;
    var usrPassword = req.body.usrPassword;
    var usrName = req.body.usrName;
    var usrProfile = req.body.usrProfile;
    var queryParams = [usrID, usrPassword, usrName, usrProfile];
    connection.query(facebookSignupQuery, queryParams, function(error, insertInfo) {
        if (error != undefined) {
            res.status(503).json(
                'there is some error in facebook insert User'
            );
            console.log(error);
        }
        else {
            req.body.usrKey = insertInfo.insertId;
            req.body.premium = false;
            facebookLogin(req.body, res, next);
        }
    });
};

var facebookLogin = function(body, res, next) {
    if (body.facebook == true) {
        console.log(body);
        res.json({
            'result' : true,
            'message' : 'SUCCESS',
            'object' : body
        });
    }
    else {
        res.json({
            'result' : false,
            'message' : 'FACEBOOK'
        });
    }
};

module.exports = router;
