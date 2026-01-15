<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$stmt = $pdo->query("SELECT * FROM allergens ORDER BY name ASC");
$rows = $stmt->fetchAll();

jsonResponse($rows);
