const twilio = require('twilio');
const express = require('express');
const bodyParser = require('body-parser');

let config;
try {
  config = require('./config/config.json');
} catch (ex) {
  console.error('Failed to load config/config.json!');
  console.error('Make sure the file exists.');
  console.error('If you need help, check out the config.example.json file.');
  process.exit(1);
}

const plugins = require('./plugins/index.js');
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
    if (!config.twilio.allowed_numbers.includes(request.body.From)) {
      console.log(
        `Received command from disallowed number ${
          request.From
        }. Not responding.`
      );

      const twiml = new MessagingResponse();
      response.set('Content-Type', 'text/xml');
      response.send(twiml.toString());
      return;
    }
    plugins.handle(request.body, response);
  } else {
    console.log('Received a potentially spoofed request - dropping silently.');
    response.sendStatus(403);
  }
});

app.listen(config.express.port, function() {
  console.log(`Express app listening on port ${config.express.port}.`);
});
