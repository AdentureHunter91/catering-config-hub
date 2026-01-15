<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$productId = isset($_GET['product_id']) ? (int)$_GET['product_id'] : null;
$status = isset($_GET['status']) ? trim($_GET['status']) : null;

$sql = "SELECT s.*, GROUP_CONCAT(sa.allergen_id) as allergen_ids
        FROM subproducts s
        LEFT JOIN subproduct_allergens sa ON s.id = sa.subproduct_id
        WHERE 1=1";
$params = [];

if ($productId) {
    $sql .= " AND s.product_id = ?";
    $params[] = $productId;
}

if ($status) {
    $sql .= " AND s.status = ?";
    $params[] = $status;
}

$sql .= " GROUP BY s.id ORDER BY s.name ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

// Convert allergen_ids to array
foreach ($rows as &$row) {
    $row['allergens'] = $row['allergen_ids'] ? explode(',', $row['allergen_ids']) : [];
    unset($row['allergen_ids']);
}

jsonResponse($rows);
