<?php
require_once "../api/bootstrap.php";
session_start();

$email = $_POST["email"] ?? "";
$password = $_POST["password"] ?? "";

if (!$email || !$password) {
    echo json_encode(["success" => false, "error" => "Podaj email i hasło"]);
    exit;
}

$stmt = $pdo->prepare("
                        SELECT id, email, password_hash, first_name, last_name, is_active 
                        FROM users 
                        WHERE email = :email 
                        LIMIT 1
                        ");
$stmt->execute([':email' => $email]);
$user = $stmt->fetch(PDO::FETCH_ASSOC);

if ($user["is_active"] == 0) {
    echo json_encode(["success" => false, "error" => "Twoje konto nie zostało jeszcze aktywowane"]);
    exit;
}

if (!$user) {
    echo json_encode(["success" => false, "error" => "Nieprawidłowy email lub hasło"]);
    exit;
}

if (!password_verify($password, $user["password_hash"])) {
    echo json_encode(["success" => false, "error" => "Nieprawidłowy email lub hasło"]);
    exit;
}

$_SESSION["user_id"] = $user["id"];

echo json_encode(["success" => true]);
