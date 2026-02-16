<?php
require_once __DIR__ . '/../bootstrap.php';

$status = isset($_GET['status']) ? trim($_GET['status']) : 'active';

$sql = "SELECT * FROM measurement_units";
$params = [];

if ($status !== 'all') {
    $sql .= " WHERE status = ?";
    $params[] = $status;
}

$sql .= " ORDER BY sort_order ASC, symbol ASC";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

jsonResponse($rows);
