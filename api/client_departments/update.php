<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$data = json_decode(file_get_contents("php://input"), true);

$id           = isset($data['id']) ? (int)$data['id'] : 0;
$departmentId = isset($data['department_id']) ? (int)$data['department_id'] : 0;
$customName   = trim($data['custom_name'] ?? '');
$customShort  = trim($data['custom_short_name'] ?? '');

if ($id <= 0 || $departmentId <= 0) {
    jsonResponse(null, false, "INVALID_DATA", 422);
}

// sprawdź, jaki client_id ma ten rekord
$stmt = $pdo->prepare("SELECT client_id FROM client_departments WHERE id = ?");
$stmt->execute([$id]);
$clientId = $stmt->fetchColumn();

if (!$clientId) {
    jsonResponse(null, false, "NOT_FOUND", 404);
}

// unikalność: czy zmiana department_id nie powoduje duplikatu
$check = $pdo->prepare("
    SELECT id FROM client_departments 
    WHERE client_id = ? AND department_id = ? AND id <> ?
");
$check->execute([$clientId, $departmentId, $id]);
$existing = $check->fetchColumn();

if ($existing) {
    jsonResponse(null, false, "DUPLICATE_DEPARTMENT", 422);
}

$upd = $pdo->prepare("
    UPDATE client_departments
    SET department_id = ?, custom_name = ?, custom_short_name = ?
    WHERE id = ?
");
$upd->execute([
    $departmentId,
    $customName ?: null,
    $customShort ?: null,
    $id
]);

jsonResponse(true);
