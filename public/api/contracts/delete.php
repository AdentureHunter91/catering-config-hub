<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);

$id = (int)($_POST["id"] ?? 0);

if (!$id) {
    jsonResponse(null, false, "Missing ID", 400);
}

// Get old record for audit
$oldRecord = getRecordForAudit($pdo, 'contracts', $id);

$stmt = $pdo->prepare("DELETE FROM contracts WHERE id=?");
$stmt->execute([$id]);

// Audit log
logAudit($pdo, 'contracts', $id, 'delete', $oldRecord, null, $user['id'] ?? null);

jsonResponse(["deleted" => true]);