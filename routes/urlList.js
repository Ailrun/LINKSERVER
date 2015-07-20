var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
    'host' : 'aws-rds-linkbox.cjfjhr6oeu3e.ap-northeast-1.rds.amazonaws.com',
    'user' : 'LINKBOX',
    'password' : 'dlrpqkfhdnflek',
    'database' : 'LINKBOX'
});

const urlListQuery = ('SELECT U.*, GL.*\
                      FROM urlList AS U\
                      LEFT JOIN goodList AS GL ON U.urlKey=GL.urlKey\
                      WHERE U.urlKey IN\
                      ( SELECT UofL.urlKey\
                      FROM urlOfBoxList On UofL\
                      WHERE UofL.boxKey=? )\
                      AND GL.usrKey=?\
                      ORDER By U.urlDate');

router.get('/:usrKey/:boxKey/urlList', function(req, res, next) {
    var boxKey = req.params.boxKey;
    var usrKey = req.params.usrKey;
    connection.query(urlListQuery, [boxKey, usrKey], function (error, urlList) {
        if (error != undefined) {
            res.status(503).json(
                'there is some error in get url'
            );
            console.log(error);
        }
        else {
            res.json({
                'result' : true,
                'object' : urlList
            });
        }
    });
});

router.post('/:usrid/:cbid/addurl', function(req, res, next){
    connection.query('SELECT MAX(urlid) as max from url;', function(error, cursor){
        connection.query('INSERT INTO url (urlid, urlname, urlthumbnails, address, usrid, cbid) values(?, ?, ?, ?, ?, ?);', [cursor[0].max+1, req.body.urlname, req.body.urlthumb, req.body.address, req.params.usrid, req.params.cbid], function(error, info) {
            if (error != undefined) {
                res.sendStatus(503);
                console.log(error);
            }
            else {
                res.json({
                    "result": 1,
                    "urlid": info.insertId,
                    "address": req.body.address,
                    "urlname": req.body.urlname,
                    "urlwriter": req.body.urlwriter,
                    "urldate": req.body.time,
                    "urlthumb": req.body.urlthumb
                });
            }
        });
    });
});

module.exports = router;
