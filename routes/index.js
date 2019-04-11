var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Index' });
});

router.get('/login', function(req, res, next) {
  res.render('login', {title: 'Login'} );
});

router.post('/login', function(req, res, next){

  console.log();
  console.log('From /login');
  console.log(req.body.username);
  console.log(req.body.password);
  console.log();

  // TODO
  // - make select query to check for matching user info

  if (req.body.username != undefined && req.body.password != undefined) {
    res.render('lobby', { title: 'Lobby' });
  }
  else {
    res.render('login', {title: 'Login' });
  }
});

router.get('/register', function(req, res, next) {
  res.render('register', { title: 'Register' });
});

router.post('/register', function(req, res, next) {

  const username = req.body.username;
  const password = req.body.password;

  // check username and password undefined
  if (username == undefined && password == undefined) {
    res.render('register', {title: 'Register'});
  }

  console.log();
  console.log(username);
  console.log(password);
  console.log();

  // TODO
  // - make insert query to create a new user

  // successful => login page
  // error => register page

  res.render('login', {title: 'Login'} );

});

router.get('/lobby', function(req, res, next) {
  res.render('lobby', {title: 'Lobby'});
});

router.get('/mylobbies', function(req, res, next) {
  res.render('lobby', { title: 'Lobby' });
});

router.get('/game', function(req, res, next) {
  res.render('game', { title: 'Game' });
});

module.exports = router;
