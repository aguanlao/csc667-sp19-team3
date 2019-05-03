var express = require('express');
var router = express.Router();
var passport = require('passport');

// TEMPORARY: probably not the best practice to place this directly in routes?
var mysql = require('mysql');
function getConnection() {
    return mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME
    });
}

// TODO
// - add sessions for login
// - change renders to redirects where applicable when sessions are added

/* GET home page. */
router.get('/', function(req, res, next) {
  const user = req.user;
  res.render('index', { title: 'Index', user: user});
});

router.get('/login', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('login', {title: 'Login'} );
  } else {
    res.redirect('/'); // TODO: possibly change route
  }
});

router.post('/login', function(req, res, next){

  const username = req.body.username;
  const password = req.body.password;

  console.log();
  console.log('From /login');
  console.log(username);
  console.log(password);
  console.log();

  var queryString = 'SELECT * FROM user WHERE username LIKE \'';
  queryString = queryString + username + "' AND password LIKE '";
  queryString = queryString + password + "';";

  var connection = getConnection();
  connection.query(queryString, (err, rows, fields) => {
    if (err || !rows.length) {
      console.log("Failed to match user info: " + err + "\n");
      res.redirect('/login');
      return;
    }

    console.log("User info found! Login successful!\n");
    //res.render('lobby', {title: 'Lobby'});
    const user_id = rows[0].uid;
    console.log('\nLogin query result: ' + user_id + '\n');
    req.login(user_id, function(err){
      res.redirect('/lobby');
    });
  });
  connection.end();

});

passport.serializeUser(function(user_id, done) {
  done(null, user_id);
});
passport.deserializeUser(function(user_id, done) {
  //User.findById(id, function(err, user) {
    done(null, user_id);
  //});
});

router.get('/logout', function(req, res, next) {
  req.logout();
  res.redirect('/');  
});

router.get('/register', function(req, res, next) {
  if (!req.isAuthenticated()) {
    res.render('register', { title: 'Register' });
  } else {
    res.redirect('/'); // TODO: possibly change route
  }
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

  var queryString = 'INSERT INTO user (`username`, `password`) VALUES (?, ?);';

  var connection = getConnection();
  connection.query(queryString, [username, password], (err, rows, fields) => {
    if (err) {
      console.log("Failed to insert user into database: " + err + "\n");
      res.render('register', {title: 'Register'} );
      return;
    }
    //TODO: Handle if the registered user already exists

    console.log("New user created! Registration successful!\n");
    res.redirect('/login');
  });
  connection.end();
});

router.get('/lobby', function(req, res, next) {
  console.log('\nUser: ' + req.user);
  console.log('Authenicated: ' + req.isAuthenticated() + '\n');

  if (req.isAuthenticated()) {
    const user = req.user;
    res.render('lobby', {title: 'Lobby', user: user});
  } else {
    res.redirect('/login');
  }
});

router.get('/mylobbies', function(req, res, next) {
  if (req.isAuthenticated()) {
    const user = req.user;
    res.render('lobby', { title: 'Lobby' , user: user});
  } else {
    res.redirect('/login');
  }
});

router.get('/create_lobby', function(req, res, next) {
  res.render('create_lobby', { title: 'Lobby' });
});


router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About' });
});

module.exports = router;
