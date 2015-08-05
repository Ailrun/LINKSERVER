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
const boxAcceptURL = ("/Accept/:alarmKey");
const boxAcceptQuery = ("INSERT INTO boxOfUsrList (usrKey, boxKey, boxName, boxThumbnail, boxIndex) SELECT A.alarmGetUsrKey, A.alarmBoxKey, BofU.boxName, BofU.boxThumbnail, ?\
                        FROM alarmList A JOIN boxOfUsrList BofU ON usrKey=A.alarmSetUsrKey AND boxKey=A.alarmBoxKey WHERE A.alarmKey=?;");
const boxDeclineURL = ("/Decline/:alarmKey");
const boxDeclineQuery = ("DELETE FROM alarmList WHERE alarmKey=?;"); //This is also used for box Accept post process;
const boxEditorURL = ("/Editor/:usrKey");
const boxEditorQuery = ("SELECT Us.usrName, Us.usrProfile FROM boxOfUsrList BofU JOIN usrList Us ON BofU.usrKey=Us.usrKey WHERE BofU.boxKey=?;");

module.exports = router;
