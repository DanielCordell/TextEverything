const rq = require('request-promise')
const MessagingResponse = require('twilio').twiml.MessagingResponse;

var methods = {
    run: function(request, response){
        var reqData = request.Body.split(" ")
        var data = ''
        var options = {
            uri: 'https://api.github.com/repos/' + reqData[1] + '/' + reqData[2] + '/commits?per_page=' + reqData[3],
            headers: {
                'User-Agent': 'Request-Promise'
            },
        };
        rq(options).then(function(htmlString) {
            try{
                var json = JSON.parse(htmlString)
                data += 'Previous ' + reqData[3] + ' commits:'
                for (var i = 0; i < reqData[3]; i++){
                    var c = json[i].commit
                    var datetime = c.author.date.split('T')
                    var date = datetime[0]
                    var time = datetime[1].replace('Z','')
                    data += '\n\n' + c.author.name + '\n' + date + ' ' + time + '\n' + c.message
                }
            } catch (ex) {
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
        }).catch((err) => {
            console.log('HTTP Request Failed!')
            data = 'HTTP Request Failed. Check your arguments. Format is:\ncommit-history <github username> <repo name> <number of commits>'
            console.log(err)
        })
    },

    meta: {
        aliases: ['commit', 'commithistory', 'commit_history', 'commit-history']
    }
}
module.exports = methods
