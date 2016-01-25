<?php
$SYSTEM_USER_EMAIL = "suki@tritarget.org";

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json");

if ($_SERVER["REQUEST_METHOD"] != "POST") {
  http_response_code(405);
  echo json_encode(array('status' => 'error', 'message' => 'Method not allowed'));
  exit;
}

$invalids = array();

if ($_SERVER["HTTP_CONTENT_TYPE"] == "application/json") {
  $data = json_decode(file_get_contents("php://input"), true);
} else {
  $data = array(
    "name"    => $_POST["name"],
    "email"   => $_POST["email"],
    "subject" => $_POST["subject"],
    "message" => $_POST["message"]
  );
}

$data["name"]    = filter_var($data["name"], FILTER_UNSAFE_RAW);
$data["email"]   = filter_var($data["email"], FILTER_SANITIZE_EMAIL);
$data["subject"] = filter_var($data["subject"], FILTER_UNSAFE_RAW);

if (!$data["email"]) {
  $invalids["email"] = "can not be empty";
} elseif (!filter_var($data["email"], FILTER_VALIDATE_EMAIL)) {
  $invalids["email"] = "must be a valid email";
}

if (!$data["name"]) {
  $invalids["name"] = "can not be empty";
}

if (!$data["subject"]) {
  $invalids["subject"] = "can not be empty";
}

if (!$data["message"]) {
  $invalids["message"] = "can not be empty";
}

if (count($invalids) > 0) {
  http_response_code(422);
  echo json_encode(array('status' => 'fail', 'data' => $invalids));
  exit;
}

$commenter = $data["name"] . "<" . $data["email"] . ">";
$system_from = $data["name"] . "<" . $SYSTEM_USER_EMAIL . ">";
$extra_headers = "From: " . $system_from . "\r\n";
$extra_headers .= "Cc: " . $commenter . "\r\n";
$extra_headers .= "Reply-To: " . $commenter . "\r\n";

mail($SYSTEM_USER_EMAIL, $data["subject"], $data["message"], $extra_headers, "-f" . $SYSTEM_USER_EMAIL);

http_response_code(201);
echo json_encode(array('status' => 'success', 'data' => null));
?>
