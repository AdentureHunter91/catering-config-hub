<?php
require_once __DIR__ . '/../../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);
$data = json_decode(file_get_contents("php://input"), true);

$contractId = (int)($data['contract_id'] ?? 0);
$kitchenId  = (int)($data['kitchen_id'] ?? 0);
$startDate  = $data['start_date'] ?? null;
$endDate    = $data['end_date'] ?? null;

if (!$contractId || !$kitchenId || !$startDate) {
    jsonResponse(null, false, "MISSING_REQUIRED_FIELDS", 422);
}

$stmt = $pdo->prepare("
    INSERT INTO contract_kitchen_periods (contract_id, kitchen_id, start_date, end_date)
    VALUES (?, ?, ?, ?)
");
$stmt->execute([$contractId, $kitchenId, $startDate, $endDate]);

$newId = (int)$pdo->lastInsertId();

// Audit log
$newRecord = getRecordForAudit($pdo, 'contract_kitchen_periods', $newId);
logAudit($pdo, 'contract_kitchen_periods', $newId, 'insert', null, $newRecord, $user['id'] ?? null);

jsonResponse([
    "id" => $newId,
    "contract_id" => $contractId,
    "kitchen_id" => $kitchenId,
    "start_date" => $startDate,
    "end_date" => $endDate
]);
