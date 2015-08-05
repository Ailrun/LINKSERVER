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


//Seperate Tag loading from url loading
const urlAllListURL = ("/AllList/:usrKey/:startNum/:urlNum");
const urlAllListQuery = ("SELECT Ur.urlKey, Ur.url, Ur.urlTitle, Ur.urlThumbnail, Ur.urlDate, Us.usrName, GROUP_CONCAT(T.tag),\
                         SUM(UrofU.good=1 AND UrofU.usrKey=?) good, SUM(UrofU.good=1) goodNum, SUM(UrofU.hidden=1 AND UrofU.usrKey=?) hidden, SUM(UrofU.readLater=1 AND UrofU.usrKey=?) readLater\
                         FROM urlList Ur JOIN urlOfUsrList UrofU ON Ur.urlKey=UrofU.urlKey JOIN usrList Us ON Us.usrKey=Ur.urlWriterUsrKey JOIN tagList T ON T.urlKey=Ur.urlKey\
                         WHERE Ur.urlWriterUsrKey=? GROUP BY Ur.urlKey ORDER BY Ur.urlDate DECS LIMIT ?, ?;");
const urlFavoriteListURL = ("/FavoriteList/:usrKey/:startNum/:urlNum");
const urlFavoriteListQuery = ("SELECT Ur.urlKey, Ur.url, Ur.urlTitle, Ur.urlThumbnail, Ur.urlDate, Us.usrName, GROUP_CONCAT(T.tag),\
                              SUM(UrofU.good=1 AND UrofU.usrKey=?) good, SUM(UrofU.good=1) goodNum, SUM(UrofU.hidden=1 AND UrofU.usrKey=?) hidden, SUM(UrofU.readLater=1 AND UrofU.usrKey=?) readLater\
                              FROM urlList Ur JOIN urlOfUsrList UrofU ON Ur.urlKey=UrofU.urlKey JOIN usrList Us ON Us.usrKey=Ur.urlWriterUsrKey JOIN tagList T ON T.urlKey=Ur.urlKey\
                              WHERE Ur.urlWriterUsrKey=? GROUP BY Ur.urlKey ORDER BY Ur.urlDate DECS LIMIT ?, ?;");
const urlNonHiddenListURL = ("/NonHiddenList/:usrKey/:startNum/:urlNum");
const urlNonHiddenListQuery = ("SELECT Ur.urlKey, Ur.url, Ur.urlTitle, Ur.urlThumbnail, Ur.urlDate, Us.usrName, GROUP_CONCAT(T.tag),\
                               SUM(UrofU.good=1 AND UrofU.usrKey=?) good, SUM(UrofU.good=1) goodNum, 0 hidden, SUM(UrofU.readLater=1 AND UrofU.usrKey=?) readLater\
                               FROM urlList Ur JOIN urlOfUsrList UrofU ON Ur.urlKey=UrofU.urlKey AND UrofU.hidden=0 JOIN usrList Us ON Us.usrKey=Ur.urlWriterUsrKey JOIN tagList T ON T.urlKey=Ur.urlKey\
                               WHERE Ur.urlWriterUsrKey=? GROUP BY Ur.urlKey ORDER BY Ur.urlDate DECS LIMIT ?, ?;");
const urlBoxListURL = ("/BoxList/:usrKey/:startNum/:urlNum");
const urlBoxListQuery = ("SELECT Ur.urlKey, Ur.url, Ur.urlTitle, Ur.urlThumbnail, Ur.urlDate, Us.usrName, GROUP_CONCAT(T.tag),\
                         SUM(UrofU.good=1 AND UrofU.usrKey=?) good, SUM(UrofU.good=1) goodNum, SUM(UrofU.hidden=1 AND UrofU.usrKey=?) hidden, SUM(UrofU.readLater=1 AND UrofU.usrKey=?) readLater\
                         FROM urlList Ur JOIN urlOfUsrList UrofU ON Ur.urlKey=UrofU.urlKey JOIN usrList Us ON Us.usrKey=Ur.urlWriterUsrKey JOIN tagList T ON T.urlKey=Ur.urlKey\
                         WHERE Ur.urlWriterUsrKey=? AND Ur.urlBoxKey=? GROUP BY Ur.urlKey ORDER BY Ur.urlDate DECS LIMIT ?, ?;");
