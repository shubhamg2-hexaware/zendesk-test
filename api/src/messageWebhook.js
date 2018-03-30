const processMessage = require('./processMessage');
var db = require('../db/mysql.js');

module.exports = (req, res) => {
    //console.log(req.body);
    if (req.body.object === 'page') {
        console.log(req.body.entry[0].messaging[0]);
        req.body.entry.forEach(entry => {
            entry.messaging.forEach(event => {
                if (event.message && event.message.text) {
                    //db.insertRecord(event, function(res){})
                    processMessage(event);
                }
            });
        });
        res.status(200).end();
    }
};