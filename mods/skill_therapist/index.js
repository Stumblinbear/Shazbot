const ElizaBot = require('./elizabot.js');

const eliza = new ElizaBot

module.exports = {
  init({ assistant, engine }) {
    engine.registerIntent('StartIntent', (query, action, args) => {
      return new Promise((resolve, reject) => {
        resolve({
          action: {
            mod: 'skill_therapist',
            intent: 'Therapy'
          },
          say: 'Hello. I am Eliza. Tell me what\'s on your mind.'
        });
      });
    });

    engine.registerIntent('QuitIntent', (query, action, args) => {
      return new Promise((resolve, reject) => {
        resolve({
          say: 'Okay. If you need anything else, I\'m at your service.'
        });
      });
    });

    engine.registerIntent('Therapy', (query, action, args) => {
      return new Promise((resolve, reject) => {
        if(query.action.args) {
          resolve({
            action: {
              mod: 'skill_therapist',
              intent: 'Therapy'
            },
            say: 'Hello. I am Eliza. Tell me what\'s on your mind.'
          });
        }else{
          resolve({
            action: {
              mod: 'skill_therapist',
              intent: 'Therapy'
            },
            say: eliza.transform(query.text)
          });
        }
      });
    });
  }
}
