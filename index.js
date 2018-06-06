const path = require('path');
const Assistant = require('./src');

let assistant = new Assistant();

assistant.loadMods(path.join(__dirname, 'mods'));


const express = require('express');

const http = express();

const bodyParser = require('body-parser')
http.use(bodyParser.json());
http.use(bodyParser.urlencoded({
  extended: true
}));

http.get('/', function(req, res) {
  assistant.query(req.query).then((result) => {
    res.json(result);
  });
});

http.listen(8080);


let action = undefined;

const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt('You: ');
rl.prompt();

assistant.on('hotword', () => {
  console.log(assistant.name, ':', 'Listening...');
});

rl.on('line', function(line) {
    if(line === "exit") {
      rl.close();
    }else{
      assistant.query({ trigger: 'text', text: line, action }).then((result) => {
        if(result.reaction.action) action = result.reaction.action;

        console.log(result);

        assistant.emit('result', result);

        rl.prompt();
      });

      action = undefined;
    }
}).on('close',function(){
    process.exit(0);
});
