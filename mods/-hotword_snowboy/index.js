const path = require('path');

const record = require('node-record-lpcm16');
const Detector = require('snowboy').Detector;
const Models = require('snowboy').Models;

const models = new Models();

models.add({
  file: path.join(__dirname, 'resources/shazbot.pmdl'),
  sensitivity: '0.5',
  hotwords : 'shazbot'
});

let allow_trigger = true;

class HotwordListener {
  constructor() {
    this.detector = new Detector({
      resource: path.join(__dirname, 'resources/common.res'),
      models: models,
      audioGain: 2.0
    });
  }

  init({ assistant }) {
    this.detector.on('hotword', function(index, hotword, buffer) {
      if(allow_trigger)
        assistant.emit('hotword', hotword);
    });

    assistant.on('start', () => {
      this.mic = record.start({
        threshold: 0,
        verbose: assistant.verbose
      });

      this.mic.pipe(this.detector);
    })

    assistant.on('hotword', ({ trigger, reaction }) => {
      allow_trigger = false;
    });

    assistant.on('result', ({ trigger, reaction }) => {
      allow_trigger = true;
    });
  }
}

const listener = new HotwordListener();

module.exports = listener
