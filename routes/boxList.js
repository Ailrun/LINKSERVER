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
                     (boxKey, boxName)\
                     VALUES (?, ?);');
function addBox(req, res, next) {
    var usrKey = req.params.usrKey;
    var boxKey = req.body.boxKey;
    var boxName = req.body.boxName;
    var queryParams = [boxKey, boxName];
    connection.query(addBoxQuery, queryParams, function(error, insertInfo) {
        if (error != undefined) {
            console.log(error);
        }
        else {
            console.log(insertInfo);
        }
    });
}

module.exports = router;
