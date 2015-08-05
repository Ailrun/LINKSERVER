module.exports = {
    giveError : function(res, status, message, err) {
        res.status(status).json({
            result : false,
            message : message,
            object : {}
        });
        console.log(message);
        console.log(err);
    },
    giveResult : function(res, result, message, object) {
        res.json({
            result : result,
            message : message,
            object : object
        });
        console.log(message);
        console.log(object);
    }
}
