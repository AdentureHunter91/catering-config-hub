<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

$stmt = $pdo->prepare("
    SELECT c.*, cl.short_name AS client_short_name
    FROM contracts c
    JOIN clients cl ON cl.id = c.client_id
    WHERE c.id = ?
");
$stmt->execute([$id]);

$item = $stmt->fetch();

if (!$item) {
    jsonResponse(null, false, "NOT_FOUND", 404);
}

jsonResponse($item);
