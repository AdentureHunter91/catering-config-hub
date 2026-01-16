<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;

if ($id <= 0) {
    jsonResponse(null, false, "INVALID_ID", 400);
}

// Get old record for audit
$oldRecord = getRecordForAudit($pdo, 'client_diets', $id);

$stmt = $pdo->prepare("DELETE FROM client_diets WHERE id = ?");
$stmt->execute([$id]);

// Audit log
logAudit($pdo, 'client_diets', $id, 'delete', $oldRecord, null, $user['id'] ?? null);

jsonResponse(true);
