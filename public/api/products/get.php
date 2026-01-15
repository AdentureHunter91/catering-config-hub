<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    jsonResponse(null, false, "MISSING_ID", 422);
}

$stmt = $pdo->prepare("SELECT * FROM products WHERE id = ?");
$stmt->execute([$id]);
$product = $stmt->fetch();

if (!$product) {
    jsonResponse(null, false, "NOT_FOUND", 404);
}

// Get allergens
$allergenStmt = $pdo->prepare("SELECT allergen_id FROM product_allergens WHERE product_id = ?");
$allergenStmt->execute([$id]);
$allergens = $allergenStmt->fetchAll(PDO::FETCH_COLUMN);

$product['allergens'] = $allergens ?: [];

jsonResponse($product);
