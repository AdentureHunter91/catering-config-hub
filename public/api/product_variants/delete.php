<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$data = json_decode(file_get_contents("php://input"), true);
$id = isset($data['id']) ? (int)$data['id'] : 0;

if ($id <= 0) {
    $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
}

if ($id <= 0) {
    jsonResponse(null, false, "MISSING_ID", 422);
}

// Archive instead of hard delete
$stmt = $pdo->prepare("UPDATE product_variants SET status = 'archived' WHERE id = ?");
$stmt->execute([$id]);

jsonResponse([
    "id" => $id,
    "archived" => true
]);
