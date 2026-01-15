<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$data = json_decode(file_get_contents("php://input"), true);

$subcategory_id = isset($data['subcategory_id']) ? (int)$data['subcategory_id'] : 0;
$name = trim($data['name'] ?? "");
$description = trim($data['description'] ?? "");
$status = trim($data['status'] ?? "active");

if ($name === "" || $subcategory_id <= 0) {
    jsonResponse(null, false, "MISSING_REQUIRED_FIELDS", 422);
}

$stmt = $pdo->prepare("
    INSERT INTO products (subcategory_id, name, description, status)
    VALUES (?, ?, ?, ?)
");
$stmt->execute([$subcategory_id, $name, $description, $status]);

jsonResponse([
    "id" => (int)$pdo->lastInsertId(),
    "created" => true
]);
