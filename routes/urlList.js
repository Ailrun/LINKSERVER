var express = require('express');
var router = express.Router();
var tools = require('./tools');

require('./connection')();

//Seperate Tag loading from url loading
const urlAllListURL = ("/AllList/:usrKey/:startNum/:urlNum");
const urlAllListQuery = ("SELECT Ur.urlKey, Ur.url, Ur.urlTitle, Ur.urlThumbnail, Ur.urlDate, Us.usrKey urlWriterUsrKey, Us.usrName urlWriterUsrName, SUM(!ISNULL(G.usrKey=?)) liked, SUM(!ISNULL(G.usrKey)) likedNum, SUM(!ISNULL(R.usrKey)) readLater\
                         FROM urlList Ur LEFT JOIN goodList G ON G.urlKey=Ur.urlKey LEFT JOIN readLaterList R ON R.urlKey=Ur.urlKey AND R.usrKey=?\
                         JOIN usrList Us ON Ur.urlWriterUsrKey=Us.usrKey\
                         WHERE EXISTS (SELECT 1 FROM boxOfUsrList BofU WHERE BofU.usrKey=? AND Ur.urlBoxKey=BofU.boxKey)\
                         AND NOT EXISTS (SELECT 1 FROM hiddenList H WHERE H.usrKey=? AND H.urlKey=Ur.urlKey) GROUP BY Ur.urlKey ORDER BY Ur.urlDate DESC LIMIT ?, ?;");

const urlFavoriteListURL = ("/FavoriteList/:usrKey/:startNum/:urlNum");
const urlFavoriteListQuery = ("SELECT Ur.urlKey, Ur.url, Ur.urlTitle, Ur.urlThumbnail, Ur.urlDate, Us.usrKey urlWriterUsrKey, Us.usrName urlWriterUsrName, SUM(G.usrKey=?) liked, SUM(!ISNULL(G.usrKey)) likedNum, SUM(!ISNULL(R.usrKey)) readLater\
                              FROM urlList Ur LEFT JOIN goodList G ON G.urlKey=Ur.urlKey LEFT JOIN readLaterList R ON R.urlKey=Ur.urlKey AND R.usrKey=?\
                              JOIN usrList Us ON Ur.urlWriterUsrKey=Us.usrKey\
                              WHERE EXISTS (SELECT 1 FROM boxOfUsrList BofU WHERE BofU.usrKey=? AND Ur.urlBoxKey=BofU.boxKey AND BofU.boxFavorite=1)\
                              AND NOT EXISTS (SELECT 1 FROM hiddenList H WHERE H.usrKey=? AND H.urlKey=Ur.urlKey) GROUP BY Ur.urlKey ORDER BY Ur.urlDate DESC LIMIT ?, ?;");

const urlHiddenListURL = ("/HiddenList/:usrKey/:startNum/:urlNum");
const urlHiddenListQuery = ("SELECT Ur.urlKey, Ur.url, Ur.urlTitle, Ur.urlThumbnail, Ur.urlDate, Us.usrKey urlWriterUsrKey, Us.usrName urlWriterUsrName, SUM(G.usrKey=?) liked, SUM(!ISNULL(G.usrKey)) likedNum, SUM(!ISNULL(R.usrKey)) readLater\
                            FROM urlList Ur LEFT JOIN goodList G ON G.urlKey=Ur.urlKey LEFT JOIN readLaterList R ON R.urlKey=Ur.urlKey AND R.usrKey=?\
                            JOIN usrList Us ON Ur.urlWriterUsrKey=Us.usrKey WHERE EXISTS (SELECT 1 FROM boxOfUsrList BofU WHERE BofU.usrKey=? AND Ur.urlBoxKey=BofU.boxKey)\
                            AND EXISTS (SELECT 1 FROM hiddenList H WHERE H.usrKey=? AND H.urlKey=Ur.urlKey) GROUP BY Ur.urlKey ORDER BY Ur.urlDate DESC LIMIT ?, ?;");

