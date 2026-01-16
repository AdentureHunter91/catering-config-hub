<?php
require_once __DIR__ . '/../../bootstrap.php';

$pdo  = getPDO();
$user = requireLogin($pdo);
$data = json_decode(file_get_contents("php://input"), true);

$client_id    = (int)($data["client_id"] ?? 0);
$meal_type_id = (int)($data["meal_type_id"] ?? 0);

if (!$client_id || !$meal_type_id) {
    jsonResponse(null, false, "Invalid parameters", 422);
}

// Pobierz aktualny rekord
$stmt = $pdo->prepare("
    SELECT *
    FROM client_meal_types
    WHERE client_id = ? AND meal_type_id = ?
");
$stmt->execute([$client_id, $meal_type_id]);
$current = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$current) {
    // jeśli brak rekordu → insert z wartościami które przyszły
    $stmt = $pdo->prepare("
        INSERT INTO client_meal_types
            (client_id, meal_type_id, custom_name, custom_short_name, custom_sort_order, is_active)
        VALUES (?, ?, ?, ?, ?, ?)
    ");

    $stmt->execute([
        $client_id,
        $meal_type_id,
        $data["custom_name"]       ?? null,
        $data["custom_short_name"] ?? null,
        $data["custom_sort_order"] === "" ? null : ($data["custom_sort_order"] ?? null),
        $data["is_active"]         ?? 1
    ]);

    $newId = (int)$pdo->lastInsertId();
    
    // Audit log for insert
    $newRecord = getRecordForAudit($pdo, 'client_meal_types', $newId);
    logAudit($pdo, 'client_meal_types', $newId, 'insert', null, $newRecord, $user['id'] ?? null);

    jsonResponse(true);
}

// Get old record for audit
$oldRecord = getRecordForAudit($pdo, 'client_meal_types', $current["id"]);

// MERGE – zmieniamy tylko to, co przyszło z frontu
$custom_name       = array_key_exists("custom_name", $data)
    ? ($data["custom_name"] ?: null)
    : $current["custom_name"];

$custom_short_name = array_key_exists("custom_short_name", $data)
    ? ($data["custom_short_name"] ?: null)
    : $current["custom_short_name"];

$custom_sort_order = array_key_exists("custom_sort_order", $data)
    ? ($data["custom_sort_order"] === "" ? null : $data["custom_sort_order"])
    : $current["custom_sort_order"];

$is_active         = array_key_exists("is_active", $data)
    ? (int)$data["is_active"]
    : $current["is_active"];

// UPDATE
$stmt = $pdo->prepare("
    UPDATE client_meal_types
    SET
        custom_name = ?,
        custom_short_name = ?,
        custom_sort_order = ?,
        is_active = ?
    WHERE id = ?
");

$stmt->execute([
    $custom_name,
    $custom_short_name,
    $custom_sort_order,
    $is_active,
    $current["id"]
]);

// Audit log for update
$newRecord = getRecordForAudit($pdo, 'client_meal_types', $current["id"]);
logAudit($pdo, 'client_meal_types', $current["id"], 'update', $oldRecord, $newRecord, $user['id'] ?? null);

jsonResponse(true);
