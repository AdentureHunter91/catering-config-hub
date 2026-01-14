<?php
// /Login/me.php

// CORS for preview origins (Lovable / external)
$allowedOrigins = [
    "https://id-preview--d017e342-c02f-476a-94a1-a72ec0222267.lovable.app",
    "https://preview-7c11c837--catering-config-hub.lovable.app",
    "https://d017e342-c02f-476a-94a1-a72ec0222267.lovableproject.com",
];

if (isset($_SERVER["HTTP_ORIGIN"]) && in_array($_SERVER["HTTP_ORIGIN"], $allowedOrigins, true)) {
    header("Access-Control-Allow-Origin: " . $_SERVER["HTTP_ORIGIN"]);
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
}

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}
require_once "../Config/api/bootstrap.php";
session_start();

if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false]);
    exit;
}

$stmt = $pdo->prepare("
    SELECT id, email, first_name, last_name 
    FROM users 
    WHERE id = :id
");
$stmt->execute([':id' => $_SESSION["user_id"]]);
$data = $stmt->fetch(PDO::FETCH_ASSOC);

/*
|--------------------------------------------------------------------------
| Pobranie uprawnień wynikających z ról
|--------------------------------------------------------------------------
*/
$perm = $pdo->prepare("
    SELECT p.name 
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = :id
");
$perm->execute([':id' => $_SESSION["user_id"]]);
$data["permissions"] = $perm->fetchAll(PDO::FETCH_COLUMN);

/*
|--------------------------------------------------------------------------
| Pobranie RÓL użytkownika
|--------------------------------------------------------------------------
*/
$roles = $pdo->prepare("
    SELECT r.name
    FROM user_roles ur
    JOIN roles r ON r.id = ur.role_id
    WHERE ur.user_id = :id
");
$roles->execute([':id' => $_SESSION["user_id"]]);
$data["roles"] = $roles->fetchAll(PDO::FETCH_COLUMN);

echo json_encode(["success" => true, "data" => $data]);
