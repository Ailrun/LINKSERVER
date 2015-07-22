var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
    'host' : 'aws-rds-linkbox.cjfjhr6oeu3e.ap-northeast-1.rds.amazonaws.com',
    'user' : 'LINKBOX',
    'password' : 'dlrpqkfhdnflek',
    'database' : 'LINKBOX'
});

const boxListQuery = ('SELECT BL.boxKey, BL.boxName, BofL.boxIndex\
                      FROM boxOfUsrList AS BofL\
                      JOIN boxList AS BL ON BL.boxKey=BofL.boxKey\
                      WHERE BofL.usrKey=?\
                      ORDER BY BofL.boxIndex;');

router.get('/:usrKey/boxList', function(req, res, next) {
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
            res.json(
                boxList
            );
        }
    });
});

module.exports = router;
