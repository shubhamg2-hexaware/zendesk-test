const request = require('request');
var deasync=require('deasync');
var flag = require('./flag.json');
var natural = require('natural');
const FACEBOOK_ACCESS_TOKEN = "EAAc6hI7VvPwBALT7EkqShfe2H2SimKfSZCfLKGTtgLUHMY5ZBOKHUf4Ti1n2B9Cp2CR8OVqTZCFZBeuFNjNpZCsLeIgzH8YPDZCyXNSswTZAowgSjyw185QQZCXnf6FbimctLKhuXm6ogvJFZAkjn3ByHpZAE0RBOiQ6uolxgUplO40QZDZD";
const API_AI_TOKEN = '6b40dcc3b68848bf84c7332d98166377'; // silly-name-maker agent.
const apiAiClient = require('apiai')(API_AI_TOKEN);
var Zendesk = require('zendesk-node-api');

var async = require('async');

const sendTextMessage = (senderId, text) => {
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
        method: 'POST',
        json: {
            recipient: { id: senderId },
            message: { text },
        }
    });
};

module.exports = (event) => {
    const senderId = event.sender.id;
    const message = event.message.text;
    var tickets;

    if(flag.fl) {
        var apiaiSession = apiAiClient.textRequest(message, {sessionId: 'cool'});
        //console.log(apiaiSession);
        apiaiSession.on('response', (response) => {
            var result = response.result.fulfillment.speech;
            //console.log(response.result.fulfillment.messages[0]);
            console.log(response.result.metadata.intentName);
            if(response.result.metadata.intentName != "Default Fallback Intent") {
                sendTextMessage(senderId, result);
            } else {
                flag.fl = false;
                var defaultMessage = "We are connecting you our live agent!";
                var zendesk = new Zendesk({
                  url: 'https://humanbot.zendesk.com', // https://example.zendesk.com
                  email: 'wrestligmania9@gmail.com', // me@example.com
                  token: 'QoDoULlBytoaT3t1KW92dLo63gp7pv4uQp3NamOD' // hfkUny3vgHCcV3UfuqMFZWDrLKms4z3W2f6ftjPT
                });

                zendesk.tickets.list().then(function(ticketList){
                    console.log(ticketList);
                    tickets = ticketList;
                });
                //sendTextMessage(senderId, defaultMessage);
                tickets.forEach(function(element) {
                    if(element.via.channel == "facebook" && element.via.source.from.facebook_id == senderId) {
                        console.log("~~~~~~~~~~yes~~~~~~~~~~~~~~~~");
                    }
                })
            }
        });
        apiaiSession.on('error', error => console.log(error));
        apiaiSession.end();
    }

    
};

// var Zendesk = require('zendesk-node-api');
 
