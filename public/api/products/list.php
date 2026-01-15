<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$subcategoryId = isset($_GET['subcategory_id']) ? (int)$_GET['subcategory_id'] : null;
$status = isset($_GET['status']) ? trim($_GET['status']) : null;

$sql = "SELECT * FROM products WHERE 1=1";
$params = [];

if ($subcategoryId) {
    $sql .= " AND subcategory_id = ?";
    $params[] = $subcategoryId;
}

if ($status) {
    $sql .= " AND status = ?";
    $params[] = $status;
}

$sql .= " ORDER BY name ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

jsonResponse($rows);
