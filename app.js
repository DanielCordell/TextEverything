const twilio = require('twilio');
const express = require('express');
const bodyParser = require('body-parser');
const plugins = require('./plugins/index.js');

let config;
try {
  config = require('./config/config.json');
} catch (ex) {
  console.error('Failed to load config/config.json!');
  console.error('Make sure the file exists.');
  console.error('If you need help, check out the config.example.json file.');
  process.exitCode = 1;
}

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));

app.post('/texteverything/message', function(request, response) {
  const twilioSignature = request.header('X-Twilio-Signature');
  const validTwilioRequest = twilio.validateRequest(
    config.twilio.auth_token,
    twilioSignature,
    config.twilio.webhook_url,
    request.body
  );

  if (validTwilioRequest) {
    plugins.handle(request.body, response);
  } else {
    console.log('Received a potentially spoofed request - dropping silently.');
    response.sendStatus(403);
  }
});

app.listen(config.express.port, function() {
  console.log(`Express app listening on port ${config.express.port}.`);
});
