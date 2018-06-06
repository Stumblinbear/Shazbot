const fs = require('fs');

const XRegExp = require('xregexp');


class Utterances {
  constructor() {
    this.utterances = [];
  }

  get all() {
    return this.utterances;
  }

  load(file) {
    let lines = fs.readFileSync(file, 'utf-8').split('\n').filter(Boolean);
    for(let line of lines) this.add(line);
  }

  add(text) {
    this.utterances.push(new Utterance(text));
  }
}

class Utterance {
  constructor(text) {
    this.regex = new XRegExp(text.replace(/\s\s+/g, ' '), 'i');
  }

  exec(text) {
    return XRegExp.exec(text, this.regex);
  }

  get names() {
    return this.regex.xregexp.captureNames;
  }
}

module.exports = Utterances
