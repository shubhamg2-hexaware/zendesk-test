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
    var f = true;

    if(f) {
        console.log("inside if statement");
        var apiaiSession = apiAiClient.textRequest(message, {sessionId: 'cool'});
        //console.log(apiaiSession);
        console.log("inside apiai session");
        apiaiSession.on('response', (response) => {
            var result = response.result.fulfillment.speech;
            //console.log(response.result.fulfillment.messages[0]);
            console.log(response.result.metadata.intentName);
            if(response.result.metadata.intentName != "Default Fallback Intent") {
                sendTextMessage(senderId, result);
            } else {
                console.log("inside else part");
                f = false;
                var defaultMessage = "We are connecting you our live agent!";
                var zendesk = new Zendesk({
                  url: 'https://humanbot.zendesk.com', // https://example.zendesk.com
                  email: 'wrestlingmania9@gmail.com', // me@example.com
                  token: 'PRNRUtWq6hEDj0NFzFhdU5VbuYLnDpUw9LJyMwAI' // hfkUny3vgHCcV3UfuqMFZWDrLKms4z3W2f6ftjPT
                });
                console.log("middle of zendesk");
                zendesk.tickets.update(6, {
                    ticket: {
                        "assignee_id":361265200073
                        }
                }).then(function(result){
                    console.log(result);
                });
                // zendesk.tickets.list().then(function(ticketList) {
                //     console.log(ticketList + "hello");
                //     tickets = ticketList;
                //     tickets.forEach(function(element) {
                //         console.log(element.via.channel);
                    
                //         if(element.via.channel == "facebook") {
                //             console.log(element.via.source.from.facebook_id);
                //             if(element.via.source.from.facebook_id == senderId) {
                //                 console.log("~~~~~~~~~~yes~~~~~~~~~~~~~~~~");
                //             }
                //         }
                //     })
                // });
                //sendTextMessage(senderId, defaultMessage);
            }
        });
        apiaiSession.on('error', error => console.log(error));
        apiaiSession.end();
    }

    
};

// var Zendesk = require('zendesk-node-api');
 
