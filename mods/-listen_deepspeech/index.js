const path = require('path');

const record = require('node-record-lpcm16');
const Sox = require('sox-stream');

const DeepSpeech = require('./deepspeech');


class DeepSpeechListener {
  constructor() {
    this.deepspeech = new DeepSpeech({
      model: path.join(__dirname, 'resources/models/output_graph.pb'),
      alphabet: path.join(__dirname, 'resources/models/alphabet.txt'),
      lm: path.join(__dirname, 'resources/models/lm.binary'),
      trie: path.join(__dirname, 'resources/models/trie'),
    });
  }

  init({ assistant }) {
    assistant.on('hotword', ({ silent }) => {
      let { stream, promise } = this.deepspeech.stream();

      let mic = record.start({
        threshold: 5,
        silence: '2.0',
        verbose: assistant.verbose
      });

      mic.on('end', () => {
        if(silent !== true && silent != 'end')
          fs.createReadStream(path.join(__dirname, 'resources/dong.wav')).pipe(assistant.audio.wav_stream);
      });

      mic.pipe(stream);

      promise.then((text) => {
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

module.exports = new DeepSpeechListener()
