const request = require('request');

module.exports = {
  init({ assistant, engine }) {
    assistant.on('action_unknown', query => {
      if(!query.redirected) {
        query.action = {
          mod: 'query_secretweb',
          intent: 'RequestIntent'
        }
      }
    });

    engine.registerIntent('RequestIntent', (query, action, args) => {
      return new Promise((resolve, reject) => {
        request.post({
          url: 'http://localhost:8080',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            redirected: true,
            trigger: 'text',
            text: query.text,
            action: {
              mod: 'query_secretweb',
              intent: 'QueryIntent'
            }
          })
        }, function(error, response, body) {
          try {
            resolve(JSON.parse(body).reaction);
          } catch(e) {
            delete query.action;

            reject('action.unknown');
          }
        });
      });
    });

    engine.registerIntent('QueryIntent', (query, action, args) => {
      return new Promise((resolve, reject) => {
        resolve({
          say: 'Queried SW'
        });
      });
    });
  }
}
