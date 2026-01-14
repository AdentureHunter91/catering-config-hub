<?php
require_once "../Config/api/bootstrap.php";
session_start();

$first = trim($_POST["first_name"] ?? "");
$last = trim($_POST["last_name"] ?? "");
$email = trim($_POST["email"] ?? "");
$pass = $_POST["password"] ?? "";

if (!$first || !$last || !$email || !$pass) {
    echo json_encode(["success" => false, "error" => "Uzupełnij wszystkie pola"]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    echo json_encode(["success" => false, "error" => "Nieprawidłowy email"]);
    exit;
}

if (strlen($pass) < 6) {
    echo json_encode(["success" => false, "error" => "Hasło musi mieć min. 6 znaków"]);
    exit;
}

// sprawdzenie czy email istnieje
$stmt = $pdo->prepare("SELECT id FROM users WHERE email = :email");
$stmt->execute([':email' => $email]);

if ($stmt->fetch()) {
    echo json_encode(["success" => false, "error" => "Email jest już zarejestrowany"]);
    exit;
}

// zapis
$hash = password_hash($pass, PASSWORD_BCRYPT);

$insert = $pdo->prepare("
    INSERT INTO users (email, password_hash, first_name, last_name, is_active)
    VALUES (:email, :hash, :first, :last, 0)
");
$insert->execute([
    ':email' => $email,
    ':hash' => $hash,
    ':first' => $first,
    ':last' => $last
]);

echo json_encode(["success" => true]);
