<?php
require_once __DIR__ . '/../../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);

$data = json_decode(file_get_contents("php://input"), true);

$id = (int)$data['id'];
$isActive = (int)$data['is_active'];

if ($id <= 0) {
    jsonResponse(null, false, "INVALID_ID", 422);
}

// Get old record for audit
$oldRecord = getRecordForAudit($pdo, 'contract_department_diets', $id);

$stmt = $pdo->prepare("
    UPDATE contract_department_diets
    SET is_active = ?
    WHERE id = ?
");
$stmt->execute([$isActive, $id]);

// Audit log
$newRecord = getRecordForAudit($pdo, 'contract_department_diets', $id);
logAudit($pdo, 'contract_department_diets', $id, 'update', $oldRecord, $newRecord, $user['id'] ?? null);

jsonResponse(true);
