var express = require('express');
var router = express.Router();
var tools = require('./tools');

require('./gcm')();
require('./connection')();

const boxListURL = ("/List/:usrKey");
const boxListQuery = ("SELECT boxKey, boxName, boxThumbnail, boxIndex, boxFavorite FROM boxOfUsrList BofU WHERE usrKey=? ORDER BY boxIndex DESC;");

const boxAddURL = ("/Add/:usrKey");
const boxAddQuery1 = ("INSERT INTO boxList () VALUES ();");
const boxAddQuery2 = ("INSERT INTO boxOfUsrList (usrKey, boxKey, boxName, boxThumbnail, boxIndex) VALUES (?, ?, ?, ?, ?);");

const boxRemoveURL = ("/Remove/:usrKey");
const boxRemoveQuery1 = ("SELECT 1 FROM boxOfUsrList WHERE usrKey=? AND boxKey=?;");
const boxRemoveQuery2_1 = ("DELETE FROM boxOfUsrList WHERE usrKey=? AND boxKey=?;");
const boxRemoveQuery2_2 = ("DELETE FROM boxList WHERE boxKey=?;\
                           ALTER TABLE boxList AUTO_INCREMENT=1");

const boxEditURL = ("/Edit/:usrKey");
const boxEditQuery = ("UPDATE boxOfUsrList SET boxName=?, boxThumbnail=? WHERE usrKey=? AND boxKey=?;");

const boxFavoriteURL = ("/Favorite/:usrKey");
const boxFavoriteQuery = ("UPDATE boxOfUsrList SET boxFavorite=? WHERE usrKey=? AND boxKey=?;");

const boxInviteURL = ("/Invite/:usrKey/:boxKey");
const boxInviteQuery1 = ("SELECT usrKey AS alarmSetUsrKey FROM usrList WHERE usrID=?;");
const boxInviteQuery2 = ("SELECT 1 FROM alarmList WHERE alarmGetUsrKey=? AND alarmBoxKey=?");
const boxInviteQuery3 = ("INSERT INTO alarmList (alarmType, alarmGetUsrKey, alarmSetUsrKey, alarmBoxKey, alarmMessage) VALUES (0, ?, ?, ?, ?);");
const boxInviteQuery4 = ("SELECT A.alarmKey, 0 alarmType, Us.usrName alarmSetUsrName, A.alarmBoxKey, BofU.boxName alarmBoxName, A.alarmMessage, A.alarmDate FROM alarmList A\
                         JOIN usrList Us ON A.alarmSetUsrKey=Us.usrKey JOIN boxOfUsrList BofU ON A.alarmBoxKey=BofU.boxKey AND A.alarmSetUsrKey=BofU.usrKey\
                         WHERE A.alarmKey=?");
const boxInviteQuery5 = ("SELECT pushToken FROM tokenList WHERE usrKey=?;");
// AND NOT DB QUERY NODE ALARM

const boxAcceptURL = ("/Accept/:alarmKey/:usrKey");
const boxAcceptQuery1 = ("INSERT INTO boxOfUsrList (usrKey, boxKey, boxName, boxThumbnail, boxIndex) SELECT A.alarmGetUsrKey, A.alarmBoxKey, BofU.boxName, BofU.boxThumbnail, ?\
                         FROM alarmList A JOIN boxOfUsrList BofU ON usrKey=A.alarmSetUsrKey AND boxKey=A.alarmBoxKey WHERE A.alarmKey=?;");
const boxAcceptQuery2 = ("SELECT boxKey, boxName, boxThumbnail, boxIndex, boxFavorite FROM boxOfUsrList BofU WHERE usrKey=? AND boxKey=?;");

const boxDeclineURL = ("/Decline/:alarmKey");
const boxDeclineQuery = ("DELETE FROM alarmList WHERE alarmKey=?;\
                         ALTER TABLE alarmList AUTO_INCREMENT=1"); //This is also used for box Accept post process;

const boxEditorListURL = ("/Editor/:usrKey");
const boxEditorListQuery = ("SELECT Us.usrName, Us.usrProfile FROM boxOfUsrList BofU JOIN usrList Us ON BofU.usrKey=Us.usrKey WHERE BofU.boxKey=?;");

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
    const queryParams2 = [boxKey];
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

router.post(boxEditURL, boxEdit);
function boxEdit(req, res, next) {
    const usrKey = req.params.usrKey;
    const boxName = req.body.boxName;
    const boxThumbnail = req.body.boxThumbnail;
    const boxKey = req.body.boxKey;
    const queryParams = [boxName, boxThumbnail, usrKey, boxKey];
    connection.query(boxEditQuery, queryParams, function(err, uInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Edit", err);
        }
        else {
            console.log(uInfo);
            tools.giveSuccess(res, "Success in Edit", null);
        }
    });
}

router.post(boxFavoriteURL, boxFavorite);
function boxFavorite(req, res, next) {
    const usrKey = req.params.usrKey;
    const boxFavorite = req.body.boxFavorite;
    const boxKey = req.body.boxKey;
    const queryParams = [boxFavorite, usrKey, boxKey];
    connection.query(boxFavoriteQuery, queryParams, function(err, uInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Favorite", err);
        }
        else {
            console.log(uInfo);
            tools.giveSuccess(res, "Success in Favorite", null);
        }
    });
}

