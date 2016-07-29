var express = require('express');
var router = express.Router();
var request = require('request');

router.post('/', function(req, res, next) {
  var url = 'http://node.locomote.com/code-task/airports?q=' + req.body.q;
  request(url, function (error, response, body) {
    if (!error && response.statusCode === 200) {
      res.json(JSON.parse(body));
    } else {
      res.json(error);
    }
  });
});

module.exports = router;
