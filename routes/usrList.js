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

const usrLoginURL = ("/Login/:deviceKey/");
const usrLoginQuery1 = ("SELECT usrKey, usrID, usrName, usrProfile, usrType FROM usrList Us WHERE usrID=?;");
const usrLoginQuery2 = ("SELECT 1 FROM tokenList WHERE deviceKey=?;");
const usrLoginQuery3_1 = ("INSERT INTO tokenList (usrKey, pushToken, deviceKey) VALUES (?, ?, ?);");
const usrLoginQuery3_2 = ("UPDATE tokenList SET usrKey=?, pushToken=? WHERE deviceKey=?");
const usrSignupURL = ("/Signup/:deviceKey");
const usrSignupQuery1 = ("SELECT 1 FROM usrList WHERE usrID=?;");
const usrSignupQuery2 = ("INSERT INTO usrList (usrID, usrPassword, usrName) VALUES (?, ?, ?);");
const usrSignupQuery3 = ("SELECT 1 FROM tokenList WHERE deviceKey=?;");
const usrSignupQuery4_1 = ("INSERT INTO tokenList (usrKey, deviceKey, pushToken) VALUES (?, ?, ?);");
const usrSignupQuery4_2 = ("UPDATE tokenList SET usrKey=?, pushToken=? WHERE deviceKey=?;");
const usrProfileURL = ("/Profile");
const usrProfileQuery = ("UPDATE usrList SET usrProfile=? WHERE usrKey=?;");
const usrPassEditURL = ("/PassEdit");
const usrPassEditQuery = ("UPDATE usrList SET usrPassword=? WHERE usrKey=? AND usrID=?;");
const usrLogoutURL = ("/Logout/:deviceKey");
const usrLogoutQuery = ("DELETE FROM tokenList WHERE deviceKey=?;");
const usrSigndownURL = ("/Signdown");
const usrSigndownQuery = ("DELETE FROM usrList WHERE usrKey=? AND usrID=? AND usrPassword=?;\
                          DELETE FROM tokenList WHERE usrKey=?;");

function usrLogin1(req, res, next) {
    const deviceKey = req.params.deviceKey;
    const usrID = req.body.usrID;
    const usrPassword = req.body.usrPassword;
    const usrToken = req.body.usrToken;
    const usrType = req.body.usrType;
    const queryParams = [usrID, usrType];
    connection.query(usrLoginQuery1, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in usrLogin1", err);
        }
        else if (cur.length == 0) {

        }
        else {
            req.body = cur[0];
            usrLogin2(req, res, next);
        }
    });
}
function usrLogin2(req, res, next) {
    const deviceKey = req.params.deviceKey;
    const queryParams = [deviceKey];
    connection.query(usrLoginQuery2, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in usrLogin2", err);
        }
        else if (cur.length == 0) {
            usrLogin3(1, req, res, next);
        }
        else {
            usrLogin3(2, req, res, next);
        }
    });
}
function usrLogin3(k, req, res, next) {
    const deviceKey = req.params.deviceKey;
    const usrKey = req.body.usrKey;
    const usrToken = req.body.usrToken;
    const queryParams = [usrKey, usrToken, deviceKey];
    if (k == 1) {
        connection.query(usrLoginQuery3_1, queryParams, function(err, iInfo) {
            if (err != undefined) {
                tools.giveError(res, 503, "Error in usrLogin3", err);
            }
            else {
                tools.giveResult(res, true, "Result in usrLogin3", req.body);
            }
        });
    }
}

module.exports = router;
