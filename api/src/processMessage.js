const request = require('request');
var deasync=require('deasync');
var flag = require('./flag.json');
var natural = require('natural');
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_TOKEN;
const API_AI_TOKEN = process.env.AI_TOKEN; // silly-name-maker agent.
const apiAiClient = require('apiai')(API_AI_TOKEN);
var Zendesk = require('zendesk-node-api');
var zendesk = require('node-zendesk');
var exampleConfig = require('./config');
require('dotenv').config()

var async = require('async');

var client = zendesk.createClient({
  username:  exampleConfig.auth.username,
  token:     exampleConfig.auth.token,
  remoteUri: exampleConfig.auth.remoteUri
});

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
    var identity;
    var userId;
    //console.log(event);

    var options = {
        method:'GET',
        url:`https://graph.facebook.com/v2.6/${senderId}`,
        qs: { access_token: FACEBOOK_ACCESS_TOKEN },
    }

    

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
                //console.log("inside else part");
                f = false;
                var defaultMessage = "We are connecting you our live agent!";
                var zendesk = new Zendesk({
                  url: 'https://humanbot.zendesk.com', // https://example.zendesk.com
                  email: 'wrestlingmania9@gmail.com', // me@example.com
                  token: process.env.ZENDESK_TOKEN// hfkUny3vgHCcV3UfuqMFZWDrLKms4z3W2f6ftjPT
                });
                
                zendesk.tickets.list().then(function(ticketList) { // getting all tickets.
                    console.log(ticketList + "hello");
                    tickets = ticketList;
                    request(options, function(error, response, body) { // getting profile information from sender_id
                        var res = JSON.parse(response.body);
                        firstName = res.first_name;
                        lastName = res.last_name;
                        identity = firstName + " " + lastName;
                        tickets.forEach(function(element) {
                            if(element.via.channel == "facebook") {
                                console.log(element.via.source.from.name);
                                if(element.via.source.from.name == identity) {
                                    console.log("~~~~matched~~~~");
                                    client.sessions.get(function (err, res, result) {
                                    if (err) {
                                        console.log(err);
                                        return;
                                    } else {
                                        if(result.length != 0) {
                                            //userId = 361360698294; //result[0].user_id;
                                            console.log(element.id);
                                            zendesk.tickets.update(element.id, {
                                                "ticket": {
                                                    "assignee_id":361225337273
                                                }
                                            }).then(function(result2) {
                                                console.log(result2, "~~~~update result~~~~");
                                            })
                                        }
                                    }
                                    //console.log(responseList, "responseList");
                                    //console.log(resultList, "resultList");
                                    //console.log(JSON.stringify(result, null, 2, true));
                                    });// getting the session of a user.
                                }
                            }
                        })
                    });
                });
                //sendTextMessage(senderId, defaultMessage);
            }
        });
        apiaiSession.on('error', error => console.log(error));
        apiaiSession.end();
    }

    
};

// var Zendesk = require('zendesk-node-api');
 
