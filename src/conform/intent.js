const levenshtein = require('fast-levenshtein');

const Utterances = require('./utterances');
const Lexicon = require('./lexicon');


class Intent {
  constructor(id, func) {
    this.id = id;
    this.func = func;

    this.utterances = new Utterances();
    this.lexicon = new Lexicon();
  }

  test(text) {
    let top = null;
    for(let utterance of this.utterances.all) {
      let match = utterance.exec(text);
      if(!match) continue;

      let args;
      let kwargs;

      let names = utterance.names;
      for(let i in names) {
        if(names[i] === null) {
          if(!args) args = [];
          args.push(match[parseInt(i) + 1]);
        }else{
          if(!kwargs) kwargs = {};
          kwargs[names[i]] = match[parseInt(i) + 1] || null;
        }
      }

      let len = Math.max(match[0].length, text.length);
      let levi = parseFloat(((len - levenshtein.get(match[0], text, { useCollator: true})) / len).toFixed(2));
      if(top === null || levi > top.confidence) {
        top = {
          confidence: levi,
          intent: this.id,
          args: Object.assign(args ? { _: args } : {}, kwargs)
        }
      }
    }

    return top;
  }

  call(query) {
    return new Promise((resolve, reject) => {
      this.func(query, query.action, query.action.args).then((result) => {
        resolve(this.lexicon.replace(result));
      }).catch((result) => {
        reject(this.lexicon.replace(result));
      });
    });
  }
}

module.exports = Intent
