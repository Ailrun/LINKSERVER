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
                    result : true,
                    message : 'SUCCESS'
                });
            }
            else {
                res.json({
                    result : false,
                    message : 'FACEBOOK'
                });
            }
        }
        else {
            res.json({
                result : false,
                message : 'NOID'
            })
        }
    });
});

router.post('/signup', function(req, res, next) {
    connection.query('SELECT * FROM usrList WHERE usrID=?;', [req.body.usrID], function(error, isAlreadyIn) {
        console.log(req.body);
        if (error != undefined) {
            res.status(503).json(
                'there is some error in signup while checking ID'
            );
            console.log(error);
        }
        else if (isAlreadyIn.length == 0) {
            res.redirect('/signup/addUser');
        }
        else {
            res.json({
                result : false,
                message : 'ID'
            });
        }
    });
});

router.post('/signup/addUser', function(req, res, next){
    connection.query('INSERT INTO usrList (usrID, usrPassword, usrName, usrProfile, premium, facebook) VALUES (?, ?, ?, ?, FALSE, FALSE);', [req.body.usrID, req.body.usrPassword, req.body.usrName, req.body.usrProfile], function(error, insertInfo) {
        console.log(req.body);
        if (error != undefined) {
            res.status(503).json(
                'there is some error in signup while insert User'
            );
            console.log(error);
        }
        else {
            res.json({
                result : true,
                message : 'SUCCESS'
            });
        }
    });
});

router.post('/facebook', function(req, res, next) {
    connection.query('SELECT * FROM usrList WHERE usrID=?;', [req.body.usrID], function(error, isAlreadyIn) {
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
            facebookLogin(req, res, next);
        }
    });
});

var facebookSignup = function(req, res, next) {
    connection.query('INSERT INTO usrList (usrID, usrPassword, usrName, usrProfile, premium, facebook) VALUES (?, ?, ?, ?, FALSE, TRUE)', [req.body.usrID, req.body.usrPassword, req.body.usrName, req.body.usrProfile], function(error, insertInfo) {
        console.log(req.body);
        if (error != undefined) {
            res.status(503).json(
                'there is some error in facebook insert User'
            );
            console.log(error);
        }
        else {
            facebookLogin(req, res, next);
        }
    });
}

var facebookLogin = function(req, res, next) {
    connection.query('SELECT * FROM usrList WHERE usrID=? AND usrPassword=?;', [req.body.usrID, req.body.usrPassword], function(error, cursor) {
        console.log(req.body);
        if (error != undefined) {
            res.status(503).json(
                'there is some error in login'
            );
            console.log(error);
        }
        else if (cursor.length > 0) {
            if (cursor[0].facebook == true) {
                res.json({
                    result : true,
                    message : 'SUCCESS'
                });
            }
            else {
                res.json({
                    result : false,
                    message : 'FACEBOOK'
                });
            }
        }
        else {
            res.json({
                result : false,
                message : 'NOID'
            })
        }
    });
}

module.exports = router;
