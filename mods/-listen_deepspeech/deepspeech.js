#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const MemoryStream = require('memory-stream');

const Ds = require('deepspeech');

// These constants control the beam search decoder

// Beam width used in the CTC decoder when building candidate transcriptions
const BEAM_WIDTH = 500;

// The alpha hyperparameter of the CTC decoder. Language Model weight
const LM_WEIGHT = 1.75;

// The beta hyperparameter of the CTC decoder. Word insertion weight (penalty)
const WORD_COUNT_WEIGHT = 1.00;

// Valid word insertion weight. This is used to lessen the word insertion penalty
// when the inserted word is part of the vocabulary
const VALID_WORD_COUNT_WEIGHT = 1.00;


// These constants are tied to the shape of the graph used (changing them changes
// the geometry of the first layer), so make sure you use the same constants that
// were used during training

// Number of MFCC features to use
const N_FEATURES = 26;

// Size of the context window used for producing timesteps in the input vector
const N_CONTEXT = 9;

function totalTime(hrtimeValue) {
  return (hrtimeValue[0] + hrtimeValue[1] / 1000000000).toPrecision(4);
}

class DeepSpeech {
  constructor({ model, alphabet, lm, trie }) {
    this.model = model;
    this.alphabet = alphabet;
    this.lm = lm;
    this.trie = trie;

    console.error('Loading model from file %s', this.model);
    const model_load_start = process.hrtime();
    this.ds_model = new Ds.Model(this.model, N_FEATURES, N_CONTEXT, this.alphabet, BEAM_WIDTH);
    const model_load_end = process.hrtime(model_load_start);
    console.error('Loaded model in %ds.', totalTime(model_load_end));

    if(this.lm && this.trie) {
      console.error('Loading language model from files %s %s', this.lm, this.trie);
      const lm_load_start = process.hrtime();
      this.ds_model.enableDecoderWithLM(this.alphabet, this.lm, this.trie,
                                LM_WEIGHT, WORD_COUNT_WEIGHT, VALID_WORD_COUNT_WEIGHT);
      const lm_load_end = process.hrtime(lm_load_start);
      console.error('Loaded language model in %ds.', totalTime(lm_load_end));
    }
  }

  stream() {
    let audioStream = new MemoryStream();

    let promise = new Promise((resolve, reject) => {
      audioStream.on('finish', () => {
        console.log('Converting speech to text...');

        let audioBuffer = audioStream.toBuffer();
        let text = this.ds_model.stt(audioBuffer.slice(0, audioBuffer.length / 2), 16000);

        console.log('Done.');

        resolve(text);
      });
    });

    return {
      stream: audioStream,
      promise
    };
  }
}

/*var audioStream = new MemoryStream();
bufferToStream(buffer).
  pipe(Sox({ output: { bits: 16, rate: 16000, channels: 1, type: 'raw' } })).
  pipe(audioStream);
*/

module.exports = DeepSpeech
