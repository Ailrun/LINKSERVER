var express = require('express');
var router = express.Router();
var tools = require('./tools');

require('./connection')();

const alarmAllListURL = ("/AllList/:usrKey");
const alarmAllListQuery = ("SELECT A.alarmType, A.alarmKey, A.alarmDate, A.hidden, Us.usrName alarmSetUsrName, A.alarmBoxKey, BofU.boxName alarmBoxName, \
                           A.alarmUrlKey alarmUrlKey, Ur.urlTitle alarmUrlTitle, A.alarmMessage\
                           FROM alarmList A JOIN urlList Ur ON Ur.urlKey=A.alarmUrlKey JOIN boxOfUsrList BofU ON BofU.boxKey=A.alarmBoxKey AND BofU.usrKey=A.alarmGetUsrKey\
                           JOIN usrList Us ON Us.usrKey=A.alarmSetUsrKey WHERE A.alarmGetUsrKey=16 AND A.hidden=0\
                           UNION ALL\
                           SELECT A.alarmType, A.alarmKey, A.alarmDate, A.hidden, Us.usrName alarmSetUsrName, A.alarmBoxKey, BofU.boxName alarmBoxName, \
                           A.alarmUrlKey alarmUrlKey, \"\" alarmUrlTitle, A.alarmMessage\
                           FROM alarmList A JOIN boxOfUsrList BofU ON BofU.boxKey=A.alarmBoxKey AND BofU.usrKey=A.alarmSetUsrKey\
                           JOIN usrList Us ON Us.usrKey=A.alarmSetUsrKey WHERE A.alarmGetUsrKey=16 AND ISNULL(A.alarmUrlKey) AND A.hidden=0\
                           ORDER BY alarmDate DESC;");
const alarmHiddenListURL = ("/HiddenList/:usrKey");
const alarmHiddenListQuery = ("SELECT A.alarmType, A.alarmKey, A.alarmDate, A.hidden, Us.usrName alarmSetUsrName, A.alarmBoxKey, BofU.boxName alarmBoxName, \
                           A.alarmUrlKey alarmUrlKey, Ur.urlTitle alarmUrlTitle, A.alarmMessage\
                           FROM alarmList A JOIN urlList Ur ON Ur.urlKey=A.alarmUrlKey JOIN boxOfUsrList BofU ON BofU.boxKey=A.alarmBoxKey AND BofU.usrKey=A.alarmGetUsrKey\
                           JOIN usrList Us ON Us.usrKey=A.alarmSetUsrKey WHERE A.alarmGetUsrKey=16 AND A.hidden=1\
                           UNION ALL\
                           SELECT A.alarmType, A.alarmKey, A.alarmDate, A.hidden, Us.usrName alarmSetUsrName, A.alarmBoxKey, BofU.boxName alarmBoxName, \
                           A.alarmUrlKey alarmUrlKey, \"\" alarmUrlTitle, A.alarmMessage\
                           FROM alarmList A JOIN boxOfUsrList BofU ON BofU.boxKey=A.alarmBoxKey AND BofU.usrKey=A.alarmSetUsrKey\
                           JOIN usrList Us ON Us.usrKey=A.alarmSetUsrKey WHERE A.alarmGetUsrKey=16 AND ISNULL(A.alarmUrlKey) AND A.hidden=1\
                           ORDER BY alarmDate DESC;");
const alarmHiddenURL = ("/Hidden/:usrKey/:alarmKey");
const alarmHiddenQuery = ("UPDATE alarmList SET hidden=1 WHERE alarmKey=?;");

router.get(alarmAllListURL, alarmAllList);
function alarmAllList(req, res, next) {
    const usrKey = req.params.usrKey;
    const queryParams = [usrKey, usrKey];
    connection.query(alarmAllListQuery, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in All List", err);
        }
        else {
            tools.giveSuccess(res, "Success in All List", cur);
        }
    });
}

router.get(alarmHiddenListURL, alarmHiddenList);
function alarmHiddenList(req, res, next) {
    const usrKey = req.params.usrKey;
    const queryParams = [usrKey, usrKey];
    connection.query(alarmHiddenListQuery, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Non Hidden List", err);
        }
        else {
            tools.giveSuccess(res, "Success in Non Hidden List", cur);
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
