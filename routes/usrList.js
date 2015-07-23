var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
    'host' : 'aws-rds-linkbox.cjfjhr6oeu3e.ap-northeast-1.rds.amazonaws.com',
    'user' : 'LINKBOX',
    'password' : 'dlrpqkfhdnflek',
    'database' : 'LINKBOX'
});

const loginURL = '/login';
const loginQuery = ('SELECT *\
                  FROM usrList\
                  WHERE usrID=? AND usrPassword=?;');
function login(req, res, next) {
    var usrID = req.body.usrID;
    var usrPassword = req.body.usrPassword;
    var querys = [usrID, usrPassword];
    connection.query(loginQuery, querys, function(error, usrList) {
        console.log(req.body);
        if (error != undefined) {
            res.status(503).json(
                'there is some error in login'
            );
            console.log(error);
        }
        else if (usrList.length > 0) {
            if (usrList[0].facebook == false) {
                res.json({
                    'result' : true,
                    'message' : 'SUCCESS',
                    'object' : usrList[0]
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
}
router.post(loginURL, login);

const signupURL = '/signup';
const signupQuery = ('SELECT 1\
                   FROM usrList\
                   WHERE usrID=?;');
function signup(req, res, next) {
    var usrID = req.body.usrID;
    connection.query(signupQuery, [usrID], function(error, isAlreadyIn) {
        console.log(req.body);
        if (error != undefined) {
            res.status(503).json({
//                'result' : false,
                'message' : 'there is some error in signup while checking ID'
            });
            console.log(error);
        }
        else if (isAlreadyIn.length == 0) {
            addUsr(req, res, next);
        }
        else {
            res.json({
                'result' : false,
                'message' : 'ID'
            });
        }
    });
}
router.post(signupURL, signup);

const addUsrQuery = ('INSERT INTO usrList\
                    (usrID, usrPassword, usrName,\
                    usrProfile, premium, facebook)\
                    VALUES\
                    (?, ?, ?,\
                    ?, FALSE, FALSE);');
function addUsr(req, res, next) {
    var usrID = req.body.usrID;
    var usrPassword = req.body.usrPassword;
    var usrName = req.body.usrName;
    var usrProfile = req.body.usrProfile;
    var querys = [usrID, usrPassword, usrName, usrProfile];
    connection.query(addUsrQuery, querys, function(error, insertInfo) {
        console.log(req.body);
        if (error != undefined) {
            res.status(503).json({
//                'result' : false,
                'message' : 'there is some error in signup while insert User'
            });
            console.log(error);
        }
        else {
            var usr = {
                'usrKey' : insertInfo.insertId,
                'usrID' : usrID,
                'usrPassword' : usrPassword,
                'usrName' : usrName,
                'usrProfile' : usrProfile,
                'premium' : false,
                'facebook' : false
            };
            res.json({
                'result' : true,
                'message' : 'SUCCESS',
                'object' : usr
            });
        }
    });
}

const facebookURL = '/facebook';
const facebookQuery = ('SELECT *\
                     FROM usrList\
                     WHERE usrID=?;');
function facebook(req, res, next) {
    var queryParams = [req.body.usrID];
    connection.query(facebookQuery, queryParams, function(error, isAlreadyIn) {
        console.log(req.body);
        if (error != undefined) {
            res.status(503).json({
//                'result' : false,
                'message' : 'there is some error in facebook login while checking ID'
            });
            console.log(error);
        }
        else if (isAlreadyIn.length == 0) {
            facebookSignup(req, res, next);
        }
        else {
            facebookLogin(isAlreadyIn[0], res, next);
        }
    });
}
router.post(facebookURL, facebook);

const facebookSignupQuery = ('INSERT INTO usrList\
                           (usrID, usrPassword, usrName,\
                           usrProfile, premium, facebook)\
                           VALUES\
                           (?, ?, ?,\
                           ?, FALSE, TRUE);');
function facebookSignup(req, res, next) {
    var usrID = req.body.usrID;
    var usrPassword = req.body.usrPassword;
    var usrName = req.body.usrName;
    var usrProfile = req.body.usrProfile;
    var queryParams = [usrID, usrPassword, usrName, usrProfile];
    connection.query(facebookSignupQuery, queryParams, function(error, insertInfo) {
        if (error != undefined) {
            res.status(503).json({
//                'result' : false,
                'message' : 'there is some error in facebook insert User'
            });
            console.log(error);
        }
        else {
            req.body.usrKey = insertInfo.insertId;
            req.body.premium = false;
            facebookLogin(req.body, res, next);
        }
    });
}

function facebookLogin(body, res, next) {
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
}

module.exports = router;
