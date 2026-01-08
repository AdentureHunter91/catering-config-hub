<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$data = json_decode(file_get_contents("php://input"), true);

$id        = isset($data['id']) ? (int)$data['id'] : 0;
$dietId    = isset($data['diet_id']) ? (int)$data['diet_id'] : 0;
$customName = trim($data['custom_name'] ?? '');
$customShort = trim($data['custom_short_name'] ?? '');

if ($id <= 0 || $dietId <= 0) {
    jsonResponse(null, false, "INVALID_DATA", 422);
}

// pobierz client_id
$stmt = $pdo->prepare("SELECT client_id FROM client_diets WHERE id = ?");
$stmt->execute([$id]);
$clientId = $stmt->fetchColumn();

if (!$clientId) {
    jsonResponse(null, false, "NOT_FOUND", 404);
}

$check = $pdo->prepare("
    SELECT id FROM client_diets
    WHERE client_id = ? AND diet_id = ? AND id <> ?
");
$check->execute([$clientId, $dietId, $id]);
$existing = $check->fetchColumn();

if ($existing) {
    jsonResponse(null, false, "DUPLICATE_DIET", 422);
}

$upd = $pdo->prepare("
    UPDATE client_diets
    SET diet_id = ?, custom_name = ?, custom_short_name = ?
    WHERE id = ?
");
$upd->execute([
    $dietId,
    $customName ?: null,
    $customShort ?: null,
    $id
]);

jsonResponse(true);
