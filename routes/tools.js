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
    giveFail : function(res, message, object) {
        res.json({
            result : false,
            message : message,
            object :object
        });
        console.log(message);
        console.log(object);
    },
    giveSuccess : function(res, message, object) {
        res.json({
            result : true,
            message : message,
            object : object
        });
        console.log(message);
        console.log(object);
    }
}
