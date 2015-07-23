var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
    'host' : 'aws-rds-linkbox.cjfjhr6oeu3e.ap-northeast-1.rds.amazonaws.com',
    'user' : 'LINKBOX',
    'password' : 'dlrpqkfhdnflek',
    'database' : 'LINKBOX'
});

const boxListURL = '/:usrKey/boxList';
const boxListQuery = ('SELECT BL.boxKey, BL.boxName, BofL.boxIndex\
                      FROM boxOfUsrList AS BofL\
                      JOIN boxList AS BL ON BL.boxKey=BofL.boxKey\
                      WHERE BofL.usrKey=?\
                      ORDER BY BofL.boxIndex;');
function boxList(req, res, next) {
    var usrKey = req.params.usrKey;
    connection.query(boxListQuery, [usrKey], function(error, boxList) {
        if (error != undefined) {
            res.status(503).json({
                'result' : false,
                'message' : 'there is some error in get box'
            });
            console.log(error);
        }
        else {
            res.json({
                'result' : true,
                'object' : boxList
            });
        }
    });
}
router.get(boxListURL, boxList);

const addBoxURL = '/:usrKey/addBox';
const addBoxQuery = ('INSERT INTO boxList\
                     (boxName)\
                     VALUES (?);');
function addBox(req, res, next) {
    var boxName = req.body.boxName;
    var queryParams = [boxName];
    connection.query(addBoxQuery, queryParams, function(error, insertInfo) {
        if (error != undefined) {
            res.status(503).json({
                'result' : false,
                'message' : 'there is some error in add box'
            });
            console.log(error);
        }
        else {
            req.body.boxKey = insertInfo.insertId;
            console.log(insertInfo);
            addBoxOfUsr(req, res, next);
        }
    });
}
const addBoxOfUsrQuery = ('INSERT INTO boxOfUsrList\
                          (boxKey, usrKey, boxIndex)\
                          VALUES (?, ?, ?);');
function addBoxOfUsr(req, res, next) {
    var usrKey = req.params.usrKey;
    var boxKey = req.body.boxKey;
    var boxIndex = req.body.boxIndex;
    var queryParams = [boxKey, usrKey, boxIndex];
    connection.query(addBoxOfUsrQuery, queryParams, function(error, insertInfo) {
        if (error != undefined) {
            res.status(503).json({
                'result' : false,
                'message' : 'there is some error in add box of user'
            });
            console.log(error);
        }
        else {
            res.json({
                'result' : true,
                'object' : req.body
            });
            console.log(req.body);
        }
    })
}
router.post(addBoxURL, addBox);

const removeBoxURL = '/:usrKey/removeBox';
const removeBoxQuery = ('SELECT 1\
                        FROM boxOfUsrList\
                        WHERE boxKey=?;');
function removeBox(req, res, next) {
    var boxKey = req.body.boxKey;
    var queryParams = [boxKey];
    connection.query(removeBoxQuery, queryParams, function(error, usrList) {
        if (error != undefined) {
            res.status(503).json({
                'result' : false,
                'message' : 'there is some error in remove box'
            });
        }
        else if (usrList.length > 1) {
            removeBoxOfUsr(req, res, next);
        }
        else if (usrList.length > 0){
            removeBoxAtAll(req, res, next);
        }
        else {
            res.status(503).json({
                'result' : false,
                'message' : 'NOBOX'
            });
        }
    })
}
const removeBoxOfUsrQuery = ('DELETE\
                             FROM boxOfUsrList\
                             WHERE usrKey=?\
                             AND boxKey=?;');
function removeBoxOfUsr(req, res, next) {
    var usrKey = req.params.usrKey;
    var boxKey = req.body.boxKey;
    var queryParams = [usrKey, boxKey];
    connection.query(removeBoxOfUsrQuery, queryParams, function(error, deleteInfo) {
        if (error != undefined) {
            res.status(503).json({
                'result' : false,
                'message' : 'there is some error in remove box of a usr'
            });
        }
        else {
            res.json({
                'result' : true
            });
        }
    });
}
const removeBoxAtAllQuery = ('DELETE\
                             FROM boxList\
                             WHERE boxKey=?;');
function removeBoxAtAll(req, res, next) {
    var boxKey = req.body.boxKey;
    var queryParams = [boxKey];
    connection.query(removeBoxAtAllQuery, queryParams, function(error, deleteInfo) {
        if (error != undefined) {
            res.status(503).json({
                'result' : false,
                'message' : 'there is some error in remove box at all'
            });
        }
        else {
            res.json({
                'result' : true
            });
        }
    });
}
router.post(removeBoxURL, removeBox);

const editBoxURL = '/:usrKey/editBox';

module.exports = router;
