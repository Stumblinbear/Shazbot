const path = require('path');

module.exports = {
  init({ assistant, engine }) {
    engine.registerIntent('QuitIntent', (query, action, args) => {
      return new Promise((resolve, reject) => {
        resolve({
          say: 'quit'
        });
      });
    });

    assistant.on('result', ({ trigger, reaction }) => {
      if(reaction) {
        if(reaction.action) {
          if(trigger == 'voice')
            assistant.emit('hotword', { silent: 'start' });
        }
      }
    });

    assistant.on('query', (query) => {
      if(query.action && query.text) {
        if(query.text == 'cancel' || query.text == 'quit'
          || query.text == 'end' || query.text == 'leave'
          || query.text == 'stop') {
          query.action = {
            mod: query.action ? query.action.mod : 'reaction_action',
            intent: 'QuitIntent'
          };
        }else if(query.text == 'terminate')
          query.action = {
            mod: 'reaction_action',
            intent: 'QuitIntent'
          };
      }
    });
  }
}
