var express = require('express');
var mysql = require('mysql');
var router = express.Router();
var tools = require('tools');

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
const alarmHiddenURL = ("/hidden/:alarmKey");
const alarmHiddenQuery = ("UPDATE alarmList SET hidden=1 WHERE alarmKey=?;");

module.exports = router;
