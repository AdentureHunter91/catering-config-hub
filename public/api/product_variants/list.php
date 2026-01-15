<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$product_id = isset($_GET['product_id']) ? (int)$_GET['product_id'] : null;
$status = isset($_GET['status']) ? trim($_GET['status']) : null;

$sql = "SELECT pv.*, GROUP_CONCAT(pva.allergen_id) as allergen_ids
        FROM product_variants pv
        LEFT JOIN product_variant_allergens pva ON pv.id = pva.product_variant_id
        WHERE 1=1";
$params = [];

if ($product_id) {
    $sql .= " AND pv.product_id = ?";
    $params[] = $product_id;
}

if ($status) {
    $sql .= " AND pv.status = ?";
    $params[] = $status;
}

$sql .= " GROUP BY pv.id ORDER BY pv.name ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

// Convert allergen_ids to array
foreach ($rows as &$row) {
    $row['allergens'] = $row['allergen_ids'] ? explode(',', $row['allergen_ids']) : [];
    unset($row['allergen_ids']);
}

jsonResponse($rows);
