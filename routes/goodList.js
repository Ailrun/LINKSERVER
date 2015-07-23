var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
    'host' : 'aws-rds-linkbox.cjfjhr6oeu3e.ap-northeast-1.rds.amazonaws.com',
    'user' : 'LINKBOX',
    'password' : 'dlrpqkfhdnflek',
    'database' : 'LINKBOX'
});

const addGoodURL = '/:usrKey/:boxKey/addGood';
const addGoodQuery = ('SELECT 1\
                      FROM goodList\
                      WHERE usrKey=?\
                      AND urlKey=?;');
function addGood(req, res, next) {
    var usrKey = req.params.usrKey;
    var urlKey = req.body.urlKey;
    var queryParams = [usrKey, urlKey];
    connection.query(addGoodQuery, queryParams, function(error, goodList) {
        if (error != undefined) {
            res.status(503).json({
//                'result' : false,
                'message' : 'there is some error in add good'
            });
        }
        else if (goodList.length == 0) {
            addGoodList(req, res, next);
        }
        else {
            res.json({
                'result' : false,
                'message' : 'GOOD'
            });
        }
    });
}
const addGoodListQuery = ('INSERT INTO goodList\
                          (usrKey, urlKey)\
                          VALUES (?, ?);');
function addGoodList(req, res, next) {
    var usrKey = req.params.usrKey;
    var urlKey = req.body.urlKey;
    var queryParams = [usrKey, urlKey];
    connection.query(addGoodListQuery, queryParams, function(error, insertInfo) {
        if (error != undefined) {
            res.status(503).json({
                'result' : false,
                'message' : 'there is some error in add good to list'
            });
        }
        else {
            res.json({
                'result' : true,
                'object' : req.body
            });
        }
    });
}
router.post(addGoodURL, addGood);

const removeGoodURL = '/:usrKey/:boxKey/removeGood';
const removeGoodQuery = ('DELETE\
                         FROM goodList\
                         WHERE usrKey=?\
                         AND urlKey=?;');
function removeGood(req, res, next) {
    var usrKey = req.params.usrKey;
    var urlKey = req.body.urlKey;
    var queryParams = [usrKey, urlKey];
    connection.query(removeGoodQuery, queryParams, function(error, deleteInfo) {
        if (error != undefined) {
            res.status(503).json({
                'result' : false,
                'message' : 'there is some error in remove good``'
            });
        }
        else {
            res.json({
                'result' : true
            });
        }
    });
}
router.post(removeGoodURL, removeGood);

module.exports = router;
