const fs = require('fs');


class Lexicon {
  constructor() {
    this.dictionary = {};
  }

  load(file) {
    let lines = fs.readFileSync(file, 'utf-8').split('\n').filter(Boolean);

    for(let line of lines) {
      line = line.replace(/\s\s+/g, ' ');

      let i = line.indexOf(' ');
      let id = line.substring(0, i);
      this.add(id, line.substring(i + 1));
    }
  }

  add(id, text) {
    if(!this.dictionary[id]) this.dictionary[id] = [];
    this.dictionary[id].push(text)
  }

  replace(obj) {
    if(typeof(obj) == 'string') {
      if(!this.dictionary[obj]) return obj;

      let items = this.dictionary[obj];
      return items[Math.floor(Math.random() * items.length)];
    }

    for(let id in obj)
      obj[id] = this.replace(obj[id]);
    return obj;
  }
}

module.exports = Lexicon
