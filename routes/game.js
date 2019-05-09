var express = require('express');
var app = express();
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
};

app.use('/game', router);

router.get('/', function (req, res, next) {
  if (req.isAuthenticated()) {
    const username = req.user.username;
    res.render('game', { title: 'Game', user: username });
  } else {
    res.redirect('/login');
  }
});

function getGameData(data, callback) {
  var game_id = 10001;

  var is_active, uid_1, uid_2;

  var queryString = 'SELECT * FROM game WHERE gid LIKE \'';
  queryString = queryString + game_id + "';";

  var connection = getConnection();
  connection.query(queryString, function(err, result) {
    if (err) {
      console.log("Failed to find game: " + err + "\n");
      res.redirect('/lobby');
      return;
    }

    // No game found
    if (!result.length) {
      console.log("Failed to find game: " + err + "\n");
      res.redirect('/lobby');
      return;
    }


    is_active = rows[0].is_active;
    uid_1 = rows[0].uid_1;
    uid_2 = rows[0].uid_2;
  });
};

// TODO
// - add game routes

router.get('/connect', function(req, res, next) {
  if (req.isAuthenticated()) {
    // TODO: Get game_id when connecting
    // var game_id = req.body.gid;
    var game_id = 10001;

    var is_active, uid_1, uid_2;

    var queryString = 'SELECT * FROM game WHERE gid LIKE \'';
    queryString = queryString + game_id + "';";

    var connection = getConnection();
    connection.query(queryString, function(err, result) {
      if (err) {
        console.log("Failed to connect to game: " + err + "\n");
        res.redirect('/lobby');
        return;
      }

      // No game found
      if (!result.length) {
        console.log("Failed to connect to game: " + err + "\n");
        res.redirect('/lobby');
        return;
      }

      console.log("Game found! Connecting...\n");
      // console.log("Game: " + rows[0].gid + " P1_id: " + rows[0].uid_1 + " P2_id: " + rows[0].uid_2);

      is_active = rows[0].is_active;
      uid_1 = rows[0].uid_1;
      uid_2 = rows[0].uid_2;
    });
    console.log("Game: " + game_id + " P1_id: " + uid_1 + " P2_id: " + uid_2);
    var target;
    // TODO: Update game is_active flag
    // If user already in the game, else if creating a new game, 
    // else if joining an existing game, else game is full
    if(uid_1 == req.user || uid_2 == req.user) {
      console.log("User already in this game. Redirecting...");
      connection.end();
      // TODO: redirect to specific game instance
      res.redirect('/game');
    } else if(uid_1 == null) {
      console.log("New room created. Adding user " + req.user);
      target = "uid_1";
    } else if(uid_2 == null) {
      console.log("Joining an existing room. Adding user " + req.user);
      target = "uid_2";
    } else {
      console.log("Room is full. Returning to lobby.");
      connection.end();
      res.redirect('/lobby');
    }

    queryString = "UPDATE game SET " + target + "='" + req.user + "' WHERE gid=" + game_id + ";";
  
    connection.query(queryString, (err, rows, fields) => {
      console.log(queryString); 
      
      if (err) {
        console.log("Failed to connect user to game: " + err + "\n");
        return;
      }

      console.log("Successfully updated game!");
    });
    
    connection.end();

    // TODO: Maybe change route to connect to the game instance?
    res.render('game', { title: 'Game' , user: req.user});
  } else {
    res.redirect('/login');
  }
});

router.get('/leave', function(req, res, next) {
  if (req.isAuthenticated()) {
    //User leaves the game they’re currently in
    //Request: takes user id and lobby id
    //Response: changes game state to unfinished

    let userId = req.user.uid;
    // TEMP: get lobby id from front end when ready
    let gameId = 10001; // for use with: uid = 1 => bob123
    //let gameId = req.body.gameid;

    let connection = getConnection();

    //UPDATE `game` SET `is_active`='2' WHERE gid='10001' AND (uid_1='1' OR uid_2='1');
    let updateQueryString = "UPDATE `game` SET `is_active`='2' WHERE gid='" + gameId + "' AND (uid_1='" + userId + "' OR uid_2='" + userId + "');";
    connection.query(updateQueryString, (err, rows, fields) => {
      if (err) {
        console.log("Failed to find current game: " + err + "\n");
        // TODO: define behavior/action for error
        return;
      }

      console.log("\nSuccessfully left current game!\n");
      res.redirect('../lobby');

    });
    connection.end();

  } else {
    res.redirect('../login');
  }
});

router.get('/state', function (req, res, next) {
  if (req.isAuthenticated()) {
    // TEMP: wait for game id to be stored in front end
    let gameId = 10001; // for use with: uid=1 => bob123
    let queryString = "SELECT `game_state` FROM `game` WHERE gid = " + gameId + ";";
    let connection = getConnection();

    connection.query(queryString, (err, rows, fields) => {
      if (err || !rows.length) {
        console.log("Failed to lookup game state: " + err + "\n");
        // TODO: define behavior/action for error
        return;
      }

      let gameState = rows[0].game_state; // game attributes
      console.log("\nGame state for gid = " + gameId + ": \n" + gameState + "\n"); // test print

      // TODO: front end use jquery + ajax to update game state without page refresh
      res.send(gameState); // temporary
    });
    connection.end();
  } else {
    res.redirect('../login');
  }
});

router.post('/state', function (req, res, next) {
  if (req.isAuthenticated()) {
    // TEMP: wait for game id to be stored in front end
    let gameId = 10001; // for use with: uid=1 => bob123
    let gameState = req.body.status;

    // TEMP: currently replaces '1' with '0' at the end of the string
    // "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" -> "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0"
    //let gameState = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 0"; // TEMP
    let queryString = "UPDATE `game` SET `game_state` = \'" + gameState + "\' WHERE gid = \'" + gameId + "\';";
    let connection = getConnection();
    connection.query(queryString, (err, rows, fields) => {
      if (err) {
        console.log("Failed to update game state: " + err + "\n");
        // TODO: define behavior/action for error
        return;
      }

      console.log("\nGame state update successful for gid = " + gameId + "!\n");
      // res.send("Temporary nly!");
    });
    connection.end();
  } else {
    res.redirect('../login');
  }
});

module.exports = router;