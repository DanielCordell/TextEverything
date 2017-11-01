
var methods = {
	run: function(request, response) {
		console.log('Got message! ' + request.Body)
	},

	meta: {
		aliases: ['test']
	}
}

module.exports = methods