const urlBoxListURL = ("/BoxList/:usrKey/:boxKey/:startNum/:urlNum");
const urlBoxListQuery = ("SELECT Ur.urlKey, Ur.url, Ur.urlTitle, Ur.urlThumbnail, Ur.urlDate, Us.usrKey urlWriterUsrKey, Us.usrName urlWriterUsrName, SUM(G.usrKey=?) liked, SUM(!ISNULL(G.usrKey)) likedNum, SUM(!ISNULL(R.usrKey)) readLater\
                         FROM urlList Ur LEFT JOIN goodList G ON G.urlKey=Ur.urlKey LEFT JOIN readLaterList R ON R.urlKey=Ur.urlKey AND R.usrKey=?\
                         JOIN usrList Us ON Ur.urlWriterUsrKey=Us.usrKey\
                         WHERE Ur.urlBoxKey=? AND NOT EXISTS (SELECT 1 FROM hiddenList H WHERE H.usrKey=? AND H.urlKey=Ur.urlKey)\
                         GROUP BY Ur.urlKey ORDER BY Ur.urlDate DESC LIMIT ?, ?;");

const urlAddURL = ("/Add/:usrKey/:boxKey");
const urlAddQuery1 = ("INSERT INTO urlList (urlBoxKey, urlWriterUsrKey, url, urlTitle, urlThumbnail) VALUES (?, ?, ?, ?, ?);");
const urlAddQuery2 = ("INSERT INTO alarmList (alarmType, alarmGetUsrKey, alarmSetUsrKey, alarmBoxKey, alarmUrlKey)\
                      SELECT 1, usrKey, ?, boxKey, ? FROM boxOfUsrList WHERE boxKey=? AND usrKey<>?;");

const urlRemoveURL = ("/Remove/:usrKey/:boxKey");
const urlRemoveQuery = ("DELETE FROM urlList WHERE urlKey=? AND urlWriterUsrKey=?;\
                        ALTER TABLE urlList AUTO_INCREMENT=1;");

const urlEditURL = ("/Edit/:usrKey/:boxKey");
const urlEditQuery = ("UPDATE urlList SET urlTitle=? WHERE urlKey=? AND urlWriterUsrKey=?;");

const urlHiddenURL = ("/Hidden/:usrKey/:boxKey");
const urlHiddenQuery1_1 = ("INSERT INTO hiddenList (urlKey, usrKey) VALUES (?, ?);");
const urlHiddenQuery1_2 = ("DELETE FROM hiddenList WHERE urlKey=? AND usrKey=?;");

const urlShareURL = ("/Share/:usrKey/:originalBoxKey/:targetBoxKey");
const urlShareQuery = ("INSERT INTO urlList (urlBoxKey, urlWriterUsrKey, url, urlTitle, urlThumbnail) SELECT ?, ?, url, urlTItle, urlThumbnail FROM urlList WHERE urlKey=?;");

const urlLikeURL = ("/Like/:usrKey/:boxKey");
const urlLikeQuery1_1 = ("INSERT INTO goodList (urlKey, usrKey) VALUES (?, ?);");
const urlLikeQuery1_2 = ("DELETE FROM goodList WHERE urlKey=? AND usrKey=?;");

const urlTagListURL = ("/Tag/List/:usrKey/:boxKey/:urlKey");
const urlTagListQuery = ("SELECT tagKey, tag FROM tagList WHERE urlKey=?;");

const urlTagAddURL = ("/Tag/Add/:usrKey/:boxKey/:urlKey");
const urlTagAddQuery = ("INSERT INTO tagList (urlKey, tag) VALUES (?, ?);");

const urlTagRemoveURL = ("/Tag/Add/:usrKey/:boxKey/:urlKey");
const urlTagRemoveQuery = ("DELETE FROM tagList WHERE tagKey=? AND urlKey=?;\
                           ALTER TABLE tagList AUTO_INCREMENT=1");

const urlCommentListURL = ("/Comment/List/:usrKey/:boxKey/:urlKey");
const urlCommentListQuery = ("SELECT C.usrKey, Us.usrThumbnail, Us.usrName, C.comment, C.commentDate FROM commentList C JOIN usrList Us ON Us.usrKey=C.usrKey WHERE C.urlKey=?\
                             ORDER BY C.commentDate DECS;");

const urlCommentAddURL = ("/Comment/Add/:usrKey/:boxKey/:urlKey");
const urlCommentAddQuery = ("INSERT INTO commentList (urlKey, usrKey, comment) VALUES (?, ?, ?);");

const urlCommentRemoveURL = ("/Comment/Remove/:usrKey/:boxKey/:urlKey");
const urlCommentRemoveQuery = ("DELETE FROM commentList WHERE commentKey=? AND usrKey=?;\
                               ALTER TABLE commentList AUTO_INCREMENT=1");

const urlCommentEditURL = ("/Comment/Edit/:usrKey/:boxKey/:urlKey");
const urlCommentEditQuery = ("UPDATE commentList SET comment=? WHERE commentKey=? AND usrKey=?;");

