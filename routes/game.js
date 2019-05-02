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
};

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


  module.exports = router;