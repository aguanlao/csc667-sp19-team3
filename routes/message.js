var express = require('express');
// var app = express();
var router = express.Router();
var app = require('express')();
// var http = require('http').Server(app);
// var io = require('socket.io')(http);
// var port = process.env.PORT || 3300;


// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({extended: false}))

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

// io.on('connection', function(socket){
//     socket.on('chat message', function(msg){
//       io.emit('chat message', msg);
//     });
//   });
  
// http.listen(port, function(){
//     console.log('listening on *:' + port);
//   });



// io.on('connection', function (socket) {
//   console.log('a user connected');
//   socket.on('disconnect', function () {
//     console.log('user disconnected');
//   });
// });


// app.post('/messages', (req, res) => {
//     var message = new Message(req.body);
//     message.save((err) =>{
//       if(err)
//         sendStatus(500);
//       io.emit('message', req.body);
//       res.sendStatus(200);
//     })
//   })


router.get('/', function(req, res, next) {
    let connection = getConnection()
    let queryString = 'SELECT * FROM `message`';
    connection.query(queryString, (err, rows, fields) => {
      if (err) {
        console.log("Failed to update game state: " + err + "\n");
        // TODO: define behavior/action for error
        return;
      }
    res.send(rows)
    });
    connection.end();
  
});

router.post('/', function(req, res, next) {
        let message = req.body.message;
        let connection = getConnection()
        let queryString = "INSERT INTO `message` (uid, gid, message) VALUES ('thanh', '1111', '"+message+"')";
        connection.query(queryString, (err, rows, fields) => {
          if (err) {
            console.log("Failed to update game state: " + err + "\n");
            // TODO: define behavior/action for error
            return;
          }
        res.send(fields)
        });
        connection.end();


  });

  


  module.exports = router;