<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    jsonResponse(null, false, "MISSING_ID", 422);
}

$stmt = $pdo->prepare("
    SELECT s.*, GROUP_CONCAT(sa.allergen_id) as allergen_ids
    FROM subproducts s
    LEFT JOIN subproduct_allergens sa ON s.id = sa.subproduct_id
    WHERE s.id = ?
    GROUP BY s.id
");
$stmt->execute([$id]);
$subproduct = $stmt->fetch();

if (!$subproduct) {
    jsonResponse(null, false, "NOT_FOUND", 404);
}

$subproduct['allergens'] = $subproduct['allergen_ids'] ? explode(',', $subproduct['allergen_ids']) : [];
unset($subproduct['allergen_ids']);

jsonResponse($subproduct);
