"use strict";
var express = require('express');
var router = express.Router();
var request = require('request');
var waterfall = require('async-waterfall');
var async = require("async");

router.post('/', function(req, res, next) {
  const destination = req.body.to;
  const origin = req.body.from;
  const date = req.body.date;
  const airport_url = 'http://node.locomote.com/code-task/airports?q=';

  waterfall([
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
      let flights = [];
      let q = async.queue(function (airline, callback) {
        const flight_search_url = 'http://node.locomote.com/code-task/flight_search/' + airline.code + '?date=' + date + '&from=' + originAirportCode + '&to=' + destinationAirportCode;
        request(flight_search_url, function(error, response, body) {
            if (error) {
              return callback(error);
            }
            if (res.statusCode !== 200) {
              return callback(res.statusCode);
            }
            flights.push(JSON.parse(body));
            callback();
        });
      }, 1);

      q.push(airlines, function(error) {
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
            res.json(flights);
          }
      });
    }
  });
});

module.exports = router;
