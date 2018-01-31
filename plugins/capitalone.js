const rq = require('request-promise')
const MessagingResponse = require('twilio').twiml.MessagingResponse;

const twilio = require('twilio')

var methods = {
	run: function(request, response) {
		const twiml = new MessagingResponse()

		// make sure the configuration is set.
		try{
            config = require('../config/capitalone.json')
        }
        catch(ex){
            const error = new MessagingResponse()
            error.message("config/capitalone.json not found. Please see config/capitalone.example.json.")

            response.end(error.toString())
            return
		}

		// start by parsing the arguments.
		if(request.Body.split(" ").length == 1) {
			console.log('[CapitalOne] not enough arguments.')

			twiml.message('Not enough arguments.\nUse: capitalone balance')

			response.end(twiml.toString())

			return
		}

		var intent = request.Body.split(" ")[1]
		var additional_arguments = (request.Body.split(" ").length > 2) ? request.Body.slice(2, request.Body.split(" ").length) : []

		// then decide what the user wanted to do
		if(intent == 'balance') {
			rq(`http://api.reimaginebanking.com/accounts?key=${config.capital_one.api_key}`).then(function(htmlString) {
				var json = ''
				try {
					json = JSON.parse(htmlString)
				} catch (ex) {
					console.log('[CapitalOne] JSON parse failed.')
					twiml.message('A problem occurred while fetching your balance.')

					response.end(twiml.toString())

					return
				}

				var balanceresponse = new MessagingResponse()

				json.forEach(function(account) {
					balanceresponse.message(`The balance of your ${account.type} account, ${account.nickname}, is ${account.balance} GBP.`)
				})

				response.end(balanceresponse.toString())
				return

			}).catch((err) => {
				console.log('HTTP request failed!')
			})
		}

		else if(intent == 'deposits') {
			var accounts = ''
			var msg = ''
			rq(`http://api.reimaginebanking.com/accounts?key=${config.capital_one.api_key}`).then(function(htmlString) {
				var json = ''
				try {
					json = JSON.parse(htmlString)
				} catch (ex) {
					console.log('[CapitalOne] JSON parse failed.')
					twiml.message('A problem occurred while fetching your accounts.')

					response.end(twiml.toString())
					return
				}
				accounts = json
				var deposit_data = ''
				accounts.forEach(function(account, index, array) {
					rq(`http://api.reimaginebanking.com/accounts/${account._id}/deposits?key=${config.capital_one.api_key}`).then(function(htmlString) {
						try {
							deposit_data = JSON.parse(htmlString)
							if(deposit_data.length > 0) {
								deposit_data = deposit_data.slice(0, 3)
								for (var i = 0; i < deposit_data.length; ++i) {
									msg = msg + `On ${deposit_data[i].transaction_date}, ${deposit_data[i].amount} GBP was deposited: "${deposit_data[i].description}".\n`
								}
							} else {
								msg = msg + `${account.nickname} has no deposits.\n`
							}
						} catch (ex) {
							console.log('[CapitalOne] JSON parse failed.')
							const err = new MessagingResponse()
							err.message('A problem occurred while fetching your deposit information.')
							response.end(err.toString())
							return
						}
						console.log(index + " " + (array.length-1))
						if (index == array.length-1){
							var depositresponse = new MessagingResponse()
							depositresponse.message(msg)
							response.end(depositresponse.toString())
							return
						}
					}).catch(function(error){
						console.log(error)
					})
				})
			})
		}
	},

	meta: {
		aliases: ['capital', 'capitalone', 'capital_one', 'capital-one'],
	}
}

module.exports = methods