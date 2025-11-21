<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$stmt = $pdo->query("
    SELECT id, short_name, full_name, total_beds 
    FROM clients
    ORDER BY short_name ASC
");

$rows = $stmt->fetchAll();

jsonResponse($rows);
