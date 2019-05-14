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
// - change renders to redirects where applicable when sessions are added

/* GET home page. */
router.get('/', function(req, res, next) {
  if(req.isAuthenticated()) {
    res.redirect('/lobby');
  } else {
    res.render('index', { title: 'Index'});
  }
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

  var queryString = 'SELECT `uid`, `username` FROM user WHERE username LIKE \'';
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

    // USAGE FOR USER INFO:
    // user_info = {"uid":1, "username":"bob123"}
    // access uid like this: user_info.uid
    // access username like this: user_info.username
    const user_info = rows[0];
    console.log('\nLogin query result: ' + JSON.stringify(user_info) + '\n'); // test print

    // pass user_info as object req.user
    req.login(user_info, function(err){
      res.redirect('/lobby');
    });
  });
  connection.end();

});

passport.serializeUser(function(user_info, done) {
  done(null, user_info);
});
passport.deserializeUser(function(user_info, done) {
  //User.findById(id, function(err, user) {
    done(null, user_info);
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
  if (req.isAuthenticated()) {
    // TODO: Remove debug statements
    console.log('\nUser: ' + req.user.username); // test print
    console.log('Authenicated: ' + req.isAuthenticated() + '\n'); // test print
    const username = req.user.username;

    // Get all games needing a player or in progress
    const queryString = "SELECT * FROM game WHERE is_active=0 OR is_active=1;";
    
    var connection = getConnection();
    connection.query(queryString, (err, rows, fields) => {
      if (err) {
        console.log("Failed to get lobbies: " + err + "\n");
        // TODO: Send proper HTTP response code
        return;
      }

      console.log("Lobbies count: " + rows.length + "\n");
  
      res.render('lobby', {title: 'Lobby', user: username, lobbies: rows});
    });
    connection.end();
  } else {
    res.redirect('/login');
  }
});

router.get('/mylobbies', function(req, res, next) {
  if (req.isAuthenticated()) {
    const username = req.user.username;
    res.render('lobby', { title: 'Lobby' , user: username});
  } else {
    res.redirect('/login');
  }
});

router.get('/create_lobby', function(req, res, next) {
  if (req.isAuthenticated()) {
    res.render('create_lobby', { title: 'Create Lobby', user: req.user.username });
  } else {
    res.redirect('/login');
  }
});


router.get('/about', function(req, res, next) {
  res.render('about', { title: 'About' });
});

module.exports = router;