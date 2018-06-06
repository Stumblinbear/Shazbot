const path = require('path');
const fs = require('fs');

const record = require('node-record-lpcm16');
const request = require('request');

const flac = require('node-flac');
const wav = require('wav');

const KEY = '';


class GoogleListener {
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

      let reader = new wav.Reader();

      reader.on('format', function (format) {
        const flacEncoder = new flac.FlacEncoder(format);
        reader.pipe(flacEncoder).pipe(request.post({
            'url': 'http://www.google.com/speech-api/v2/recognize?client=chromium&lang=en-US&key=' + KEY,
            'headers': {
              'Content-Type': 'audio/x-flac; rate=' + format.sampleRate
            }
          }, (err, resp, body) => {
            if(err)
              throw err;

            let result = undefined;

            for(let line of body.split("\n")) {
              if(!line) continue;
              result = JSON.parse(line).result;
              if(result.length != 0) {
                result = result[0];
                break;
              }
            }

            let text = undefined;

            if(result.alternative)
              text = result.alternative[0].transcript;

            if(assistant.verbose)
              console.log(result);
            else
              console.log('You:', text);

            assistant.query({ trigger: 'voice', text }).then((result) => {
              assistant.emit('result', result);
            });
          }))
      });

      mic.pipe(reader);

      if(silent !== true && silent != 'start')
        fs.createReadStream(path.join(__dirname, 'resources/ding.wav')).pipe(assistant.audio.wav_stream);
    });
  }
}

module.exports = new GoogleListener()
