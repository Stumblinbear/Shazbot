const path = require('path');
const fs = require('fs');

const record = require('node-record-lpcm16');
const request = require('request');

const TOKEN = '';


class WitListener {
  constructor() {

  }

  init({ assistant }) {
    assistant.on('hotword', ({ silent }) => {
      let mic = record.start({
        threshold: 5,
        silence: '2.0',
        verbose: assistant.verbose
      });

      mic.on('end', () => {
        if(silent !== true && silent != 'end')
          fs.createReadStream(path.join(__dirname, 'resources/dong.wav')).pipe(assistant.audio.wav_stream);
      });

      mic.pipe(request.post({
          'url': 'https://api.wit.ai/speech?client=chromium&lang=en-us&output=json',
          'headers': {
            'Authorization': 'Bearer ' + TOKEN,
            'Content-Type': 'audio/wav'
          }
        }, (err, resp, body) => {
          if(err)
            throw err;

          let text = JSON.parse(body)._text;

          if(assistant.verbose)
            console.log(body);
          else
            console.log('You:', text);

          assistant.query({ trigger: 'voice', text }).then((result) => {
            assistant.emit('result', result);
          });
        }));

      if(silent !== true && silent != 'start')
        fs.createReadStream(path.join(__dirname, 'resources/ding.wav')).pipe(assistant.audio.wav_stream);
    });
  }
}

module.exports = new WitListener()
