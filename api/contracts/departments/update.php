<?php
require_once __DIR__ . '/../../bootstrap.php';

$pdo = getPDO();

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
    // update
    $stmt = $pdo->prepare("
        UPDATE contract_departments SET is_active = ? WHERE id = ?
    ");
    $stmt->execute([$isActive, $row['id']]);
} else {
    // insert
    $stmt = $pdo->prepare("
        INSERT INTO contract_departments (contract_id, client_department_id, is_active)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$contractId, $clientDepartmentId, $isActive]);
}

jsonResponse(true);
