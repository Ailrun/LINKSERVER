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

const boxListURL = ("/List/:usrKey");
const boxListQuery = ("SELECT boxKey, boxName, boxThumbnail, boxIndex, boxFavorite FROM boxOfUsrList BofU ON usrKey=? ORDER BY boxIndex DESC;");
const boxAddURL = ("/Add/:usrKey");
const boxAddQuery1 = ("INSERT INTO boxList () VALUES ();");
const boxAddQuery2 = ("INSERT INTO boxOfUsrList (usrKey, boxKey, boxName, boxThumbnail, boxIndex) VALUES (?, ?, ?, ?, ?);");
const boxRemoveURL = ("/Remove/:usrKey");
const boxRemoveQuery1 = ("SELECT 1 FROM boxOfUsrList WHERE usrKey=? AND boxKey=?;");
const boxRemoveQuery2_1 = ("DELETE FROM boxOfUsrList WHERE usrKey=? AND boxKey=?;");
const boxRemoveQuery2_2 = ("DELETE FROM boxList WHERE boxKey=?;\
                           UPDATE boxList SET boxKey=boxKey-1 WHERE boxKey>?;\
                           ALTER TABLE boxList AUTO_INCREMENT=1;");
const boxEditURL = ("/Edit/:usrKey");
const boxEditQuery = ("UPDATE boxOfUsrList SET boxName=?, boxThumbnail=? WHERE usrKey=? AND boxKey=?;");
const boxFavoriteURL = ("/Favorite/:usrKey");
const boxFavoriteQuery = ("UPDATE boxOfUsrList SET boxFavorite=? AND boxKey=?;");
const boxInviteURL = ("/Invite/:usrKey/:boxKey");
const boxInviteQuery1 = ("SELECT usrKey AS alarmSetUsrKey FROM usrList WHERE usrID=?;");
const boxInviteQuery2 = ("INSERT INTO alarmList (alarmType, alarmGetUsrKey, alarmSetUsrKey, alarmBoxKey, alarmMessage) VALUES (0, ?, ?, ?, ?);");
// AND NOT DB QUERY NODE ALARM
const boxAcceptURL = ("/Accept/:alarmKey");
const boxAcceptQuery = ("INSERT INTO boxOfUsrList (usrKey, boxKey, boxName, boxThumbnail, boxIndex) SELECT A.alarmGetUsrKey, A.alarmBoxKey, BofU.boxName, BofU.boxThumbnail, ?\
                        FROM alarmList A JOIN boxOfUsrList BofU ON usrKey=A.alarmSetUsrKey AND boxKey=A.alarmBoxKey WHERE A.alarmKey=?;");
const boxDeclineURL = ("/Decline/:alarmKey");
const boxDeclineQuery = ("DELETE FROM alarmList WHERE alarmKey=?;"); //This is also used for box Accept post process;
const boxEditorURL = ("/Editor/:usrKey");
const boxEditorQuery = ("SELECT Us.usrName, Us.usrProfile FROM boxOfUsrList BofU JOIN usrList Us ON BofU.usrKey=Us.usrKey WHERE BofU.boxKey=?;");

router.get(boxListURL, boxList);
function boxList(req, res, next) {
    const usrKey = req.params.usrKey;
    const queryParams = [usrKey];
    connection.query(boxListQuery, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in List", err);
        }
        else {
            tools.giveSuccess(res, "Success in List", cur);
        }
    });
}

router.post(boxAddURL, boxAdd1);
function boxAdd1(req, res, next) {
    connection.query(boxAddQuery1, function(err, iInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Add", err);
        }
        else {
            console.log(iInfo);
            req.body.boxKey = iInfo.insertId;
            boxAdd2(req, res, next);
        }
    });
}
function boxAdd2(req, res, next) {
    const usrKey = req.params.usrKey;
    const boxKey = req.body.boxKey;
    const boxName = req.body.boxName;
    const boxThumbnail = req.body.boxThumbnail;
    const boxIndex = req.body.boxIndex;
    const queryParams = [usrKey, boxKey, boxName, boxThumbnail, boxIndex];
    connection.query(boxAddQuery2, queryParams, function(err, iInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Add", err);
        }
        else {
            console.log(iInfo);
            tools.giveSuccess(res, "Success in Add", req.body);
        }
    });
}

router.post(boxRemoveURL, boxRemove1);
function boxRemove1(req, res, next) {
    const usrKey = req.params.usrKey;
    const boxKey = req.body.boxKey;
    const queryParams = [usrKey, boxKey];
    connection.query(boxRemoveQuery1, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Remove", err);
        }
        else {
            boxRemove2(cur.length, req, res, next);
        }
    });
}
function boxRemove2(len, req, res, next) {
    const usrKey = req.params.usrKey;
    const boxKey = req.body.boxKey;
    const queryParams1 = [usrKey, boxKey];
    const queryParams2 = [boxKey, boxKey];
    if (len>1) {
        connection.query(boxRemoveQuery2_1, queryParams1, function(err, dInfo) {
            if (err != undefined) {
                tools.giveError(res, 503, "Error in Remove", err);
            }
            else {
                console.log(dInfo);
                tools.giveSuccess(res, "Success in Remove", null);
            }
        });
    }
    else {
        connection.query(boxRemoveQuery2_2, queryParams2, function(err, dInfo) {
            if (err != undefined) {
                tools.giveError(res, 503, "Error in Remove", err);
            }
            else {
                console.log(dInfo);
                tools.giveSuccess(res, "Success in Remove", null);
            }
        });
    }
}

module.exports = router;
