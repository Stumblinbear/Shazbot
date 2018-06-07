module.exports = {
  init({ assistant, engine }) {
    engine.registerIntent('SpecificWeather', (query, action, args) => {
      return new Promise((resolve, reject) => {
        if(!args.location) {
          if(query.metadata.places.length != 0)
            args.location = query.metadata.places[0].normal;
          else{
            for(let noun of query.metadata.nouns) {
              if(noun.normal == 'weather') continue;
              let text = noun.text.trim();
              if(args.location == undefined || text[0] == text[0].toUpperCase())
                args.location = noun.normal;
            }
          }
        }

        if(!args.location) {
          reject({ say: 'location.invalid' });
        }

        resolve({
          say: 'The weather in ' + args.location + ' is a cool 17 degrees.',
          display: {
            image: 'https://www.wikihow.com/images/6/64/Stop-a-Dog-from-Jumping-Step-6-Version-2.jpg'
          },
          prompt: {
            replies: [{text: 'Tomorrow', query: {mod: 'skill_weather', intent: 'SpecificWeather', args}}, {text: 'Next Week', query: 'weather in ' + args.location + ' next week?'}]
          }
        });
      });
    });
  }
}