router.get(urlAllListURL, urlAllList);
function urlAllList(req, res, next) {
    const usrKey = req.params.usrKey;
    const startNum = req.params.startNum;
    const urlNum = req.params.urlNum;
    const queryParams = [usrKey, usrKey, usrKey, usrKey, startNum*1, urlNum*1];
    connection.query(urlAllListQuery, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in All List", err);
        }
        else {
            tools.giveSuccess(res, "Success in All List", cur);
        }
    });
}

router.get(urlFavoriteListURL, urlFavoriteList);
function urlFavoriteList(req, res, next) {
    const usrKey = req.params.usrKey;
    const startNum = req.params.startNum;
    const urlNum = req.params.urlNum;
    const queryParams = [usrKey, usrKey, usrKey, usrKey, startNum*1, urlNum*1];
    connection.query(urlFavoriteListQuery, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Favorite List", err);
        }
        else {
            tools.giveSuccess(res, "Success in Favorite List", cur);
        }
    });
}

router.get(urlHiddenListURL, urlHiddenList);
function urlHiddenList(req, res, next) {
    const usrKey = req.params.usrKey;
    const startNum = req.params.startNum;
    const urlNum = req.params.urlNum;
    const queryParams = [usrKey, usrKey, usrKey, usrKey, startNum*1, urlNum*1];
    connection.query(urlHiddenListQuery, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Non Hidden List", err);
        }
        else {
            tools.giveSuccess(res, "Success in Non Hidden List", cur);
        }
    });
}

router.get(urlBoxListURL, urlBoxList);
function urlBoxList(req, res, next) {
    const usrKey = req.params.usrKey;
    const startNum = req.params.startNum;
    const urlNum = req.params.urlNum;
    const boxKey = req.params.boxKey;
    const queryParams = [usrKey, usrKey, boxKey, usrKey, startNum*1, urlNum*1];
    connection.query(urlBoxListQuery, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Box List", err);
        }
        else {
            tools.giveSuccess(res, "Success in Box List", cur);
        }
    });
}

router.post(urlAddURL, urlAdd1);
function urlAdd1(req, res, next) {
    const usrKey = req.params.usrKey;
    const boxKey = req.params.boxKey;
    const url = req.body.url;
    const urlTitle = req.body.urlTitle;
    const urlThumbnail = req.body.urlThumbnail;
    const queryParams = [boxKey, usrKey, url, urlTitle, urlThumbnail];
    connection.query(urlAddQuery1, queryParams, function(err, iInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Add1", err);
        }
        else {
            console.log(iInfo);
            req.body.urlKey = iInfo.insertId;
            urlAdd2(req, res, next);
        }
    });
}
function urlAdd2(req, res, next) {
    const usrKey = req.params.usrKey;
    const boxKey = req.params.boxKey;
    const urlKey = req.body.urlKey;
    const queryParams = [usrKey, urlKey, boxKey, usrKey];
    connection.query(urlAddQuery2, queryParams, function(err, iInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Add2", err);
        }
        else {
            console.log(iInfo);
            tools.giveSuccess(res, "Success in Add2", req.body);
        }
    });
}

