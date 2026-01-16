<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);

$input = json_decode(file_get_contents("php://input"), true);
$id = intval($input["id"] ?? 0);

if ($id <= 0) {
    jsonError("Invalid ID");
}

// Get old record for audit
$oldRecord = getRecordForAudit($pdo, 'departments', $id);

$stmt = $pdo->prepare("DELETE FROM departments WHERE id = ?");
$stmt->execute([$id]);

// Audit log
logAudit($pdo, 'departments', $id, 'delete', $oldRecord, null, $user['id'] ?? null);

jsonResponse([
    "deleted" => true,
    "id" => $id
]);
