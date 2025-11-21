<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$id = intval($_GET['id'] ?? 0);
if ($id <= 0) {
    jsonError("Invalid department ID");
}

$stmt = $pdo->prepare("
    SELECT 
        id,
        name,
        short_name,
        description
    FROM departments
    WHERE id = ?
");
$stmt->execute([$id]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    jsonError("Department not found");
}

jsonResponse($row);