router.post(boxInviteURL, boxInvite1);
function boxInvite1(req, res, next) {
    const usrID = req.body.usrID;
    const queryParams = [usrID];
    connection.query(boxInviteQuery1, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Invite1", err);
        }
        else if (cur.length == 0){
            tools.giveFail(res, 503, "Fail in Invite1",
                           {
                               warning : "There is no such User"
                           });
        }
        else {
            req.body.usrKey = cur[0].alarmSetUsrKey;
            boxInvite2(req, res, next);
        }
    });
}
function boxInvite2(req, res, next) {
    const alarmBoxKey = req.params.boxKey;
    const alarmGetUsrKey = req.body.usrKey;
    const queryParams = [alarmGetUsrKey, alarmBoxKey];
    connection.query(boxInviteQuery2, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Invite2", err);
        }
        else if (cur.length > 0){
            tools.giveFail(res, "Fail in Invite2", null);
        }
        else {
            boxInvite3(req, res, next);
        }
    });
}
function boxInvite3(req, res, next) {
    const alarmSetUsrKey = req.params.usrKey;
    const alarmBoxKey = req.params.boxKey;
    const alarmGetUsrKey = req.body.usrKey;
    const alarmMessage = req.body.message;
    const queryParams = [alarmGetUsrKey, alarmSetUsrKey, alarmBoxKey, alarmMessage];
    console.log(req.body);
    connection.query(boxInviteQuery3, queryParams, function(err, iInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Invite3", err);
        }
        else {
            console.log(iInfo);
            req.body.alarmKey = iInfo.insertId;
            boxInvite4(req, res, next);
        }
    });
}
function boxInvite4(req, res, next) {
    const alarmKey = req.body.alarmKey;
    const queryParams = [alarmKey];
    console.log(req.body);
    console.log(req.params);
    connection.query(boxInviteQuery4, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Invite4" , err);
        }
        else if (cur.length == 0){
            tools.giveFail(res, "Fail in Invite4", null);
        }
        else {
            req.body.alarm = cur[0];
            boxInvite5(req, res, next);
        }
    });
}
function boxInvite5(req, res, next) {
    const alarmGetUsrKey = req.body.usrKey;
    const queryParams = [alarmGetUsrKey];
    connection.query(boxInviteQuery5, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Invite5", err);
        }
        else if (cur.length == 0) {
            tools.giveFail(res, "Fail in Invite5", null);
        }
        else {
            var pushTokens = [];
            cur.forEach(function(item, index, array) {
                pushTokens.push(item.pushToken);
            });

            var message = new gcm.Message({
                collapseKey : "linkbox",
                delayWhileIdle : true,
                data: {
                    result : true,
                    object : req.body.alarm
                }
            });
            console.log(cur);

            sender.send(message, pushTokens, 4, function(err, result) {
                console.log(result);
            });

            tools.giveSuccess(res, "Success in Invite", null);
        }
    });
}

router.post(boxAcceptURL, boxAccept1);
function boxAccept1(req, res, next) {
    const alarmKey = req.params.alarmKey;
    const boxIndex = req.body.boxIndex;
    const queryParams = [boxIndex, alarmKey];
    connection.query(boxAcceptQuery1, queryParams, function(err, iInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Accept1", err);
        }
        else {
            console.log(iInfo);
            boxAccept2(req, res, next);
        }
    });
}
function boxAccept2(req, res, next) {
    const usrKey = req.params.usrKey;
    const boxKey = req.body.boxKey;
    const queryParams = [usrKey, boxKey];
    connection.query(boxAcceptQuery2, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Accept2", err);
        }
        else if (cur.length == 0) {
            tools.giveFail(res, "Fail in Accept2", null);
        }
        else {
            req.body.box = cur[0];
            boxAccept3(req, res, next);
        }
    });
}
function boxAccept3(req, res, next) {
    const alarmKey = req.params.alarmKey;
    const queryParams = [alarmKey];
    connection.query(boxDeclineQuery, queryParams, function(err, dInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Accept3", err);
        }
        else {
            console.log(dInfo);
            tools.giveSuccess(res, "Success in Accept", req.body.box);
        }
    });
}

router.post(boxDeclineURL, boxDecline);
function boxDecline(req, res, next) {
    const alarmKey = req.params.alarmKey;
    const queryParams = [alarmKey];
    connection.query(boxDeclineQuery, queryParams, function(err, dInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Decline", err);
        }
        else {
            console.log(dInfo);
            tools.giveSuccess(res, "Success in Decline", null);
        }
    });
}

router.post(boxEditorListURL, boxEditorList);
function boxEditorList(req, res, next) {
    const boxKey = req.body.boxKey;
    const queryParams = [boxKey];
    connection.query(boxEditorListQuery, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in EditorList", err);
        }
        else {
            tools.giveSuccess(res, "Success in EditorList", cur);
        }
    });
}

module.exports = router;
