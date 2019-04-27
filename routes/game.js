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

function addUserToGame(uid, gid, target) {
  var queryString = "UPDATE game SET " + target + "='" + uid + "' WHERE gid='" + gid + "';";
  console.log(queryString);

  var connection = getConnection();
  connection.query(queryString, (err, rows, fields) => {
    if (err) {
      console.log("Failed to connect user to game: " + err + "\n");
      return;
    }
  });
  connection.end();
};

// TODO
// - add game routes

router.get('/connect', function(req, res, next) {
  if (req.isAuthenticated()) {
    // var game_id = req.body.gid;
    var game_id = 10001;

    var is_active, uid_1, uid_2;

    var queryString = 'SELECT * FROM game WHERE gid LIKE \'';
    queryString = queryString + game_id + "';";

    var connection = getConnection();
    connection.query(queryString, (err, rows, fields) => {
      if (err) {
        console.log("Failed to connect to game: " + err + "\n");
        res.redirect('/lobby');
        return;
      }

      // No game found
      if (!rows.length) {
        console.log("Failed to connect to game: " + err + "\n");
        res.redirect('/lobby');
        return;
      }

      console.log("Game found! Connecting...\n");
      console.log("Game: " + rows[0].gid + " P1_id: " + rows[0].uid_1 + " P2_id: " + rows[0].uid_2);

      is_active = rows[0].is_active;
      uid_1 = rows[0].uid_1;
      uid_2 = rows[0].uid_2;
    });
    connection.end();

    // If creating a new game, else if joining an existing game, else game is full
    if(uid_1 == undefined) {
      console.log("New room created. Adding user " + req.user);
      addUserToGame(req.user, game_id, "uid_1");      
    } else if(uid_2 == undefined) {
      console.log("Joining an existing room. Adding user " + req.user);
      addUserToGame(req.user, game_id, "uid_2");
    } else {
      console.log("Room is full. Returning to lobby.");
      res.redirect('/lobby');
    }
    // TODO: Maybe change route to connect to the game instance?
    res.render('game', { title: 'Game' , user: user});
  } else {
    res.redirect('/login');
  }
});


  module.exports = router;