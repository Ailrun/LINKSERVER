var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
    'host' : 'aws-rds-linkbox.cjfjhr6oeu3e.ap-northeast-1.rds.amazonaws.com',
    'user' : 'LINKBOX',
    'password' : 'dlrpqkfhdnflek',
    'database' : 'LINKBOX'
});

const urlListQuery = ('SELECT U.*,\
                      SUM(GL.usrKey=?) goodChecked,\
                      COUNT(GL.usrKey) goodNumber\
                      FROM\
                      ( SELECT U.*\
                      FROM urlOfBoxList UofL\
                      JOIN urlList U\
                      ON boxKey=?\
                      AND U.urlKey=UofL.urlKey ) U\
                      LEFT JOIN goodList GL ON GL.urlKey=U.urlKey\
                      GROUP BY U.urlKey\
                      ORDER BY U.urlDate');
var usrList = function(req, res, next) {
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
};
router.get('/:usrKey/:boxKey/urlList', usrList);

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

const addUrlQuery = ('INSERT INTO urlList\
                     (urlWriterKey, url, urlThumbnail,\
                     urlTitle)\
                     VALUES (?, ?, ?, ?)');
var addUrl = function(req, res, next) {
    var usrKey = req.params.usrKey;
    var url = req.body.url;
    var urlThumbnail = req.body.urlThumbnail;
    var urlTitle = req.body.urlTitle;
    var queryParams = [usrKey, url, urlThumbnail, urlTitle];
    connection.query(addUrlQuery, queryParams, function(error, insertInfo) {
        if (error != undefined) {
            res.status(503).json({
                //'result' : false,
                'message' : 'there is some error in add url'
            });
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
router.post('/:usrKey/:boxKey/addUrl', addUrl);

module.exports = router;
