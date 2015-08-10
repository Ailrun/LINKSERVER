module.exports = function() {
    this.connection = require('mysql').createConnection({
        'host' : 'linkdata.cdwx8onq196y.us-west-2.rds.amazonaws.com',
        'user' : 'JunyoungJang',
        'password' : 'linkdatabase',
        'database' : 'linkserver'
    });
};
