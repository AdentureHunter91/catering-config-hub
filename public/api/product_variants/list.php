<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$subproduct_id = isset($_GET['subproduct_id']) ? (int)$_GET['subproduct_id'] : null;

if ($subproduct_id) {
    $stmt = $pdo->prepare("SELECT * FROM product_variants WHERE subproduct_id = ? ORDER BY name");
    $stmt->execute([$subproduct_id]);
} else {
    $stmt = $pdo->query("SELECT * FROM product_variants ORDER BY name");
}

$rows = $stmt->fetchAll();

jsonResponse($rows);
