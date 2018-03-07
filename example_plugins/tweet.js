const rq = require('request-promise')
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const twitter = require('twitter')

var methods = {
    run: function(request, response){
        var config = ''
        var data = ''
        try{
            config = require('../config/twitter.json')
        }
        catch(ex){
            const error = new MessagingResponse()
            error.message("config/twitter.json not found. Please see config/twitter.example.json.")
            response.end(error.toString())
            return
        }
        var message = request.Body.split(" ").slice(1).join(" ")
        var client = ''
        client = new twitter({
            consumer_key: config.twitter.consumer_key,
            consumer_secret: config.twitter.consumer_secret,
            access_token_key: config.twitter.access_token_key,
            access_token_secret: config.twitter.access_token_secret
        })
        var params = {status: message}
        const twiml = new MessagingResponse()
        if (message.length > 140){
            twiml.message("Your tweet was too long, and was not sent.")
            response.end(twiml.toString())
            return
        }
        client.post('statuses/update', params).then(function(tweet){
            twiml.message("Tweet Sent!")
            response.end(twiml.toString())
        }).catch(function(error){
            twiml.message("There was an error sending the tweet.")
            response.end(twiml.toString())
            return
        })
    },

    meta: {
        aliases: ['tweet', 'tweeting']
    }
}
module.exports = methods
