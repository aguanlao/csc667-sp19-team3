  var express = require('express');
  var router = express.Router();
  var app = express();

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

  app.use('../message', router);

  // TODO: migrate message routes back here

  // router.get('/', function(req, res, next) {
  //     let connection = getConnection()
  //     let queryString = 'SELECT * FROM `message`';
  //     connection.query(queryString, (err, rows, fields) => {
  //       if (err) {
  //         console.log("Failed to update game state: " + err + "\n");
  //         // TODO: define behavior/action for error
  //         return;
  //       }
  //     res.send(rows)
  //     });
  //     connection.end();
  
  // });

  // router.post('../', function(req, res, next) {
  //       if (req.isAuthenticated()) {
  //         let userId = req.user.username;
  //         let message = req.body.message;
  //         let connection = getConnection()
  //         let queryString = "INSERT INTO `message` (uid, gid, message) VALUES ('"+userId+"', '1111', '"+message+"')";
  //         connection.query(queryString, (err, rows, fields) => {
  //           if (err) {
  //             console.log("Failed to update game state: " + err + "\n");
  //             // TODO: define behavior/action for error
  //             return;
  //           }
  //         res.send(fields)
  //         });
  //         connection.end();
  //       } 
  //         else {
  //           alert("You must login to user this chat");
  //           res.redirect('../login');
  //         }
  //   });


  module.exports = router;
