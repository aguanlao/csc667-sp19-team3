router.post('/active', function(req, res, next) {
	var queryString = 'SELECT * FROM `game` WHERE `player1` LIKE 'userid' OR `player2` LIKE 'userid';
	var connection = getConnection();
	connection.query(queryString, [], (err, rows, fields) => {
		if (err) {
			console.log("Failed to search whether user is active");
			return;
		}
		console.log("Success");
		console.log("Game ID: " + rows.gid);
	});
	connection.end();

	// loop for if user is in more than one games. use rows.gid. it might do automatically
});