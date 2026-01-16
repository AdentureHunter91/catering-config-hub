<?php
require_once __DIR__ . '/../../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);

$data = json_decode(file_get_contents("php://input"), true);

$contractId = (int)$data['contract_id'];
$clientDepartmentId = (int)$data['client_department_id'];
$isActive = (int)$data['is_active'];

// check if exists
$stmt = $pdo->prepare("
    SELECT id FROM contract_departments
    WHERE contract_id = ? AND client_department_id = ?
");
$stmt->execute([$contractId, $clientDepartmentId]);
$row = $stmt->fetch();

if ($row) {
    // Get old record for audit
    $oldRecord = getRecordForAudit($pdo, 'contract_departments', $row['id']);
    
    // update
    $stmt = $pdo->prepare("
        UPDATE contract_departments SET is_active = ? WHERE id = ?
    ");
    $stmt->execute([$isActive, $row['id']]);
    
    // Audit log
    $newRecord = getRecordForAudit($pdo, 'contract_departments', $row['id']);
    logAudit($pdo, 'contract_departments', $row['id'], 'update', $oldRecord, $newRecord, $user['id'] ?? null);
} else {
    // insert
    $stmt = $pdo->prepare("
        INSERT INTO contract_departments (contract_id, client_department_id, is_active)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$contractId, $clientDepartmentId, $isActive]);
    
    $newId = (int)$pdo->lastInsertId();
    
    // Audit log
    $newRecord = getRecordForAudit($pdo, 'contract_departments', $newId);
    logAudit($pdo, 'contract_departments', $newId, 'insert', null, $newRecord, $user['id'] ?? null);
}

jsonResponse(true);
