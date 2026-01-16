<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$authUser = requireLogin($pdo);

if (!empty($authUser['id'])) {
    $setUser = $pdo->prepare("SET @current_user_id = :uid");
    $setUser->execute(['uid' => (int)$authUser['id']]);
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$id = (int)($data['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(null, false, 'INVALID_ID', 400);
}

// Get old record for audit
$oldRecord = getRecordForAudit($pdo, 'client_contacts', $id);

$stmt = $pdo->prepare("DELETE FROM client_contacts WHERE id = :id");
$stmt->execute(['id' => $id]);

// Audit log
logAudit($pdo, 'client_contacts', $id, 'delete', $oldRecord, null, $authUser['id'] ?? null);

jsonResponse(['deleted' => true], true, null);
