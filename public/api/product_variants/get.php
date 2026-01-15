<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    jsonResponse(null, false, "MISSING_ID", 422);
}

$stmt = $pdo->prepare("
    SELECT pv.*, GROUP_CONCAT(pva.allergen_id) as allergen_ids
    FROM product_variants pv
    LEFT JOIN product_variant_allergens pva ON pv.id = pva.product_variant_id
    WHERE pv.id = ?
    GROUP BY pv.id
");
$stmt->execute([$id]);
$variant = $stmt->fetch();

if (!$variant) {
    jsonResponse(null, false, "NOT_FOUND", 404);
}

$variant['allergens'] = $variant['allergen_ids'] ? explode(',', $variant['allergen_ids']) : [];
unset($variant['allergen_ids']);

jsonResponse($variant);
