<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);

$data = json_decode(file_get_contents("php://input"), true);
$id = intval($data["id"] ?? 0);

if ($id <= 0) jsonError("Invalid ID");

// Get old record for audit
$oldRecord = getRecordForAudit($pdo, 'meal_types', $id);

$stmt = $pdo->prepare("DELETE FROM meal_types WHERE id = ?");
$stmt->execute([$id]);

// Audit log
logAudit($pdo, 'meal_types', $id, 'delete', $oldRecord, null, $user['id'] ?? null);

jsonResponse(["deleted" => true]);
