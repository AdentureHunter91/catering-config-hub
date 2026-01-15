<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$subcategoryId = isset($_GET['subcategory_id']) ? (int)$_GET['subcategory_id'] : null;
$status = isset($_GET['status']) ? trim($_GET['status']) : null;

$sql = "SELECT p.*, 
        GROUP_CONCAT(DISTINCT pa.allergen_id) as allergens_csv
        FROM products p
        LEFT JOIN product_allergens pa ON p.id = pa.product_id
        WHERE 1=1";
$params = [];

if ($subcategoryId) {
    $sql .= " AND p.subcategory_id = ?";
    $params[] = $subcategoryId;
}

if ($status) {
    $sql .= " AND p.status = ?";
    $params[] = $status;
}

$sql .= " GROUP BY p.id ORDER BY p.name ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

// Convert allergens CSV to array
foreach ($rows as &$row) {
    $row['allergens'] = $row['allergens_csv'] ? explode(',', $row['allergens_csv']) : [];
    unset($row['allergens_csv']);
}

jsonResponse($rows);
