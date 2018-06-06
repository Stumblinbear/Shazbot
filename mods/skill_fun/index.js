const fs = require('fs');
const path = require('path');

const request = require('request');
const ddg = require('ddg');


module.exports = {
  init({ assistant, engine }) {
    engine.registerIntent('GreetingIntent', (query, action, args) => {
      return new Promise(function(resolve, reject) {
        resolve({
          say: 'greetings'
        });
      });
    });

    engine.registerIntent('HowAreYouIntent', (query, action, args) => {
      return new Promise(function(resolve, reject) {
        resolve({
          say: 'howami'
        });
      });
    });

    engine.registerIntent('TellJoke', (query, action, args) => {
      return new Promise(function(resolve, reject) {
        request('https://api.chucknorris.io/jokes/random', function(err, res, body) {
          let data = JSON.parse(body);
          resolve({
            say: data.value
          });
        });
      });
    });

    engine.registerIntent('CatFact', (query, action, args) => {
      return new Promise(function(resolve, reject) {
        fs.readFile(path.join(__dirname, 'resources/catfact.txt'), function(err, data) {
          if(err) throw err;

          data += '';

          let lines = data.split('\n');
          resolve({
            say: lines[Math.floor(Math.random() * lines.length)]
          });
        });
      });
    });

    engine.registerIntent('AdviceIntent', (query, action, args) => {
      return new Promise(function(resolve, reject) {
        request('http://api.adviceslip.com/advice', function(err, res, body) {
          let data = JSON.parse(body);
          resolve({
            say: data.slip.advice
          });
        });
      });
    });

    engine.registerIntent('FortuneIntent', (query, action, args) => {
      return new Promise(function(resolve, reject) {
        ddg.query('fortune cookie', function(err, data) {
          resolve({
            say: data.Answer
          });
        });
      });
    });

    engine.registerIntent('RhymeIntent', (query, action, args) => {
      return new Promise(function(resolve, reject) {
        ddg.query('what rhymes with ' + args.word, function(err, data) {
          console.log(data);
          resolve({
            say: data.Answer
          });
        });
      });
    });

    engine.registerIntent('SayIntent', (query, action, args) => {
      return new Promise(function(resolve, reject) {
        resolve({
          say: args.text
        });
      });
    });
  }
}
