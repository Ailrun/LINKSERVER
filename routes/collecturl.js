var express = require('express');
var mysql = require('mysql');
var router = express.Router();


var connection = mysql.createConnection({
    'host' : 'aws-rds-linkbox.cjfjhr6oeu3e.ap-northeast-1.rds.amazonaws.com',
    'user' : 'LINKBOX',
    'password' : 'dlrpqkfhdnflek',
    'database' : 'LINKBOX'
});

//url 가져오기
router.get('/:usrid/:cbid/urllist', function(req, res, next) {
    console.log(req);
    connection.query('select * from url where cbid = ? ', [req.params.cbid], function (error, cursor) {
        console.log(error);
        res.json(cursor);
    });
});

//url 추가
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

//url 삭제
router.post('/:cbid/removeurl', function(req, res, next) {
    connection.query('delete from url where cbid=? and urlid = ?;', [req.params.cbid, req.body.urlid], function (error, cursor) {
        if (error == undefined) {
            res.json({result : 'true'});
        }
        else {
            res.status(503).json({result : 'false'});
            console.log(error);
        }
    });
});


//urlname 수정
router.post('/:cbid/editurl', function(req, res, next) {
    connection.query("UPDATE url SET urlname=? where urlid=?;", [req.body.urlname, req.body.urlid], function(error, result) {
        if (error) {
            res.json({
                "result" : 'fail'
            });
        }
        else {
            res.json({
                "result" : 'success'
            });
        }
    });
});


//good data of url
router.get('/:usrid/:cbid/:urlid/good', function(req, res, next) {
    connection.query("SELECT good FROM good where usrid=? and cbid=? and urlid=?;", [req.params.usrid, req.params.cbid, req.params.urlid], function(error, cursor) {
        console.log(error);
        if (error != undefined) {
            res.status(503).json({
                "result" : 'fail'
            })
        }
        else {
            res.json({
                "result" : 'success',
                "isgood" : cursor[0]
            });
        }
    }
});


module.exports = router;