router.post(urlRemoveURL, urlRemove);
function urlRemove(req, res, next) {
    const usrKey = req.params.usrKey;
    const urlKey = req.body.urlKey;
    const usrWriterUsrKey = req.body.urlWriterUsrKey;
    const queryParams = [urlKey, usrKey];
    if (usrKey != usrWriterUsrKey) {
        tools.giveFail(res, "Fail in Remove", null);
    }
    else {
        connection.query(urlRemoveQuery, queryParams, function(err, dInfo) {
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

router.post(urlEditURL, urlEdit);
function urlEdit(req, res, next) {
    const usrKey = req.params.usrKey;
    const urlTitle = req.body.urlTitle;
    const urlKey = req.body.urlKey;
    const queryParams = [urlTitle, urlKey, usrKey];
    connection.query(urlEditQuery, queryParams, function(err, uInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Edit", err);
        }
        else {
            console.log(uInfo);
            tools.giveSuccess(res, "Success in Edit", null);
        }
    });
}

router.post(urlHiddenURL, urlHidden);
function urlHidden(req, res, next) {
    const usrKey = req.params.usrKey;
    const urlKey = req.body.urlKey;
    const queryParams = [urlKey, usrKey];

    if (req.body.hidden) {
        connection.query(urlHiddenQuery1_1, queryParams, function(err, iInfo) {
            if (err != undefined) {
                tools.giveError(res, 503, "Error in Hidden", err);
            }
            else {
                console.log(iInfo);
                tools.giveSuccess(res, "Success in Hidden", null);
            }
        });
    }
    else {
        connection.query(urlHiddenQuery1_2, queryParams, function(err, dInfo) {
            if (err != undefined) {
                tools.giveError(res, 503, "Error in Hidden", err);
            }
            else {
                console.log(dInfo);
                tools.giveSuccess(res, "Success in Hidden", null);
            }
        });
    }
}

router.post(urlShareURL, urlShare);
function urlShare(req, res, next) {
    const usrKey = req.params.usrKey;
    const targetBoxKey = req.params.targetBoxKey;
    const urlKey = req.body.urlKey;
    const queryParams = [targetBoxKey, usrKey, urlKey];
    connection.query(urlShareQuery, queryParams, function(err, iInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Share", err);
        }
        else {
            console.log(iInfo);
            req.body.urlKey=iInfo.insertKey;
            tools.giveSuccess(res, "Success in Share", req.body);
        }
    });
}

router.post(urlLikeURL, urlLike);
function urlLike(req, res, next) {
    const usrKey = req.params.usrKey;
    const urlKey = req.body.urlKey;
    const queryParams = [urlKey, usrKey];
    if (req.body.liked) {
        connection.query(urlLikeQuery1_1, queryParams, function(err, iInfo) {
            if (err != undefined) {
                tools.giveError(res, 503, "Error in Like", err);
            }
            else {
                console.log(iInfo);
                tools.giveSuccess(res, "Success in Like", null);
            }
        });
    }
    else {
        connection.query(urlLikeQuery1_2, queryParams, function(err, dInfo) {
            if (err != undefined) {
                tools.giveError(res, 503, "Error in Like", err);
            }
            else {
                console.log(dInfo);
                tools.giveSuccess(res, "Success in Like", null);
            }
        });
    }
}

router.get(urlTagListURL, urlTagList);
function urlTagList(req, res, next) {
    const urlKey = req.params.urlKey;
    const queryParams = [urlKey];
    connection.query(urlTagListQuery, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Tag List", err);
        }
        else {
            tools.giveSuccess(res, "Success in Tag List", cur);
        }
    });
}

router.post(urlTagAddURL, urlTagAdd);
function urlTagAdd(req, res, next) {
    const urlKey = req.params.urlKey;
    const tag = req.body.tag;
    const queryParams = [urlKey, tag];
    connection.query(urlTagAddQuery, queryParams, function(err, iInfo){
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Tag Add", err);
        }
        else {
            console.log(iInfo);
            req.body.tagKey=iInfo.insertKey;
            tools.giveSuccess(res, "Success in Tag Add", req.body);
        }
    });
}

router.post(urlTagRemoveURL, urlTagRemove);
function urlTagRemove(req, res, next) {
    const urlKey = req.params.urlKey;
    const tagKey = req.body.tagKey;
    const queryParams = [tagKey, urlKey];
    connection.query(urlTagRemoveQuery, queryParams, function(err, dInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Tag Remove", err);
        }
        else {
            console.log(dInfo);
            tools.giveSuccess(res, "Success in Tag Remove", null);
        }
    });
}

router.get(urlCommentListURL, urlCommentList);
function urlCommentList(req, res, next) {
    const urlKey = req.params.urlKey;
    const queryParams = [urlKey];
    connection.query(urlCommentListQuery, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Comment List", err);
        }
        else {
            tools.giveSuccess(res, "Success in Comment List", cur);
        }
    });
}

router.post(urlCommentAddURL, urlCommentAdd);
function urlCommentAdd(req, res, next) {
    const usrKey = req.params.usrKey;
    const urlKey = req.params.urlKey;
    const comment = req.body.comment;
    const queryParams = [urlKey, usrKey, comment];
    connection.query(urlCommentAddQuery, queryParams, function(err, iInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Comment Add", err);
        }
        else {
            console.log(iInfo);
            tools.giveSuccess(res, "Success in Comment Add", null);
        }
    });
}

router.post(urlCommentRemoveURL, urlCommentRemove);
function urlCommentRemove(req, res, next) {
    const usrKey = req.params.usrKey;
    const commentKey = req.body.commentKey;
    const queryParams = [commentKey, usrKey];
    connection.query(urlCommentRemoveQuery, queryParams, function(err, dInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Comment Remove", err);
        }
        else {
            console.log(dInfo);
            tools.giveSuccess(res, "Success in Comment Remove", null);
        }
    });
}

module.exports = router;
