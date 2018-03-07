const methods = {
  run: function(request, response) {
    console.log('Got message! ' + request.Body);
    response.send('<Response />');
  },

  meta: {
    aliases: ['test']
  }
};

module.exports = methods;
