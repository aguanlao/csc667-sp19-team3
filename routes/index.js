var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Index' });
});

router.get('/login', function(req, res, next) {
  res.render('login', { title: 'Login' });
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.get('/lobby', function(req, res, next) {
  res.render('lobby', { title: 'Lobby' });
});

router.get('/mylobbies', function(req, res, next) {
  res.render('lobby', { title: 'Lobby' });
});

router.get('/game', function(req, res, next) {
  res.render('game', { title: 'Game' });
});

module.exports = router;
