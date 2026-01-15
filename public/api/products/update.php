<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$data = json_decode(file_get_contents("php://input"), true);

$id = isset($data['id']) ? (int)$data['id'] : 0;
$subcategory_id = isset($data['subcategory_id']) ? (int)$data['subcategory_id'] : null;
$name = trim($data['name'] ?? "");
$description = trim($data['description'] ?? "");
$status = trim($data['status'] ?? "active");

if ($id <= 0) {
    jsonResponse(null, false, "MISSING_ID", 422);
}

if ($name === "") {
    jsonResponse(null, false, "MISSING_REQUIRED_FIELDS", 422);
}

$stmt = $pdo->prepare("
    UPDATE products 
    SET subcategory_id = ?, name = ?, description = ?, status = ?
    WHERE id = ?
");
$stmt->execute([$subcategory_id, $name, $description, $status, $id]);

jsonResponse([
    "id" => $id,
    "updated" => true
]);
