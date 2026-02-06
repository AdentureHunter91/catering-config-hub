<?php
declare(strict_types=1);

require_once __DIR__ . "/../../bootstrap.php";

$pdo = getPDO();
$user = requireLogin($pdo);

$id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
if ($id <= 0) {
    jsonResponse(null, false, "INVALID_ID", 400);
}

$oldRecord = getRecordForAudit($pdo, 'contract_price_rules', $id);

$stmt = $pdo->prepare("DELETE FROM contract_price_rules WHERE id = ?");
$stmt->execute([$id]);

logAudit($pdo, 'contract_price_rules', $id, 'delete', $oldRecord, null, $user['id'] ?? null);

jsonResponse(true);
