<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$ean = isset($_GET['ean']) ? trim($_GET['ean']) : "";
$excludeId = isset($_GET['exclude_id']) ? (int)$_GET['exclude_id'] : 0;

if ($ean === "") {
    jsonResponse(null, false, "MISSING_EAN", 422);
}

// Check if EAN exists
$sql = "
    SELECT 
        pv.id,
        pv.name as variant_name,
        pv.ean,
        p.id as product_id,
        p.name as product_name,
        ps.id as subcategory_id,
        ps.name as subcategory_name,
        pc.id as category_id,
        pc.name as category_name
    FROM product_variants pv
    LEFT JOIN products p ON pv.product_id = p.id
    LEFT JOIN product_subcategories ps ON p.subcategory_id = ps.id
    LEFT JOIN product_categories pc ON ps.category_id = pc.id
    WHERE pv.ean = ?
";

if ($excludeId > 0) {
    $sql .= " AND pv.id != ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$ean, $excludeId]);
} else {
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$ean]);
}

$existing = $stmt->fetch();

if ($existing) {
    jsonResponse([
        "exists" => true,
        "variant_id" => $existing['id'],
        "variant_name" => $existing['variant_name'],
        "product_id" => $existing['product_id'],
        "product_name" => $existing['product_name'],
        "subcategory_id" => $existing['subcategory_id'],
        "subcategory_name" => $existing['subcategory_name'],
        "category_id" => $existing['category_id'],
        "category_name" => $existing['category_name'],
        "path" => implode(" → ", array_filter([
            $existing['category_name'],
            $existing['subcategory_name'],
            $existing['product_name'],
            $existing['variant_name']
        ]))
    ]);
} else {
    jsonResponse([
        "exists" => false
    ]);
}
