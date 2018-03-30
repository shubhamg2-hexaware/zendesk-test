var express = require('express');
var app = express();
var router = express.Router();

const verificationController = require('./src/verification');
const messageWebhookController = require('./src/messageWebhook');
const defaultController = require('./src/defaultController');

router.route('/')

  .get(verificationController)

  .post(messageWebhookController);

router.route('/v1/df')

  .post(defaultController);

module.exports = router;