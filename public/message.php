<?php
$DB['host'] = 'mydbinstance.cr9kkojcxn4d.us-west-1.rds.amazonaws.com';
$DB['db'] = 'csc667team03';
$DB['id'] = 'root';
$DB['pw'] = 'sfstatecsc667team03';

$mysqli = new mysqli($DB['host'], $DB['id'], $DB['pw'], $DB['db']);

$message = '';

if (!empty($_POST['message'])) {
  $message = trim($_POST['message']);
}
//TODO
//$uid = $_POST['uid'];
//$gid = $_POST['gid'];



//retrieve messages associated with the requested gid
$q = "SELECT * FROM message WHERE gid LIKE '%9999%'";
$result = $mysqli->query($q);

while($row = mysqli_fetch_array($result)) {
  echo "[".$row['timestamp']."] ".$row['uid'].": ".$row['message']."\r\n";
}

//validate new message string
if(isset($message) === true && $message === '') {
  $mysqli->close();
  exit();
}

//mid (auto_increment) | uid | gid | message | timestamp(defalt=CURRENT_TIMESTAMP)
$q = "INSERT INTO message (uid, gid, message) VALUES ('User', '9999', '$message')";
$mysqli->query($q);


$mysqli->close();
exit();
?>