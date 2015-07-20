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
            res.json(
                'there is some error in login', 503
            );
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
        if (error != undefined) {
            res.json(
                'there is some error in signup while checking ID', 503
            );
        }
        else if (isAlreadyIn.length == 0) {
            connection.redirect('/signup/addUser');
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
        if (error != undefined) {
            res.json(
                'there is some error in signup while insert User', 503
            );
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
        if (error != undefined) {
            res.json(
                'there is some error in facebook login while checking ID', 503
            );
        }
        else if (isAlreadyIn.length == 0) {
            connection.redirect('/facebook/signup');
        }
        else {
            connection.redirect('/facebook/login');
        }
    });
});

router.post('/facebook/signup', function(req, res, next) {
    connection.query('INSERT INTO usrList (usrID, usrPassword, usrName, usrProfile, premium, facebook) VALUES (?, ?, ?, ?, FALSE, TRUE)', [req.body.usrID, req.body.usrPassword, req.body.usrName, req.body.usrProfile], function(error, insertInfo) {
        if (error != undefined) {
            res.json(
                'there is some error in facebook insert User', 503
            );
        }
        else {
            connection.redirect('/facebook/login');
        }
    });
});

router.post('/facebook/login', function(req, res, next) {
    connection.query('SELECT * FROM usrList WHERE usrID=? AND usrPassword=?;', [req.body.usrID, req.body.usrPassword], function(error, cursor) {
        if (error != undefined) {
            res.json(
                'there is some error in login', 503
            );
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
});

module.exports = router;
