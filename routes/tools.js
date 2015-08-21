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
    giveSuccess : function(res, message, object) {
        res.json({
            result : true,
            message : message,
            object : object
        });
        console.log(message);
        console.log(object);
    },
    giveFail : function(res, message, object) {
        res.json({
            result : false,
            message : message,
            object :object
        });
        console.log(message);
    }
}
