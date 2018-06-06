const path = require('path');
const { exec } = require('child_process');


module.exports = {
  init({ assistant }) {
    assistant.on('clean_reaction', (reaction) => {
      if(reaction) {
        if(typeof(reaction.say) == 'string') {
          reaction.say = [ reaction.say ];
        }
      }
    });

    assistant.on('result', ({ reaction }) => {
      if(reaction) {
        if(reaction.say) {
          for(let line of reaction.say) {
            console.log(assistant.name, 'said "', line, '"');

            exec('python3 ' + path.join(__dirname, 'acapellabox.py') + ' thug ' + line.replace('\'', ''));
          }
        }
      }
    });
  }
}
