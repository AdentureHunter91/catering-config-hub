<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);

$data = json_decode(file_get_contents("php://input"), true);

$id = intval($data["id"] ?? 0);
$name = trim($data["name"] ?? "");
$short = trim($data["short_name"] ?? "");
$desc = trim($data["description"] ?? "");

if ($name === "") jsonError("Diet name is required");

if ($id > 0) {
    // Get old record for audit
    $oldRecord = getRecordForAudit($pdo, 'diets', $id);

    $stmt = $pdo->prepare("
        UPDATE diets
        SET name = ?, short_name = ?, description = ?
        WHERE id = ?
    ");
    $stmt->execute([$name, $short, $desc, $id]);

    // Audit log
    $newRecord = getRecordForAudit($pdo, 'diets', $id);
    logAudit($pdo, 'diets', $id, 'update', $oldRecord, $newRecord, $user['id'] ?? null);

    jsonResponse(["updated" => true, "id" => $id]);
}

$stmt = $pdo->prepare("
    INSERT INTO diets (name, short_name, description)
    VALUES (?, ?, ?)
");
$stmt->execute([$name, $short, $desc]);

$newId = (int)$pdo->lastInsertId();

// Audit log
$newRecord = getRecordForAudit($pdo, 'diets', $newId);
logAudit($pdo, 'diets', $newId, 'insert', null, $newRecord, $user['id'] ?? null);

jsonResponse(["created" => true, "id" => $newId]);
