<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;

if ($id <= 0) {
    jsonResponse(null, false, "MISSING_ID", 422);
}

$stmt = $pdo->prepare("DELETE FROM product_variants WHERE id = ?");
$stmt->execute([$id]);

jsonResponse([
    "id" => $id,
    "deleted" => true
]);
