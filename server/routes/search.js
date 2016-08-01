"use strict";
const express = require('express');
const router = express.Router();
const request = require('request');
const moment = require('moment');

router.post('/', function(req, res, next) {
  const destination = req.body.to;
  const origin = req.body.from;
  const date = req.body.date;
  const airport_url = 'http://node.locomote.com/code-task/airports?q=';
  const dateIsTooEarly = moment().isAfter(moment(date, 'YYYY-MM-DD'), 'day') || moment().isSame(moment(date, 'YYYY-MM-DD'), 'day');
  if (!destination || !origin || !date || dateIsTooEarly) {
    res.json({
      error: "Fields are incorrect or date is in the past.",
      date: date,
      destination: destination,
      origin: origin,
      today: moment().format('YYYY-MM-DD'),
      sameDay: moment().isSame(moment(date, 'YYYY-MM-DD'), 'day'),
      before: moment().isAfter(moment(date, 'YYYY-MM-DD'), 'day')
    });
  }

  const airlinesPromise = new Promise(function(resolve, reject) {
    request('http://node.locomote.com/code-task/airlines', (error, response, body) => {
      if (error) {
        reject(error);
      }
      resolve(JSON.parse(body));
    });
  });

  const possibleDestinationsPromise = new Promise(function(resolve, reject) {
    request(airport_url + destination, (error, response, body) => {
      if (error) {
        reject(error);
      }
      resolve(JSON.parse(body));
    });
  });

  const possibleOriginsPromise = new Promise(function(resolve, reject) {
    request(airport_url + origin, (error, response, body) => {
      if (error) {
        reject(error);
      }
      resolve(JSON.parse(body));
    });
  });

  Promise.all([airlinesPromise, possibleDestinationsPromise, possibleOriginsPromise]).then(values => {
    // Using node stable, can't use destructing yet :(
    const airlines = values[0];
    const possibleDestinations = values[1];
    const possibleOrigins = values[2];
    let responseJSON = null;

    const destinationAirportCode = possibleDestinations.length > 0 ? possibleDestinations[0].airportCode : null;
    const originAirportCode = possibleOrigins.length > 0 ? possibleOrigins[0].airportCode : null;
    if (destinationAirportCode === null || originAirportCode === null) {
      res.json({
        error: "There was an error with the destination or origin. Please send a valid city/airport.",
        destinationAirportCode: destinationAirportCode,
        originAirportCode: originAirportCode,
        possibleOrigins: possibleOrigins,
        possibleDestinations: possibleDestinations
      });
    } else {

      const searchPromises = airlines.map(airline => {
        return new Promise(function(resolve, reject) {
          const flight_search_url = 'http://node.locomote.com/code-task/flight_search/' + airline.code + '?date=' + date + '&from=' + originAirportCode + '&to=' + destinationAirportCode;
          request(flight_search_url, function(error, response, body) {
              if (error) {
                reject(error);
              }
              if (res.statusCode !== 200) {
                reject(res.statusCode);
              }
              resolve(JSON.parse(body));
          });
        });
      });

      Promise.all(searchPromises).then(flights => {
        let singleFlightsArray = [];
        flights.forEach(flight_array => {
          flight_array.forEach(flight => {
            singleFlightsArray.push(flight);
          });
        });
        res.json(singleFlightsArray);
      }, reason => {
        res.json({
          error: "There was an error while calculating flights",
          trace: reason,
          destinationAirportCode: destinationAirportCode,
          originAirportCode: originAirportCode,
          possibleOrigins: possibleOrigins,
          possibleDestinations: possibleDestinations,
          flights: flights
        });
      });
    }
  }, reason => {
    res.json({
      error: "There was an error while doing a request",
      trace: reason
    });
  });
});

module.exports = router;
