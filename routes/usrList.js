var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
    'host' : 'aws-rds-linkbox.cjfjhr6oeu3e.ap-northeast-1.rds.amazonaws.com',
    'user' : 'LINKBOX',
    'password' : 'dlrpqkfhdnflek',
    'database' : 'LINKBOX'
});

router.post('/login', function(req, res, next) {
    connection.query('SELECT * FROM usrList WHERE usrID=? AND usrPassword=?;', [req.body.usrID, req.body.usrPassword], function(error, cursor) {
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
                    "result" : true,
                    "message" : 'SUCCESS'
                });
            }
            else {
                res.json({
                    "result" : false,
                    "message" : 'FACEBOOK'
                });
            }
        }
        else {
            res.json({
                "result" : false,
                "message" : 'NOID'
            })
        }
    });
});

router.post('/signup', function(req, res, next) {
    connection.query('SELECT * FROM usrList WHERE usrID=?;', [req.body.usrID], function(error, isAlreadyIn) {
        console.log(req.body);
        if (error != undefined) {
            res.status(503).json({
                'result' : false,
                'message' : 'there is some error in signup while checking ID'
            });
            console.log(error);
        }
        else if (isAlreadyIn.length == 0) {
            res.redirect('/signup/addUser');
        }
        else {
            res.json({
                "result" : false,
                "message" : 'ID'
            });
        }
    });
});

router.post('/signup/addUser', function(req, res, next) {
    connection.query('INSERT INTO usrList (usrID, usrPassword, usrName, usrProfile, premium, facebook) VALUES (?, ?, ?, ?, FALSE, FALSE);', [req.body.usrID, req.body.usrPassword, req.body.usrName, req.body.usrProfile], function(error, insertInfo) {
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
                "result" : true,
                "message" : 'SUCCESS'
            });
        }
    });
});

router.post('/facebook', function(req, res, next) {
    var body = req.body;
    connection.query('SELECT * FROM usrList WHERE usrID=?;', [body.usrID], function(error, isAlreadyIn) {
        console.log(req.body);
        if (error != undefined) {
            res.status(503).json(
                'there is some error in facebook login while checking ID'
            );
            console.log(error);
        }
        else if (isAlreadyIn.length == 0) {
            facebookSignup(body, res, next);
        }
        else {
            facebookLogin(isAlreadyIn[0], res, next);
        }
    });
});

var facebookSignup = function(body, res, next) {
    connection.query('INSERT INTO usrList (usrID, usrPassword, usrName, usrProfile, premium, facebook) VALUES (?, ?, ?, ?, FALSE, TRUE)', [body.usrID, body.usrPassword, body.usrName, body.usrProfile], function(error, insertInfo) {
        if (error != undefined) {
            res.status(503).json(
                'there is some error in facebook insert User'
            );
            console.log(error);
        }
        else {
            body.usrKey = insertInfo.insertId;
            facebookLogin(body, res, next);
        }
    });
}

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
            'message' : 'FACEBOOK',
        });
    }
}

module.exports = router;
