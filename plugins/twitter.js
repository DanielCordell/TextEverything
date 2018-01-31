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
        var req_data = request.Body.split(" ")
        var twitter_account = req_data[1]
        var number_of_tweets = req_data[2]

        var client = ''
        var twitter_data = ''
        client = new twitter({
            consumer_key: config.twitter.consumer_key,
            consumer_secret: config.twitter.consumer_secret,
            access_token_key: config.twitter.access_token_key,
            access_token_secret: config.twitter.access_token_secret
        })
        var params = ''
        var uri = ''
        if (twitter_account.toLowerCase() == 'me'){
            params = {count: number_of_tweets}
            uri = 'statuses/home_timeline'
            twitter_account = 'your twitter'
        }
        else{
            uri = 'statuses/user_timeline'
            params = {screen_name: twitter_account, count: number_of_tweets};
        }
        client.get(uri, params).then(function(tweets){
            twitter_data = tweets
            try{
                data += 'Previous ' + number_of_tweets + ' tweets from ' + twitter_account + ':\n'
                for (var i = 0; i < number_of_tweets; i++){
                    var datetime = twitter_data[i].created_at
                    var tweet = twitter_data[i].text
                data += '\n' + datetime + '\n' + tweet +  '\n'
                }
            } catch (ex) {
                console.log(ex)
                console.log('Failed to parse the JSON data.')
                data = 'Failed to parse the JSON data.'
            }

            const twiml = new MessagingResponse()
            if (data.length > 1600){
                var msg = data.substring(0,1454) + '\n\nERROR: EXCEEDED MAXIMUM TEXT LENGTH'
                console.log(msg)
                twiml.message(msg)
            }
            else  {
                twiml.message(data)
            }
            response.end(twiml.toString())
        }).catch(function(err){
            twiml.message("There was an error accessing the timeline")
            response.end(twiml.toString())
            return
        })
    },

    meta: {
        aliases: ['twitter', 'twit']
    }
}
module.exports = methods
