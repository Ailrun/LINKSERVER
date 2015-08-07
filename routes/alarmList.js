var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var tools = require('./tools');

var connection = mysql.createConnection({
    'host' : 'aws-rds-linkbox.cjfjhr6oeu3e.ap-northeast-1.rds.amazonaws.com',
    'user' : 'LINKBOX',
    'password' : 'dlrpqkfhdnflek',
    'database' : 'LINKBOX'
});

const alarmNonHiddenListURL = ("/NonHiddenList/:usrKey");
const alarmNonHiddenListQuery = ("SELECT A.alarmKey, A.alarmDate, Us.usrName alarmSetUsrName, A.alarmBoxKey, BofU.boxName alarmBoxName, A.alarmUrlKey alarmUrlKey, Ur.urlTitle\
                                FROM alarmList A JOIN boxOfUsrList BofU ON BofU.boxKey=A.alarmBoxKey JOIN usrList Us ON Us.usrKey=A.alarmSetUsrKey\
                                LEFT JOIN urlList Ur ON Ur.urlKey=A.alarmUrlKey WHERE A.alarmGetUsrKey=? AND A.hidden=0 ORDER BY A.alarmDate DECS;");
const alarmAllListURL = ("/AllList/:usrKey");
const alarmAllListQuery = ("SELECT A.alarmKey, A.alarmDate, A.hidden, Us.usrName alarmSetUsrName, A.alarmBoxKey, BofU.boxName alarmBoxName, A.alarmUrlKey alarmUrlKey, Ur.urlTitle\
                           FROM alarmList A JOIN boxOfUsrList BofU ON BofU.boxKey=A.alarmBoxKey JOIN usrList Us ON Us.usrKey=A.alarmSetUsrKey\
                           LEFT JOIN urlList Ur ON Ur.urlKey=A.alarmUrlKey WHERE A.alarmGetUsrKey=? ORDER BY A.alarmDate DECS;");
const alarmHiddenURL = ("/hidden/:usrKey/:alarmKey");
const alarmHiddenQuery = ("UPDATE alarmList SET hidden=1 WHERE alarmKey=?;");

router.get(alarmNonHiddenListURL, alarmNonHiddenList);
function alarmNonHiddenList(req, res, next) {
    const usrKey = req.params.usrKey;
    const queryParams = [usrKey];
    connection.query(alarmNonHiddenListQuery, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Non Hidden List", err);
        }
        else {
            tools.giveSuccess(res, "Success in Non Hidden List", cur);
        }
    });
}

router.get(alarmAllListURL, alarmAllList);
function alarmAllList(req, res, next) {
    const usrKey = req.params.usrKey;
    const queryParams = [usrKey];
    connection.query(alarmAllListQuery, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in All List", err);
        }
        else {
            tools.giveSuccess(res, "Success in All List", cur);
        }
    });
}

router.post(alarmHiddenURL, alarmHidden);
function alarmHidden(req, res, next) {
    const alarmKey = req.params.alarmKey;
    const queryParams = [alarmKey];
    connection.query(alarmHiddenQuery, queryParams, function(err, uInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Hidden", err);
        }
        else {
            console.log(uInfo);
            tools.giveSuccess(res, "Success in Hidden", null);
        }
    })
}

module.exports = router;
