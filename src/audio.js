const Speaker = require('speaker');

const wav = require('wav');


class Audio {
  constructor() {

  }

  get wav_stream() {
    let reader = new wav.Reader();

    reader.on('format', function(format) {
      reader.pipe(new Speaker(format));
    });

    return reader;
  }
}

module.exports = Audio
