<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);
$data = json_decode(file_get_contents("php://input"), true);

$clientId        = isset($data['client_id']) ? (int)$data['client_id'] : 0;
$departmentId    = isset($data['department_id']) ? (int)$data['department_id'] : 0;
$customName      = trim($data['custom_name'] ?? '');
$customShort     = trim($data['custom_short_name'] ?? '');
$city            = trim($data['city'] ?? '');
$postalCode      = trim($data['postal_code'] ?? '');
$street          = trim($data['street'] ?? '');
$buildingNumber  = trim($data['building_number'] ?? '');

if ($clientId <= 0 || $departmentId <= 0) {
    jsonResponse(null, false, "MISSING_REQUIRED_FIELDS", 422);
}

// unikalność: 1 klient - 1 oddział
$check = $pdo->prepare("
    SELECT id 
    FROM client_departments 
    WHERE client_id = ? AND department_id = ?
");
$check->execute([$clientId, $departmentId]);
$existing = $check->fetchColumn();

if ($existing) {
    jsonResponse(null, false, "DUPLICATE_DEPARTMENT", 422);
}

$stmt = $pdo->prepare("
    INSERT INTO client_departments 
    (client_id, department_id, custom_name, custom_short_name, city, postal_code, street, building_number)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
");
$stmt->execute([
    $clientId,
    $departmentId,
    $customName ?: null,
    $customShort ?: null,
    $city ?: null,
    $postalCode ?: null,
    $street ?: null,
    $buildingNumber ?: null,
]);

$id = (int)$pdo->lastInsertId();

// Audit log
$newRecord = getRecordForAudit($pdo, 'client_departments', $id);
logAudit($pdo, 'client_departments', $id, 'insert', null, $newRecord, $user['id'] ?? null);

// pobieramy z joinem, żeby zwrócić komplet
$stmt2 = $pdo->prepare("
    SELECT 
        cd.id,
        cd.client_id,
        cd.department_id,
        d.name AS department_name,
        d.short_name AS department_short_name,
        cd.custom_name,
        cd.custom_short_name,
        cd.city,
        cd.postal_code,
        cd.street,
        cd.building_number
    FROM client_departments cd
    JOIN departments d ON d.id = cd.department_id
    WHERE cd.id = ?
");
$stmt2->execute([$id]);

jsonResponse($stmt2->fetch());

