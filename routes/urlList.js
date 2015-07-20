var express = require('express');
var mysql = require('mysql');
var router = express.Router();

var connection = mysql.createConnection({
    'host' : 'aws-rds-linkbox.cjfjhr6oeu3e.ap-northeast-1.rds.amazonaws.com',
    'user' : 'LINKBOX',
    'password' : 'dlrpqkfhdnflek',
    'database' : 'LINKBOX'
});

router.get('/:usrid/:cbid/urllist', function(req, res, next) {
    console.log(req);
    connection.query('select * from url where cbid = ? ', [req.params.cbid], function (error, cursor) {
        console.log(error);
        res.json(cursor);
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
