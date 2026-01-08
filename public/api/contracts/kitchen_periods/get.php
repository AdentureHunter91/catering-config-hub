<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    jsonResponse(null, false, "INVALID_ID", 422);
}

// Pobieramy jedną kuchnię
$stmt = $pdo->prepare("
    SELECT *
    FROM kitchens
    WHERE id = ?
");
$stmt->execute([$id]);

$row = $stmt->fetch();

if (!$row) {
    jsonResponse(null, false, "NOT_FOUND", 404);
}

jsonResponse($row);
