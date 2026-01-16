<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);
$data = json_decode(file_get_contents("php://input"), true);

$clientDepartmentId = isset($data['client_department_id']) ? (int)$data['client_department_id'] : 0;
$clientDietId       = isset($data['client_diet_id']) ? (int)$data['client_diet_id'] : 0;

$isDefault = isset($data['is_default']) ? (int)$data['is_default'] : 0;
$isActive  = isset($data['is_active'])  ? (int)$data['is_active']  : 1;

if ($clientDepartmentId <= 0 || $clientDietId <= 0) {
    jsonResponse(null, false, "MISSING_REQUIRED_FIELDS", 422);
}

// Sprawdź client_departments
$stmt = $pdo->prepare("
    SELECT client_id
    FROM client_departments
    WHERE id = ?
");
$stmt->execute([$clientDepartmentId]);
$deptRow = $stmt->fetch();

if (!$deptRow) {
    jsonResponse(null, false, "CLIENT_DEPARTMENT_NOT_FOUND", 404);
}

$deptClientId = (int)$deptRow['client_id'];

// Sprawdź client_diets
$stmt = $pdo->prepare("
    SELECT client_id
    FROM client_diets
    WHERE id = ?
");
$stmt->execute([$clientDietId]);
$dietRow = $stmt->fetch();

if (!$dietRow) {
    jsonResponse(null, false, "CLIENT_DIET_NOT_FOUND", 404);
}

$dietClientId = (int)$dietRow['client_id'];

if ($deptClientId !== $dietClientId) {
    jsonResponse(null, false, "CLIENT_MISMATCH", 422);
}

// Walidacja duplikatu
$stmt = $pdo->prepare("
    SELECT id
    FROM client_department_diets
    WHERE client_department_id = ? AND client_diet_id = ?
");
$stmt->execute([$clientDepartmentId, $clientDietId]);
if ($stmt->fetchColumn()) {
    jsonResponse(null, false, "DUPLICATE_DIET_FOR_DEPARTMENT", 422);
}

// Domyślna musi być aktywna
if ($isDefault === 1 && $isActive === 0) {
    $isActive = 1;
}

$ins = $pdo->prepare("
    INSERT INTO client_department_diets (client_department_id, client_diet_id, is_default, is_active)
    VALUES (?, ?, ?, ?)
");
$ins->execute([$clientDepartmentId, $clientDietId, $isDefault, $isActive]);

$id = (int)$pdo->lastInsertId();

// Audit log
$newRecord = getRecordForAudit($pdo, 'client_department_diets', $id);
logAudit($pdo, 'client_department_diets', $id, 'insert', null, $newRecord, $user['id'] ?? null);

// Zwracamy z joinami
$stmt = $pdo->prepare("
    SELECT
        cdd.id,
        cdd.client_department_id,
        cdd.client_diet_id,
        cdd.is_default,
        cdd.is_active,
        cd.client_id,
        dpt.name AS department_name,
        dpt.short_name AS department_short_name,
        d.name AS diet_name,
        d.short_name AS diet_short_name
    FROM client_department_diets cdd
    JOIN client_departments cd ON cd.id = cdd.client_department_id
    JOIN client_diets cdt ON cdt.id = cdd.client_diet_id
    JOIN departments dpt ON dpt.id = cd.department_id
    JOIN diets d ON d.id = cdt.diet_id
    WHERE cdd.id = ?
");
$stmt->execute([$id]);

jsonResponse($stmt->fetch());
