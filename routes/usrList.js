var express = require('express');
var router = express.Router();
var tools = require('./tools');

require('./connection')();

const usrLoginURL = ("/Login/:deviceKey");
const usrLoginQuery1 = ("SELECT usrKey, usrID, usrName, usrProfile, usrType FROM usrList Us WHERE usrID=?;");
const usrLoginQuery2 = ("SELECT 1 FROM tokenList WHERE deviceKey=?;");
const usrLoginQuery3_1 = ("INSERT INTO tokenList (usrKey, pushToken, deviceKey) VALUES (?, ?, ?);");
const usrLoginQuery3_2 = ("UPDATE tokenList SET usrKey=?, pushToken=? WHERE deviceKey=?");
const usrSignupURL = ("/Signup/:deviceKey");
const usrSignupQuery1 = ("SELECT 1 FROM usrList WHERE usrID=?;");
const usrSignupQuery2 = ("INSERT INTO usrList (usrID, usrPassword, usrName) VALUES (?, ?, ?);");
const usrSignupQuery3 = ("SELECT 1 FROM tokenList WHERE deviceKey=?;");
const usrSignupQuery4_1 = ("INSERT INTO tokenList (usrKey, pushToken, deviceKey) VALUES (?, ?, ?);");
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

router.post(usrLoginURL, usrLogin1);
function usrLogin1(req, res, next) {
    const usrID = req.body.usrID;
    const usrType = req.body.usrType;
    const pushToken = req.body.pushToken;
    const queryParams = [usrID, usrType];
    connection.query(usrLoginQuery1, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in usrLogin1", err);
        }
        else if (cur.length == 0) {
            tools.giveFail(res, "Fail in usrLogin1", null);
        }
        else {
            req.body = cur[0];
            req.body.pushToken = pushToken;
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
        else {
            console.log(cur);
            usrLogin3(cur.length, req, res, next);
        }
    });
}
function usrLogin3(len, req, res, next) {
    const deviceKey = req.params.deviceKey;
    const usrKey = req.body.usrKey;
    const pushToken = req.body.pushToken;
    const queryParams = [usrKey, pushToken, deviceKey];
    if (len == 0) {
        connection.query(usrLoginQuery3_1, queryParams, function(err, iInfo) {
            if (err != undefined) {
                tools.giveError(res, 503, "Error in usrLogin3", err);
            }
            else {
                tools.giveSuccess(res, "Success in usrLogin3", req.body);
            }
        });
    }
    else {
        connection.query(usrLoginQuery3_2, queryParams, function(err, uInfo) {
            if (err != undefined) {
                tools.giveError(res, 503, "Error in usrLogin3", err);
            }
            else {
                tools.giveSuccess(res, "Success in usrLogin3", req.body);
            }
        });
    }
}

router.post(usrSignupURL, usrSignup1);
function usrSignup1(req, res, next) {
    const usrID = req.body.usrID;
    const queryParams = [usrID];
    connection.query(usrSignupQuery1, queryParams, function(err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in usrSignup1", err);
        }
        else if (cur.length > 0) {
            tools.giveFail(res, "Fail in usrSignup1");
        }
        else {
            usrSignup2(req, res, next);
        }
    });
}
function usrSignup2(req, res, next) {
    const usrID =req.body.usrID;
    const usrPassword = req.body.usrPassword;
    const usrName = req.body.usrName;
    const queryParams = [usrID, usrPassword, usrName];
    connection.query(usrSignupQuery2, queryParams, function(err, iInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Signup2", err);
        }
        else {
            req.body.usrKey = iInfo.insertId;
            usrSignup3(req, res, next);
        }
    });
}
function usrSignup3(req, res, next) {
    const deviceKey = req.params.deviceKey;
    const queryParams = [deviceKey];
    connection.query(usrSignupQuery3, queryParams, function (err, cur) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Signup3", err);
        }
        else {
            usrSignup4(cur.length, req, res, next);
        }
    });
}
function usrSignup4(len, req, res, next) {
    console.log(req.params);
    const deviceKey = req.params.deviceKey;
    const usrKey = req.body.usrKey;
    const pushToken = req.body.pushToken;
    const queryParams = [usrKey, pushToken, deviceKey];
    if (!len) {
        connection.query(usrSignupQuery4_1, queryParams, function (err, iInfo) {
            if (err != undefined) {
                tools.giveError(res, 503, "Error in Signup4-1", err);
            }
            else {
                tools.giveSuccess(res, "Success in Signup4", req.body);
            }
        });
    }
    else {
        connection.query(usrSignupQuery4_2, queryParams, function (err, uInfo) {
            if (err != undefined) {
                tools.giveError(res, 503, "Error in Signup4-2", err);
            }
            else {
                tools.giveSuccess(res, "Success in Signup4", req.body);
            }
        });
    }
}

router.post(usrProfileURL, usrProfile);
function usrProfile(req, res, next) {
    const usrProfile = req.body.usrProfile;
    const usrKey = req.body.usrKey;
    const queryParams = [usrProfile, usrKey];
    connection.query(usrProfileQuery, queryParams, function (err, uInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Profile", err);
        }
        else {
            tools.giveSuccess(res, "Success in Profile", null);
        }
    });
}

router.post(usrPassEditURL, usrPassEdit);
function usrPassEdit(req, res, next) {
    const usrPassword = req.body.usrPassword;
    const usrKey = req.body.usrKey;
    const usrID = req.body.usrID;
    const queryParams = [usrPassword, usrKey, usrID];
    connection.query(usrPassEditQuery, queryParams, function(err, uInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in PassEdit", err);
        }
        else {
            tools.giveSuccess(res, "Success in PasEdit", null);
        }
    });
}

router.post(usrLogoutURL, usrLogout);
function usrLogout(req, res, next) {
    const deviceKey = req.params.deviceKey;
    const queryParams = [deviceKey];
    connection.query(usrLogoutQuery, queryParams, function(err, dInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Logout", err);
        }
        else {
            tools.giveSuccess(res, "Success in Logout", null);
        }
    });
}

router.post(usrSigndownURL, usrSigndown);
function usrSigndown(req, res, next) {
    const usrKey = req.body.usrKey;
    const usrID = req.body.usrID;
    const usrPassword = req.body.usrPassword;
    const queryParams = [usrKey, usrID, usrPassword, usrKey];
    connection.query(usrSigndownQuery, queryParams, function(err, dInfo) {
        if (err != undefined) {
            tools.giveError(res, 503, "Error in Signdown", err);
        }
        else {
            tools.giveSuccess(res, "Success in Signdown", null);
        }
    });
}

module.exports = router;
