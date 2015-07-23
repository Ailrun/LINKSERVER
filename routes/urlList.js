var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
    'host' : 'aws-rds-linkbox.cjfjhr6oeu3e.ap-northeast-1.rds.amazonaws.com',
    'user' : 'LINKBOX',
    'password' : 'dlrpqkfhdnflek',
    'database' : 'LINKBOX'
});

const urlListURL = '/:usrKey/:boxKey/urlList';
const urlListQuery = ('SELECT U.*,\
                      SUM(GL.usrKey=?) goodChecked,\
                      COUNT(GL.usrKey) goodNumber\
                      FROM urlList U\
                      LEFT JOIN goodList GL ON GL.urlKey=U.urlKey\
                      WHERE U.boxKey=?\
                      GROUP BY U.urlKey\
                      ORDER BY U.urlDate;');
function usrList(req, res, next) {
    var usrKey = req.params.usrKey;
    var boxKey = req.params.boxKey;
    var queryParams = [usrKey, boxKey];
    connection.query(urlListQuery, queryParams, function (error, urlList) {
        if (error != undefined) {
            res.status(503).json({
//                'result' : false,
                'message' : 'there is some error in get url'
            });
            console.log(error);
        }
        else {
            res.json({
                'result' : true,
                'object' : urlList
            });
        }
    });
}
router.get(urlListURL, usrList);

function leadingZeros(n, digits) {
    var zero = '';
    n = n.toString();

    if (n.length < digits) {
        for (i = 0; i < digits - n.length; i++)
            zero += '0';
    }
    return zero + n;
}
function getTimeStamp() {
    var d = new Date();

    var s =
            leadingZeros(d.getFullYear(), 4) + '-' +
            leadingZeros(d.getMonth() + 1, 2) + '-' +
            leadingZeros(d.getDate(), 2) + ' ' +

            leadingZeros(d.getHours(), 2) + ':' +
            leadingZeros(d.getMinutes(), 2) + ':' +
            leadingZeros(d.getSeconds(), 2);

    return s;
}

const addUrlURL = '/:usrKey/:boxKey/addUrl';
const addUrlQuery = ('INSERT INTO urlList\
                     (boxKey, urlWriterUsrKey, url, urlThumbnail,\
                     urlTitle)\
                     VALUES (?, ?, ?, ?, ?);');
function addUrl(req, res, next) {
    var boxKey = req.params.boxKey;
    var usrKey = req.params.usrKey;
    var url = req.body.url;
    var urlThumbnail = req.body.urlThumbnail;
    var urlTitle = req.body.urlTitle;
    var queryParams = [boxKey, usrKey, url, urlThumbnail, urlTitle];
    connection.query(addUrlQuery, queryParams, function(error, insertInfo) {
        if (error != undefined) {
            res.status(503).json({
//                'result' : false,
                'message' : 'there is some error in add url'
            });
            console.log(error);
        }
        else {
            var object = {
                'urlKey' : insertInfo.insertId,
                'url' : url,
                'urlThumbnail' : urlThumbnail,
                'urlTitle' : urlTitle,
                'urlDate' : getTimeStamp()
            };
            console.log(object);
            res.json({
                'result' : true,
                'object' : object
            });
        }
    });
}
router.post(addUrlURL, addUrl);

const removeUrlURL = '/:usrKey/:boxKey/removeUrl';
const removeUrlQuery = ('DELETE\
                        FROM urlList\
                        WHERE urlKey=?\
                        AND boxKey=?;');
function removeUrl(req, res, next) {
    var boxKey = req.params.boxKey;
    var urlKey = req.body.urlKey;
    var queryParams = [urlKey, boxKey];
    connection.query(removeUrlQuery, queryParams, function(error, deleteInfo) {
        if (error != undefined) {
            res.status(403).json({
//                'result' : false,
                'message' : 'there is error in remove url'
            });
        }
        else {
            console.log(deleteInfo);
            res.json({
                'result' : true
            });
        }
    });
}
router.post(removeUrlURL, removeUrl);

const editUrlURL = '/:usrKey/:oldBoxKey/:newBoxKey/editUrl';
const editUrlQuery = ('UPDATE urlList\
                      SET boxKey=?, urlTitle=?,\
                      urlThumbnail=?\
                      WHERE urlKey=?\
                      AND boxKey=?;');
function editUrl(req, res, next) {
    var oldBoxKey = req.params.oldBoxKey;
    var newBoxKey = req.params.newBoxKey;
    var urlKey = req.body.urlKey;
    var urlTitle = req.body.urlTitle;
    var urlThumbnail = req.body.urlThumbnail;
    var queryParams = [newBoxKey, urlTitle, urlThumbnail, urlKey, oldBoxKey];
    connection.query(editUrlQuery, queryParams, function(error, updateInfo) {
        if (error != undefined) {
            res.status(403).json({
//                'result' : false,
                'message' : 'there is some error in update url'
            });
        }
        else {
            res.json({
                'result' : true
            });
            console.log(updateInfo);
        }
    });
}
router.post(editUrlURL, editUrl);

module.exports = router;
