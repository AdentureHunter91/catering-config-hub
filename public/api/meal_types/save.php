<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);

$data = json_decode(file_get_contents("php://input"), true);

$id          = intval($data["id"] ?? 0);
$name        = trim($data["name"] ?? "");
$short       = trim($data["short_name"] ?? "");
$sort        = intval($data["sort_order"] ?? 0);
$desc        = trim($data["description"] ?? "");

if ($name === "") jsonError("Name is required");

if ($id > 0) {
    // Get old record for audit
    $oldRecord = getRecordForAudit($pdo, 'meal_types', $id);

    // UPDATE
    $stmt = $pdo->prepare("
        UPDATE meal_types
        SET name = ?, short_name = ?, sort_order = ?, description = ?
        WHERE id = ?
    ");
    $stmt->execute([$name, $short, $sort, $desc, $id]);

    // Audit log
    $newRecord = getRecordForAudit($pdo, 'meal_types', $id);
    logAudit($pdo, 'meal_types', $id, 'update', $oldRecord, $newRecord, $user['id'] ?? null);

    jsonResponse(["updated" => true, "id" => $id]);
}

// INSERT
$stmt = $pdo->prepare("
    INSERT INTO meal_types (name, short_name, sort_order, description)
    VALUES (?, ?, ?, ?)
");
$stmt->execute([$name, $short, $sort, $desc]);

$newId = (int)$pdo->lastInsertId();

// Audit log
$newRecord = getRecordForAudit($pdo, 'meal_types', $newId);
logAudit($pdo, 'meal_types', $newId, 'insert', null, $newRecord, $user['id'] ?? null);

jsonResponse(["created" => true, "id" => $newId]);
