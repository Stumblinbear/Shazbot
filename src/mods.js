const fs = require('fs');
const path = require('path');

const dirs = p => fs.readdirSync(p).filter(f => fs.statSync(path.join(p, f)).isDirectory());
const files = p => fs.readdirSync(p).filter(f => !fs.statSync(path.join(p, f)).isDirectory());

const IntentEngine = require("./conform");
const Lexicon = require('./conform/lexicon');


class Mod {
  constructor(id, dir, module, info) {
    this.id = id;
    this.dir = dir;
    this.module = module;

    this.name = info.name;
    this.description = info.description;
    this.authors = info.authors;
    this.tags = info.tags;
    this.url = info.url;

    this.engine = new IntentEngine();
    this.lexicon = new Lexicon();
  }

  init(args) {
    args['engine'] = this.engine;
    this.module.init(args);

    this.loadUtterances();

    this.loadLexicon();

    this.loadIntents();
  }

  query(query) {
    return this.engine.query(query);
  }

  resolve(query) {
    return new Promise((resolve, reject) => {
      this.engine.resolve(query).then((result) => {
        resolve(this.lexicon.replace(result));
      }).catch((result) => {
        reject(this.lexicon.replace(result));
      });
    });
  }

  loadUtterances() {
    {
      let utter_txt = path.join(this.dir, 'utterances.txt');
      if(fs.existsSync(utter_txt)) {
        let lines = fs.readFileSync(utter_txt, 'utf-8').split('\n').filter(Boolean);
        for(let line of lines) {
          line = line.replace(/\s\s+/g, ' ');

          let i = line.indexOf(' ');
          let intent_id = line.substring(0, i);

          if(!this.engine.intents[intent_id]) continue;

          this.engine.intents[intent_id].utterances.add(line.substring(i + 1));
        }
      }
    }

    {
      let utter_dir = path.join(this.dir, 'utterances');
      if(fs.existsSync(utter_dir)) {
        for(let file_name of files(utter_dir)) {
          let intent_id = file_name.endsWith('.txt') ? file_name.substring(0, file_name.length - 4) : file_name;

          if(!this.engine.intents[intent_id]) continue;

          this.engine.intents[intent_id].utterances.load(path.join(utter_dir, file_name));
        }
      }
    }
  }

  loadLexicon() {
    {
      let lexi_txt = path.join(this.dir, 'lexicon.txt');
      if(fs.existsSync(lexi_txt))
        this.lexicon.load(lexi_txt);
    }

    {
      let lexi_dir = path.join(this.dir, 'lexicon');
      if(fs.existsSync(lexi_dir)) {
        for(let file_name of files(lexi_dir)) {
          let intent_id = file_name.endsWith('.txt') ? file_name.substring(0, file_name.length - 4) : file_name;

          if(!this.engine.intents[intent_id]) continue;

          this.engine.intents[intent_id].lexicon.load(path.join(lexi_dir, file_name));
        }
      }
    }
  }

  loadIntents() {
    {
      let intents_dir = path.join(this.dir, 'intents');
      if(fs.existsSync(intents_dir)) {
        for(let file_name of files(intents_dir)) {
          let intent_id = file_name.endsWith('.json') ? file_name.substring(0, file_name.length - 5) : file_name;

          if(!this.engine.intents[intent_id]) continue;

          let data = JSON.parse(fs.readFileSync(path.join(intents_dir, file_name), 'utf-8'));

          if(data.utterances) {
            for(let utter of data.utterances)
              this.engine.intents[intent_id].utterances.add(utter);
          }

          if(data.lexicon) {
            for(let lexi_id in data.lexicon)
              for(let text of data.lexicon[lexi_id])
                this.engine.intents[intent_id].lexicon.add(lexi_id, text);
          }
        }
      }
    }
  }
}

function* loadMods(dir) {
  for(let plugin_id of dirs(dir)) {
    if(plugin_id[0] == '-') continue;

    let plugin_dir = path.join(dir, plugin_id);
    let module = require(plugin_dir);
    let info = JSON.parse(fs.readFileSync(path.join(plugin_dir, 'mod.json')));

    yield new Mod(plugin_id, plugin_dir, module, info);
  }
}

module.exports = loadMods
