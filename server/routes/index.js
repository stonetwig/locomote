var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.send("Hello and welcome to this api! There are 3 endpoints /airlines, /airports and /search");
});

module.exports = router;
