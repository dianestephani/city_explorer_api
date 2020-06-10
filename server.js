'use strict';

// express library sets up our server
const express = require('express');
// initalizes our express library into our variable called app
const app = express();

// dotenv lets us get our secrets from our .env file
require('dotenv').config();

// bodyguard of our server - tells who is ok to send data to
const cors = require('cors');
app.use(cors());

const superagent = require('superagent');


// bring in the PORT by using process.env.variable name
const PORT = process.env.PORT || 3001;

// app.get('/', (request, response) => {
//   console.log('hello out there');
//   response.status(200).send('I like pizza');
// });

// app.get('/bananas', (request, response) => {
//   console.log('it is Monday');
//   response.status(200).send('tell me about it');
// });

// app.get('/pizza', (request, response) => {
//   response.status(200).send('I am on the pizza route');
// });

// Diane's code (not working with nodemon)
app.get('/location', (request, response) => {
  try {
    // query: { city: 'seattle' },
    let city = request.query.city;
    let url = `https://us1.locationiq.com/v1/search.php?key=${process.env.GEO_DATA_API_KEY}&q=${city}&format=json`;

    superagent.get(url)
      .then(resultsFromSuperAgent => {
        let finalObj = new Location(city, resultsFromSuperAgent.body[0]);
        response.status(200).send(finalObj);
        console.log(Location);
      })
  }

  catch (err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }
});

// // let search_query = request.query.city;
// // let geoData = require('./data/location.json');
// // let finalObj = new Location(search_query, geoData[0]);

function Location(searchQuery, obj) {
  this.search_query = searchQuery;
  this.formatted_query = obj.display_name;
  this.latitude = obj.lat;
  this.longitude = obj.lon;
}




// turn on the lights - move into the house - start the server

app.get('/weather', (request, response) => {
  try {
    // let geoData = require('./data/weather.json')
    // let weatherArray = geoData.data.map(element => {
    //   return new Weather(element);
    let city = request.query.search_query;
    // let weatherUrl = `https://api.weatherbit.io/v2.0/current?city=${city}=${process.env.WEATHER_API_KEY}`;
    let weatherUrl = `https://api.weatherbit.io/v2.0/forecast/daily?city=${city}&key=${process.env.WEATHER_API_KEY}`;

    superagent.get(weatherUrl)
      .then(resultsFromSuperAgent => {
        let weatherArr = resultsFromSuperAgent.body.data.map(element => new Weather (element));
        response.status(200).send(weatherArr);
        console.log(weatherArr)
      }
      )
  }

  catch (err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }
});


function Weather(obj) {
  this.forecast = obj.weather.description;
  this.time = obj.valid_date;
  // array.push(this)
}

app.get('/trails', (request, response) => {
  try {
    let location = [request.query.latitude, request.query.longitude];
    let trailsUrl = `https://www.hikingproject.com/data/get-trails?lat=${location[0]}&lon=${location[1]}&maxDistance=10&key=${process.env.TRAIL_API_KEY}`;

    superagent.get(trailsUrl)
      .then(resultsFromSuperAgent => {
        let trailsArr = resultsFromSuperAgent.body.trails.map(element => new Trails (element));
        response.status(200).send(trailsArr);
        console.log(trailsArr)
      }
      )
  }

  catch (err) {
    console.log('ERROR', err);
    response.status(500).send('sorry, we messed up');
  }
});

function Trails (obj) {
  this.name = obj.name;
  this.location = obj.location;
  this.length = obj.length;
  this.starts = obj.starts;
  this.star_votes = obj.starVotes;
  this.summary = obj.summary;
  this.trail_url = obj.url;
  this.conditions = `${obj.conditionDetails || ''} ${obj.conditionStatus}`;
  this.condition_date = obj.conditionDate.slice(0, 10);
  this.condition_time = obj.conditionDate.slice(11, 18);
}


app.get('*', (request, response) => {
  response.status(404).send('sorry, this route does not exist');
})

app.listen(PORT, () => {
  console.log(`listening on ${PORT}`);
});

