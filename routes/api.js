var express = require('express');
var app = express();
var router = express.Router();

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

app.use('/api', router); // <oururl>.com/api is the base url for all our api routes

router.get('/lobby', function (req, res, next) {
    // TODO
    // - get json of: lobby number, player info, lobby status
});

module.exports = router;