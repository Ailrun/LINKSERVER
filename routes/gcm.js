const serverApiKey = 'AIzaSyDFpvBEzqfKIaVsBgLYPFvnTUN-MFU9qf8';

module.exports = function() {
    this.gcm = require('node-gcm');
    this.sender = new this.gcm.Sender(serverApiKey);
}
