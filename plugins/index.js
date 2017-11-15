const MessagingResponse = require('twilio').twiml.MessagingResponse;
var config = require('./../config/config.json')

var normalPath = require('path').join(__dirname)
var methods = {
	handle: function(request, response) {
		require('fs').readdir(normalPath, (err, files) => {
			if(err)
			{
				throw err
			}

			var validCommand = false

			if(!config.twilio.allowed_numbers.includes(request.From))
			{
				console.log(`Received command from disallowed number ${request.From}. Not responding.`)
				return
			}

			files.forEach(function(element) {
				if(element != 'index.js') {
					const plugin = require('./' + element)
					if(plugin.meta.aliases.indexOf(request.Body.split(" ")[0].toLowerCase()) > -1) {
						plugin.run(request, response)
						console.log(`Executing ${element} for ${request.From}.`)
						validCommand = true
					}
				}
			})
			if (validCommand == false){
				const twiml = new MessagingResponse()
				console.log(`Received invalid command ${request.Body} from ${request.From}.`)
				twiml.message(`Sorry, that's an invalid command.\nCheck your plugins folder for a list of valid commands.`)
				response.writeHead(200,{'Content-Type': 'text/xml'})
				response.end(twiml.toString())
			}
		})
	}
}

module.exports = methods
