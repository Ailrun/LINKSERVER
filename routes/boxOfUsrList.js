var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
    'host' : 'aws-rds-linkbox.cjfjhr6oeu3e.ap-northeast-1.rds.amazonaws.com',
    'user' : 'LINKBOX',
    'password' : 'dlrpqkfhdnflek',
    'database' : 'LINKBOX'
});

const boxUsrListURL = '/:usrKey/:boxKey/boxUsrList';
const boxUsrListQuery = ('SELECT U.*\
                         FROM usrList U\
                         WHERE EXISTS\
                         (SELECT 1\
                         FROM boxOfUsrList BofU\
                         WHERE BofU.boxKey=?\
                         AND BofU.usrKey=U.usrKey);');
function boxUsrList(req, res, next) {
    var boxKey = req.params.boxKey;
    var queryParams = [boxKey];
    connection.query(boxUsrListQuery, queryParams, function(error, usrList) {
        if (error != undefined) {
            res.status(503).json({
//                'result' : false,
                'message' : 'there is some error in get usr of box'
            });
        }
        else {
            res.json({
                'result' : true,
                'object' : usrList
            });
        }
    });
}
router.get(boxUsrListURL, boxUsrList);

const addBoxUsrURL = '/:usrKey/:boxKey/addBoxUsr';
const addBoxUsrQuery = ('INSERT INTO boxOfUsrList\
                        (usrKey, boxKey, boxName,\
                        boxIndex)\
                        VALUES ((SELECT usrKey\
                        FROM usrList U\
                        WHERE usrID=?),\
                        ?,\
                        (SELECT boxName\
                        FROM boxOfUsrList BofU\
                        WHERE usrKey=?\
                        AND boxKey=?),\
                        (SELECT MAX(boxIndex) ind\
                        FROM boxOfUsrlist BofU\
                        JOIN usrList U on U.usrID=?\
                        AND BofU.usrKey=U.usrKey))');
function addBoxUsr(req, res, next){
    var invitingUsrKey = req.params.usrKey;
    var invitingBoxKey = req.params.boxKey;
    var invitedUsrID = req.body.usrID;
    var queryParams = [invitedUsrID, invitingBoxKey,
                       invitingUsrKey, invitingBoxKey,
                       invitedUsrID];
    connection.query(addBoxUsrQuery, queryParams, function(error, insertInfo) {
        if (error != undefined) {
            res.status(503).json({
//                'result' : false,
                'message' : 'there is some error in get usr of box'
            });
        }
        else {
            res.json({
                'result' : true
            });
        }
    });
}
router.post(addBoxUsrURL, addBoxUsr);

module.exports = router;
