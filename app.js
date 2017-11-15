const twilio = require('twilio')
const express = require('express')
const body_parser = require('body-parser')

const plugins = require('./plugins/index.js')

var config = ""
try {
	config = require('./config/config.json')
} catch (ex) {
	console.log('Failed to load config/config.json!')
	console.log('Make sure the file exists.')
	console.log('If you need help, check out the config.example.json file.')

	process.exitCode = 1
}

var twilio_client = new twilio(config.twilio.account_sid, config.twilio.auth_token)
var express_app = express()

express_app.use(body_parser.urlencoded({extended: false}))

express_app.post('/texteverything/message', function(request, response) {

	const twilio_signature = request.header('X-Twilio-Signature')
	const validTwilioRequest = twilio.validateRequest(config.twilio.auth_token, twilio_signature,
				config.twilio.webhook_url, request.body)

	if(validTwilioRequest) {
		plugins.handle(request.body, response)
	} else {
		console.log("Received a potentially spoofed request - dropping silently.")
	}
})

var listener = express_app.listen(config.express.port, function() {
	console.log(`Express app listening on port ${config.express.port}.`)
})
