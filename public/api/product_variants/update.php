<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$data = json_decode(file_get_contents("php://input"), true);

$id            = isset($data['id']) ? (int)$data['id'] : 0;
$subproduct_id = isset($data['subproduct_id']) ? (int)$data['subproduct_id'] : null;
$ean           = trim($data['ean'] ?? "");
$name          = trim($data['name'] ?? "");
$content       = trim($data['content'] ?? "");
$unit          = trim($data['unit'] ?? "");
$sku           = trim($data['sku'] ?? "");
$kcal          = isset($data['kcal']) && $data['kcal'] !== "" ? (float)$data['kcal'] : null;
$brands        = trim($data['brands'] ?? "");
$categories    = trim($data['categories'] ?? "");
$image_url     = trim($data['image_url'] ?? "");

if ($id <= 0) {
    jsonResponse(null, false, "MISSING_ID", 422);
}

// Validate required fields
if ($ean === "" || $name === "" || $content === "" || $unit === "" || $sku === "") {
    jsonResponse(null, false, "MISSING_REQUIRED_FIELDS", 422);
}

// Check for duplicate EAN (excluding current record)
$checkStmt = $pdo->prepare("SELECT id FROM product_variants WHERE ean = ? AND id != ?");
$checkStmt->execute([$ean, $id]);
if ($checkStmt->fetch()) {
    jsonResponse(null, false, "EAN_ALREADY_EXISTS", 409);
}

// UPDATE
$stmt = $pdo->prepare("
    UPDATE product_variants 
    SET subproduct_id = ?, ean = ?, name = ?, content = ?, unit = ?, sku = ?, kcal = ?, brands = ?, categories = ?, image_url = ?
    WHERE id = ?
");
$stmt->execute([$subproduct_id, $ean, $name, $content, $unit, $sku, $kcal, $brands, $categories, $image_url, $id]);

jsonResponse([
    "id" => $id,
    "updated" => true
]);
