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

// Queries the database for the user id's data
async function getUserData(uid) {
  return new Promise(function(resolve, reject) {
    const connection = getConnection()

    let queryString = 'SELECT * FROM user WHERE uid LIKE \'';
    queryString = queryString + uid + "';";

    connection.query(queryString, function(err, result) {
      if (err) {
        console.log("Failed to find user: " + err + "\n");
        connection.end()
        reject(null);
      }
  
      // No user found
      if (!result.length) {
        console.log("Failed to find user: User " + uid + " does not exist.\n");
        connection.end()
        reject(null);
      }
  

      data = {'username': result[0].username, 'uid': result[0].uid};
      connection.end();
      resolve(data);
      console.log("Finished getting user data")
    });
  });  
}

// Queries the database for the game id's data
async function getGameData(gid) {

    return new Promise(function(resolve, reject) {
      const connection = getConnection()

      let queryString = 'SELECT * FROM game WHERE gid LIKE \'';
      queryString = queryString + gid + "';";

      connection.query(queryString, function(err, result) {
        if (err) {
          console.log("Failed to find game: " + err + "\n");
          connection.end()
          reject(null);
        }
    
        // No game found
        if (!result.length) {
          console.log("Failed to find game: " + err + "\n");
          connection.end()
          reject(null);
        }
    
        is_active = result[0].is_active;
        uid_1 = result[0].uid_1;
        uid_2 = result[0].uid_2;
        console.log("FINISHED GET QUERY");
        data = {"is_active": is_active, "uid_1": uid_1, "uid_2": uid_2};
        connection.end();
        resolve(data);
      });
      console.log("Finishing getting game data...")
    });
}

// Updates target of game with gid with user
async function updateGamePlayer(req, gid, target) {

  return new Promise(function(resolve, reject) {
    const connection = getConnection()

    const queryString = "UPDATE game SET " + target + "='" + req.user.uid + "' WHERE gid=" + gid + ";";

    connection.query(queryString, (err, rows, fields) => {      
      if (err) {
        console.log("Failed to update game user: " + err + "\n");
        connection.end();
        reject();
      } else {
        console.log("Successfully updated game!");
        connection.end();
        resolve();
      }
    });
    
    console.log("Finishing updating game data...")
  });
}

// Attempts to connect current user to game
async function connectToGame(req, res, game_id) {
  let game_data = await getGameData(game_id)
    .catch((err) => console.log(err));
  console.log(game_data);
  
  // Determine where to place current user
  let target;
  let uid_1 = game_data.uid_1;
  let uid_2 = game_data.uid_2;

  // TODO: Update game is_active flag
  // If user already in the game, else if creating a new game, 
  // else if joining an existing game, else game is full
  if(uid_1 == req.user.uid || uid_2 == req.user.uid) {
    console.log("User already in this game. Redirecting...");
    // TODO: redirect to specific game instance
    res.redirect('/game');
  } else if(uid_1 == null) {
    console.log("New room created. Adding user " + req.user.username);
    target = "uid_1";
    let update = await updateGamePlayer(req, game_id, target)
    .catch((err) => console.log(err))
  } else if(uid_2 == null) {
    console.log("Joining an existing room. Adding user " + req.user.username);
    target = "uid_2";
    let update = await updateGamePlayer(req, game_id, target)
    .catch((err) => console.log(err))
  } else {
    console.log("Room is full. Returning to lobby.");
    res.redirect('/lobby');
  }
}

// Game routes

router.get('/', function (req, res, next) {
  if (req.isAuthenticated()) {
    const username = req.user.username;
    const userId = req.user.uid;
    const connection = getConnection()

    console.log("Getting state in game/");

    // TODO: Need to create a random chess table/ game_id
    // May want to use a function for query
    const game_id = 10001;
    const queryString = "SELECT * FROM game WHERE gid LIKE " + game_id + ";";
    connection.query(queryString, function(err, result) {
      if (err || !result.length) {
        console.log("Failed to lookup game state: " + err + "\n");
        // TODO: define behavior/action for error
        return;
      }

      const state = result[0].game_state;
      const uid_1 = result[0].uid_1;
      const uid_2 = result[0].uid_2;

      // Redirect if current user is not in the game
      if(userId !== uid_1 && userId !== uid_2) {
        // TODO: Send proper http response code
        console.log("You're not in this game.");
        res.redirect('/lobby');
        return;
      }

      // Determine uid of other player & current user color
      let otherUid = uid_1;
      let color = 'b';
      if(userId ===  uid_1) {
        otherUid = uid_2;
        color = 'w';
      } 

      res.render('game', { 
        title: 'Game', 
        user: username,
        color: color, 
        uid: userId, 
        otherUser: otherUid, 
        state: state
      });
    });
  } else {
    res.redirect('/login');
  }
});

router.get('/connect', function(req, res, next) {
  if (req.isAuthenticated()) {
    // TODO: Get game_id when connecting
    // var game_id = req.body.gid;
    const game_id = 10001;
    connectToGame(req, res, game_id).catch((err) => console.log(err))

    // res.render('game', { title: 'Game' , user: req.user.username});
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
    // let gameState = req.body.status;
    // if(gameState == '')
      // let gameState = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";
    // else 
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

router.post('/create', function (req, res, next) {
  if (req.isAuthenticated()) {
    const userId = req.user.uid;
    const lobbyTitle = req.body.lobbyTitle;

    let queryString = "INSERT INTO game (`uid_1`) VALUES ('" + userId + "');";
    // Add lobby title if specified
    if (lobbyTitle) {
      queryString = "INSERT INTO game (`uid_1`, `title`) VALUES ('";
      queryString = queryString + userId + "', '" + lobbyTitle + "');";
    }

    let connection = getConnection();
    connection.query(queryString, (err, rows, fields) => {
      if (err) {
        console.log("Failed to create game: " + err + "\n");
        res.redirect('/lobby');
        return;
      }

      console.log("Successfully created new game!");
      res.render('create_lobby', { title: 'Lobby Created', user: req.user.username, gameCreated: true });
    });
    connection.end();
  } else {
    res.redirect('/login');
  }

});

module.exports = router;