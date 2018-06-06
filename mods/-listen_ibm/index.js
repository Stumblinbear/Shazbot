const path = require('path');
const fs = require('fs');

const record = require('node-record-lpcm16');
const request = require('request');

const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

const speech_to_text = new SpeechToTextV1 ({
  username: '',
  password: ''
});


class IBMListener {
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

      speech_to_text.recognize({
        audio: mic,
        content_type: 'audio/wav'
      }, function(error, data) {
        if (error)
          throw error;

        let result = (data.results.length > 0 ? data.results[0] : undefined);

        let text = undefined;

        if(result && result.alternatives && result.alternatives.length > 0)
          text = result.alternatives[0].transcript;

        if(assistant.verbose)
          console.log(body);
        else
          console.log('You:', text);

        assistant.query({ trigger: 'voice', text }).then((result) => {
          assistant.emit('result', result);
        });
      });

      if(silent !== true && silent != 'start')
        fs.createReadStream(path.join(__dirname, 'resources/ding.wav')).pipe(assistant.audio.wav_stream);
    });
  }
}

module.exports = new IBMListener()
