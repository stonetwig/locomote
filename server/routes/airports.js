var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.send('All airports');
});

module.exports = router;
