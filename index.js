const path = require('path');
const Assistant = require('./src');

let assistant = new Assistant(require('./config.json'));

assistant.loadMods(path.join(__dirname, 'mods'));


// HTTP Server
const express = require('express');

const http = express();

const bodyParser = require('body-parser')
http.use(bodyParser.json());
http.use(bodyParser.urlencoded({
  extended: true
}));

http.get('/', function(req, res) {
  assistant.query(req.query).then((result) => {
    console.log('HTTP:', result);

    res.json(result);
  });
});

http.listen(8080);


// Telegram

if(assistant.config.telegram) {
  const TelegramBot = require('node-telegram-bot-api');

  const bot = new TelegramBot(assistant.config.telegram.botKey, {polling: true});

  let callbacks = {};

  let teleAction = undefined;

  async function handleMessage(msg, result) {
    if(result.reaction.action) teleAction = result.reaction.action;

    console.log('Telegram:', result);

    if(result.reaction.display) {
      if(result.reaction.display.images) {
        await bot.sendChatAction(msg.chat.id, 'upload_photo');

        let images = [];
        for(let image of result.reaction.display.images)
          images.push({ type: 'photo', media: image })

        await bot.sendMediaGroup(msg.chat.id, images);
      }
    }

    let lastMsg = undefined;

    for(let text of result.reaction.say)
      lastMsg = await bot.sendMessage(msg.chat.id, text);

    if(lastMsg) {
      if(result.reaction.prompt && result.reaction.prompt.replies) {
        buttons = []
        for(let reply of result.reaction.prompt.replies) {
          let callback_id = Math.random().toString(26).substring(2);
          callbacks[callback_id] = reply.query;
          buttons.push({text: reply.text, callback_data: 'query:' + callback_id})
        }

        bot.editMessageReplyMarkup({inline_keyboard: [buttons]}, {chat_id: lastMsg.chat.id, message_id: lastMsg.message_id})
      }
    }
  }

  bot.on('message', (msg) => {
    bot.sendChatAction(msg.chat.id, 'typing').then(() => {
      assistant.query({ trigger: 'text', text: msg.text, action: teleAction }).then((result) => { handleMessage(msg, result); });

      teleAction = undefined;
    });
  });

  bot.on('callback_query', (callbackQuery) => {
    bot.editMessageReplyMarkup({inline_keyboard: []}, {chat_id: callbackQuery.message.chat.id, message_id: callbackQuery.message.message_id})

    bot.sendChatAction(callbackQuery.message.chat.id, 'typing').then(() => {
      let data = callbackQuery.data.split(':', 2);

      if(data[0] == 'query') {
        data = callbacks[data[1]];

        if(typeof data == 'string')
          data = {text: data}
        else
          data = {action: data}

        if(data) {
          assistant.query({ trigger: 'text', text: data.text, action: data.action }).then((result) => { handleMessage(callbackQuery.message, result); });
        }
      }
    });
  });
}

// Terminal
let action = undefined;

const readline = require('readline');
const rl = readline.createInterface(process.stdin, process.stdout);

rl.setPrompt('');
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

        console.log('Console:', result);

        assistant.emit('result', result);

        rl.prompt();
      });

      action = undefined;
    }
}).on('close',function(){
    process.exit(0);
});
