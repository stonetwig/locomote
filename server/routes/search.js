"use strict";
var express = require('express');
var router = express.Router();
var request = require('request');
var async = require("async");

router.post('/', function(req, res, next) {
  const destination = req.body.to;
  const origin = req.body.from;
  const date = req.body.date;
  const airport_url = 'http://node.locomote.com/code-task/airports?q=';

  async.waterfall([
    function(callback) {
      request('http://node.locomote.com/code-task/airlines', (error, response, body) => {
        callback(error, JSON.parse(body));
      });
    },
    function(airlines, callback) {
      request(airport_url + destination, (error, response, body) => {
        callback(error, airlines, JSON.parse(body));
      });
    },
    function(airlines, possibleDestinations, callback) {
      request(airport_url + origin, (error, response, body) => {
        callback(error, airlines, possibleDestinations, JSON.parse(body));
      });
    },
    function(airlines, possibleDestinations, possibleOrigins, callback) {
      // Get first airport or origin and destination
      // TODO: Let the user choose if there is several options
      const destinationAirportCode = possibleDestinations.length > 0 ? possibleDestinations[0].airportCode : null;
      const originAirportCode = possibleOrigins.length > 0 ? possibleOrigins[0].airportCode : null;
      callback(null, airlines, destinationAirportCode, originAirportCode);
    }
  ], function (err, airlines, destinationAirportCode, originAirportCode) {
    console.log(err, airlines, destinationAirportCode, originAirportCode, date);
    if (destinationAirportCode === null || originAirportCode === null) {
      res.json({
        error: "There was an error with the destination or origin. Please send a valid city/airport.",
        destinationAirportCode: destinationAirportCode,
        originAirportCode: originAirportCode,
        possibleOrigins: possibleOrigins,
        possibleDestinations: possibleDestinations
      });
    } else {
      async.times(airlines.length, function(n, callback) {
        const flight_search_url = 'http://node.locomote.com/code-task/flight_search/' + airlines[n].code + '?date=' + date + '&from=' + originAirportCode + '&to=' + destinationAirportCode;
        request(flight_search_url, function(error, response, body) {
            if (error) {
              callback(error);
            }
            if (res.statusCode !== 200) {
              callback(res.statusCode);
            }
            console.log(airlines[n].code);
            callback(error, JSON.parse(body));
        });

      }, function(error, flights) {
        if (error) {
          res.json({
            error: "There was an error while calculating flights",
            destinationAirportCode: destinationAirportCode,
            originAirportCode: originAirportCode,
            possibleOrigins: possibleOrigins,
            possibleDestinations: possibleDestinations,
            flights: flights
          });
        } else {
          let singleFlightsArray = [];
          flights.forEach(flight_array => {
            flight_array.forEach(flight => {
              singleFlightsArray.push(flight);
            });
          });
          res.json(singleFlightsArray);
        }
      });
    }
  });
});

module.exports = router;
