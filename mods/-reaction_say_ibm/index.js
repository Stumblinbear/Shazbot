const fs = require('fs');
const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

const text_to_speech = new TextToSpeechV1 ({
  username: "",
  password: ""
});

module.exports = {
  init({ assistant }) {
    assistant.on('clean_reaction', (reaction) => {
      if(reaction) {
        if(typeof(reaction.say) == 'string') {
          reaction.say = [ reaction.say ];
        }
      }
    });

    assistant.on('result', ({ reaction }) => {
      if(reaction) {
        if(reaction.say) {
          for(let line of reaction.say)
            console.log(assistant.name, 'said "', line, '"');

          text_to_speech.synthesize({
            text: reaction.say.join('\n'),
            voice: 'en-US_LisaVoice',
            accept: 'audio/wav'
          }).on('error', function(error) {
            throw error;
          }).on('end', () => {
            let temp_stream = fs.createReadStream('temp.wav');

            temp_stream.pipe(assistant.audio.wav_stream);

            temp_stream.on('end', function() {
              fs.unlink('temp.wav');
            });
          }).pipe(fs.createWriteStream('temp.wav'));
        }
      }
    });
  }
}
