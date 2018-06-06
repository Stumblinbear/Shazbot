const path = require('path');

const parse = require('compromise');
const events = require('events');

const Audio = require('./audio');
const Lexicon = require('./conform/lexicon');
const loadMods = require('./mods');


class Assistant {
  constructor() {
    this.verbose = false;

    this.name = 'Assistant';

    this.audio = new Audio();

    this.mods = {};

    this.lexicon = new Lexicon();
    this.lexicon.load(path.join(__dirname, 'lexicon.txt'));

    this.event = new events.EventEmitter();
    this.on = this.event.on;
    this.emit = this.event.emit;
  }

  loadMods(dir) {
    for(let mod of loadMods(dir)) {
      console.log(mod.name, '(', mod.id, ')', ':', mod.description);

      this.mods[mod.id] = mod;

      mod.init({ assistant: this });
    }

    this.emit('start');
  }

  query(query) {
    this.emit('query', query);

    if(!query.text) return this.throw_error('query.invalid');

    let nlp = parse(query.text);

    query.unclean = query.text;

    query.metadata = {
      places: nlp.places().data(),
      topics: nlp.topics().data(),
      dates: nlp.dates().data(),
      people: nlp.people().data(),
      nouns: nlp.nouns().data()
    };

    nlp.normalize();

    query.text = nlp.out('text');
    query.text = query.text.toLowerCase();
    query.text = query.text.replace(/[.\?!]/g,"");

    if(!query.action) {
      let top = null;
      for(let id in this.mods) {
        if(!this.mods[id].engine) continue;

        let action = Object.assign({mod: id}, this.mods[id].query(query));
        if(!action || action.confidence <= 0.2) continue;

        if(top == null || action.confidence > top.confidence)
          top = action;
      }

      if(top == null) {
        this.emit('action_unknown', query);
        if(!query.action)
          return this.throw_error('action.unknown');
      }else
        query.action = top;
    }

    return new Promise((resolve, reject) => {
      this.resolve(query).then((result) => {
        result.reaction = this.clean_reaction(result.reaction);

        this.emit('result', result);
        resolve(result);
      });
    });
  }

  resolve(query) {
    if(this.mods[query.action.mod]) {
      return new Promise((resolve, reject) => {
        this.mods[query.action.mod].resolve(query).then((reaction) => {
          resolve({
            success: true,
            trigger: query.trigger,
            action: query.action,
            reaction
          });
        }).catch((reaction) => {
          if(typeof reaction == 'string') {
            this.throw_error(reaction).then(obj => { resolve(obj); });
            return;
          }

          reaction = this.clean_reaction(reaction);

          resolve({
            success: false,
            trigger: query.trigger,
            action: query.action,
            reaction
          });
        });
      });
    }

    return this.throw_error('mod.unknown');
  }

  clean_reaction(reaction) {
    if(reaction) {
      reaction = this.lexicon.replace(reaction);

      if(reaction.say) {
        if(typeof reaction.say == 'string')
          reaction.say = [reaction.say];
      }
    }


    this.emit('clean_reaction', reaction);

    return reaction;
  }

  throw_error(text) {
    return new Promise((resolve, reject) => {
      resolve({
        success: false,
        error: text,
        reaction: {
          say: this.lexicon.replace(text)
        }
      });
    });
  }

  listen() {

  }
}

module.exports = Assistant
