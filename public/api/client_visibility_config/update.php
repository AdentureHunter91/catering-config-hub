<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);
$data = json_decode(file_get_contents("php://input"), true);

$clientId = isset($data['client_id']) ? (int)$data['client_id'] : 0;
$visibilityName = trim($data['visibility_name'] ?? '');
$hasActive = array_key_exists('is_active', $data);
$isActive = $hasActive ? (int)$data['is_active'] : null;

if ($clientId <= 0 || $visibilityName === '' || !$hasActive) {
    jsonResponse(null, false, "INVALID_DATA", 422);
}

$isActive = $isActive ? 1 : 0;

$stmt = $pdo->prepare("
    SELECT id
    FROM client_visibility_config
    WHERE client_id = ? AND visibility_name = ?
");
$stmt->execute([$clientId, $visibilityName]);
$existingId = (int)($stmt->fetchColumn() ?: 0);

if ($existingId > 0) {
    $oldRecord = getRecordForAudit($pdo, 'client_visibility_config', $existingId);

    $upd = $pdo->prepare("
        UPDATE client_visibility_config
        SET is_active = ?
        WHERE id = ?
    ");
    $upd->execute([$isActive, $existingId]);

    $newRecord = getRecordForAudit($pdo, 'client_visibility_config', $existingId);
    logAudit($pdo, 'client_visibility_config', $existingId, 'update', $oldRecord, $newRecord, $user['id'] ?? null);

    jsonResponse(true);
}

$ins = $pdo->prepare("
    INSERT INTO client_visibility_config (visibility_name, client_id, is_active)
    VALUES (?, ?, ?)
");
$ins->execute([$visibilityName, $clientId, $isActive]);
$newId = (int)$pdo->lastInsertId();

$newRecord = getRecordForAudit($pdo, 'client_visibility_config', $newId);
logAudit($pdo, 'client_visibility_config', $newId, 'insert', null, $newRecord, $user['id'] ?? null);

jsonResponse([
    "id" => $newId,
    "visibility_name" => $visibilityName,
    "client_id" => $clientId,
    "is_active" => $isActive,
]);
