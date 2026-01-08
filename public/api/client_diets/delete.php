<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;

if ($id <= 0) {
    jsonResponse(null, false, "INVALID_ID", 400);
}

$stmt = $pdo->prepare("DELETE FROM client_diets WHERE id = ?");
$stmt->execute([$id]);

jsonResponse(true);
