<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$id = $_POST["id"] ?? 0;

if (!$id) {
    jsonResponse(null, false, "Missing ID", 400);
}

$stmt = $pdo->prepare("DELETE FROM contracts WHERE id=?");
$stmt->execute([$id]);

jsonResponse(["deleted" => true]);