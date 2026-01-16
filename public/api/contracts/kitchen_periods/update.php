<?php
require_once __DIR__ . '/../../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);
$data = json_decode(file_get_contents("php://input"), true);

$id        = (int)($data['id'] ?? 0);
$kitchenId = (int)($data['kitchen_id'] ?? 0);
$startDate = $data['start_date'] ?? null;
$endDate   = $data['end_date'] ?? null;

if (!$id || !$kitchenId || !$startDate) {
    jsonResponse(null, false, "INVALID_DATA", 422);
}

// Get old record for audit
$oldRecord = getRecordForAudit($pdo, 'contract_kitchen_periods', $id);

$stmt = $pdo->prepare("
    UPDATE contract_kitchen_periods
    SET kitchen_id = ?, start_date = ?, end_date = ?
    WHERE id = ?
");
$stmt->execute([$kitchenId, $startDate, $endDate, $id]);

// Audit log
$newRecord = getRecordForAudit($pdo, 'contract_kitchen_periods', $id);
logAudit($pdo, 'contract_kitchen_periods', $id, 'update', $oldRecord, $newRecord, $user['id'] ?? null);

jsonResponse(true);