const Entity = require('./entity');
const Intent = require('./intent');


class IntentEngine {
  constructor() {
    this.intents = {};
  }

  registerIntent(id, func) {
    let intent = new Intent(id, func);
    this.intents[id] = intent;
    return intent;
  }

  query(query) {
    let top = { confidence: -1, intent: null, args: {} };

    for(let id in this.intents) {
      let action = this.intents[id].test(query.text);
      if(!action) continue;

      if(action.confidence > top.confidence)
        top = action;
    }

    return top;
  }

  resolve(query) {
    if(!this.intents[query.action.intent])
      return new Promise((resolve, reject) => {
        reject({ say: 'intent.invalid' });
      });
    return this.intents[query.action.intent].call(query);
  }
}

module.exports = IntentEngine
