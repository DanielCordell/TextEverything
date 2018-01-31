const fs = require('fs');
const MessagingResponse = require('twilio').twiml.MessagingResponse;
const config = require('./../config/config.json');

const plugins = {};
const aliases = {};
const normalPath = require('path').join(__dirname);

fs.readdir(normalPath, (err, files) => {
  if (err) {
    throw err;
  }

  files.forEach(element => {
    if (element != 'index.js') {
      const pluginName = element.replace('.js', '');
      plugins[pluginName] = require('./' + element);
      plugins[pluginName].meta.aliases.forEach(alias => {
        aliases[alias] = pluginName;
      });
      console.log(
        `Loaded ${pluginName} plugin with aliases ${plugins[
          pluginName
        ].meta.aliases.join(', ')}`
      );
    }
  });
});

const methods = {
  handle: function(request, response) {
    const command = request.Body.split(' ')[0].toLowerCase();
    if (aliases.hasOwnProperty(command)) {
      plugins[aliases[command]].run(request, response);
      console.log(`Executing ${aliases[command]} for ${request.From}.`);
    } else {
      const twiml = new MessagingResponse();
      console.log(
        `Received invalid command ${request.Body} from ${request.From}.`
      );
      twiml.message(
        `Sorry, that's an invalid command.\nCheck your plugins folder for a list of valid commands.`
      );
      response.send(twiml.toString());
    }
  }
};

module.exports = methods;
