var express = require('express');
var router = express.Router();
var request = require('request');

router.get('/', function(req, res, next) {
  request('http://node.locomote.com/code-task/airlines', function (error, response, body) {
    if (!error && response.statusCode === 200) {
      res.json(JSON.parse(body));
    } else {
      res.json(error);
    }
  });
});

module.exports = router;
