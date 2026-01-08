<?php
error_reporting(E_ALL);
ini_set("display_errors", 0);

require_once __DIR__ . "/../../bootstrap.php";
require_once __DIR__ . "/../../db.php";

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    jsonResponse(null, false, "Invalid JSON", 400);
}

$contractId = intval($data['contract_id'] ?? 0);
$clientMealTypeId = intval($data['client_meal_type_id'] ?? 0);

if ($contractId <= 0 || $clientMealTypeId <= 0) {
    jsonResponse(null, false, "Invalid parameters", 400);
}

$cutoff = $data['cutoff_time'] ?? "00:00";
if ($cutoff === null || $cutoff === "") {
    $cutoff = "00:00";
}

$offset = $data['cutoff_days_offset'] ?? 0;
if ($offset === null || $offset === "") {
    $offset = 0;
}

$isActive = intval($data['is_active'] ?? 1);

$copyFrom = $data['copy_from_client_meal_type_id'] ?? null;
if ($copyFrom === "" || $copyFrom === null) {
    $copyFrom = null;
} else {
    $copyFrom = intval($copyFrom);
}

$db = getPDO();

// sprawdzamy czy istnieje
$stmt = $db->prepare("
    SELECT id FROM contract_meal_type_settings
    WHERE contract_id = ? AND client_meal_type_id = ?
");
$stmt->execute([$contractId, $clientMealTypeId]);
$existingId = $stmt->fetchColumn();

if ($existingId) {
    // UPDATE
    $stmt = $db->prepare("
        UPDATE contract_meal_type_settings
        SET cutoff_time = ?, cutoff_days_offset = ?, is_active = ?,
            copy_from_client_meal_type_id = ?, updated_at = NOW()
        WHERE id = ?
    ");
    $stmt->execute([
        $cutoff, $offset, $isActive, $copyFrom, $existingId
    ]);
} else {
    // INSERT
    $stmt = $db->prepare("
        INSERT INTO contract_meal_type_settings
            (contract_id, client_meal_type_id, cutoff_time, cutoff_days_offset, is_active, copy_from_client_meal_type_id)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $contractId, $clientMealTypeId, $cutoff, $offset, $isActive, $copyFrom
    ]);
}

jsonResponse(["updated" => true], true);