const urlAddURL = ("/Add/:usrKey/:boxKey");
const urlAddQuery1 = ("INSERT INTO urlList (urlBoxKey, urlWriterUsrKey, url, urlTitle, urlThumbnail) VALUES (?, ?, ?, ?, ?);");
const urlAddQuery2 = ("INSERT INTO urlOfUsrList (usrKey, urlKey, readLater) VALUES (?, ?, ?);");
const urlAddQuery3 = ("INSERT INTO alarmList (alarmType, alarmGetUsrKey, alarmSetUsrKey, alarmBoxKey, alarmUrlKey) SELECT 1, usrKey, ?, ?, urlKey FROM urlOfUsrList WHERE urlKey=?;");
const urlRemoveURL = ("/Remove/:usrKey/:boxKey");
const urlRemoveQuery = ("UPDATE urlList SET urlTitle=? WHERE urlKey=? AND urlWriterUsrKey=?;");
const urlEditURL = ("/Edit/:usrKey/:boxKey");
const urlEditQuery = ("UPDATE urlOfUsrList SET hidden=? WHERE urlKey=? AND usrKey=?;");
const urlHiddenURL = ("/Hidden/:usrKey/:boxKey");
const urlHiddenQuery = ("UPDATE urlOfUsrList SET hidden=? WHERE urlKey=? AND usrKey=?;");
const urlMoveURL = ("/Move/:usrKey/:originalBoxKey/:targetBoxKey");
const urlMoveQuery1 = ("INSERT INTO urlList (urlBoxKey, urlWriterUsrKey, url, urlTitle, urlThumbnail) SELECT ?, ?, url, urlTItle, urlThumbnail FROM urlList WHERE urlKey=?;");
const urlMoveQuery2 = ("INSERT INTO urlOfUsrList (usrKey, urlKey, readLater) VALUES (?, ?, ?);");
const urlLikeURL = ("/Like/:usrKey/:boxKey");
const urlLikeQuery = ("UPDATE urlOfUsrList SET good=? WHERE urlKey=? AND usrKey=?;");
const urlTaggAddURL = ("/Tag/Add/:usrKey/:boxKey/:urlKey");
const urlTagAddQuery = ("INSERT INTO tagList (urlKey, tag) VALUES (?, ?);");
const urlTagRemoveURL = ("/Tag/Add/:usrKey/:boxKey/:urlKey");
const urlTagRemoveQuery = ("DELETE FROM tagList WHERE tagKey=? AND urlKey=?;");
const urlCommentListURL = ("/Comment/List/:usrKey/:boxKey/:urlKey");
const urlCommentListQuery = ("SELECT C.usrKey, Us.usrThumbnail, Us.usrName, C.comment, C.commentDate FROM commentList C JOIN usrList Us ON Us.usrKey=C.usrKey WHERE C.urlKey=?\
                             ORDER BY C.commentDate DECS;");
const urlCommentAddURL = ("/Comment/Add/:usrKey/:boxKey/:urlKey");
const urlCommentAddQuery = ("INSERT INTO commentList (urlKey, usrKey, comment) VALUES (?, ?, ?);");
const urlCommentRemoveURL = ("/Comment/Remove/:usrKey/:boxKey/:urlKey");
const urlCommentRemoveQuery = ("DELETE FROM commentList WHERE commentKey=? AND usrKey=?;");
const urlCommentEditURL = ("/Comment/Edit/:usrKey/:boxKey/:urlKey");
const urlCommentEditQuery = ("UPDATE commentList SET comment=? WHERE commentKey=? AND usrKey=?;");

module.exports = router;
