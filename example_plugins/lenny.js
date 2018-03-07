const rq = require('request-promise')
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const twilio = require('twilio')

var methods = {
    run: function(request, response) {
        rq('http://lenny.today/api/v1/random').then(function(htmlString) {
            var raw_data = htmlString.replace('[', '')
            raw_data = raw_data.replace(']', '')

            var json = ""
            try {
                json = JSON.parse(raw_data)
            } catch (ex) {
                console.log('Failed to parse the JSON data.')
            }
            const twiml = new MessagingResponse()
            twiml.message(`Here's your lenny face: ${json.face}`)
            response.end(twiml.toString())
        }).catch((err) => {
            console.log('HTTP request failed!')
        })
    },

    meta: {
        aliases: ['lenny', 'len']
    }
}

module.exports = methods
