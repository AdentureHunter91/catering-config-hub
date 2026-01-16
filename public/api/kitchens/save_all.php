<?php
declare(strict_types=1);

require_once __DIR__ . "/../bootstrap.php";

$pdo = getPDO();
$user = requireLogin($pdo);

$data = json_decode(file_get_contents("php://input"), true);

if (!$data) {
    jsonResponse(null, false, "Invalid JSON", 400);
}

/* --------------------------
   1. Zapis podstawowych danych kuchni
--------------------------- */

$kitchen = $data["kitchen"] ?? null;
if (!$kitchen) {
    jsonResponse(null, false, "Missing kitchen data", 400);
}

$id = intval($kitchen["id"] ?? 0);
$name = trim($kitchen["name"] ?? "");
$city = trim($kitchen["city"] ?? "");
$address = trim($kitchen["address"] ?? "");
$nip = trim($kitchen["nip"] ?? "");

if ($name === "" || $city === "" || $address === "" || $nip === "") {
    jsonResponse(null, false, "Missing kitchen fields", 400);
}

$isUpdate = $id > 0;
$oldKitchenRecord = null;

if ($isUpdate) {
    $oldKitchenRecord = getRecordForAudit($pdo, 'kitchens', $id);
    
    // UPDATE
    $sql = "UPDATE kitchens SET name=?, city=?, address=?, nip=?, updated_at=NOW() WHERE id=?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$name, $city, $address, $nip, $id]);
    
    $newKitchenRecord = getRecordForAudit($pdo, 'kitchens', $id);
    logAudit($pdo, 'kitchens', $id, 'update', $oldKitchenRecord, $newKitchenRecord, $user['id'] ?? null);
} else {
    // INSERT
    $sql = "INSERT INTO kitchens (name, city, address, nip) VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$name, $city, $address, $nip]);
    $id = intval($pdo->lastInsertId());
    
    $newKitchenRecord = getRecordForAudit($pdo, 'kitchens', $id);
    logAudit($pdo, 'kitchens', $id, 'insert', null, $newKitchenRecord, $user['id'] ?? null);
}


/* --------------------------
   2. Zapis kitchen_settings
--------------------------- */

$settings = $data["settings"] ?? [];
$exists = $pdo->prepare("SELECT id FROM kitchen_settings WHERE kitchen_id=?");
$exists->execute([$id]);
$settingsId = $exists->fetchColumn();

$sqlInsertSettings = "
    INSERT INTO kitchen_settings (
        kitchen_id, located_in_hospital, max_daily_patient_days, max_daily_meals,
        number_of_shifts, planned_employees, work_start, work_end, works_weekends, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
";

$sqlUpdateSettings = "
    UPDATE kitchen_settings SET
        located_in_hospital=?, max_daily_patient_days=?, max_daily_meals=?,
        number_of_shifts=?, planned_employees=?, work_start=?, work_end=?,
        works_weekends=?, notes=?, updated_at=NOW()
    WHERE kitchen_id=?
";

$params = [
    $settings["located_in_hospital"] ?? 0,
    $settings["max_daily_patient_days"] ?? null,
    $settings["max_daily_meals"] ?? null,
    $settings["number_of_shifts"] ?? 1,
    $settings["planned_employees"] ?? null,
    $settings["work_start"] ?? null,
    $settings["work_end"] ?? null,
    $settings["works_weekends"] ?? 0,
    $settings["notes"] ?? null
];

if ($settingsId) {
    $oldSettingsRecord = getRecordForAudit($pdo, 'kitchen_settings', (int)$settingsId);
    
    $stmt = $pdo->prepare($sqlUpdateSettings);
    $stmt->execute([...$params, $id]);
    
    $newSettingsRecord = getRecordForAudit($pdo, 'kitchen_settings', (int)$settingsId);
    logAudit($pdo, 'kitchen_settings', (int)$settingsId, 'update', $oldSettingsRecord, $newSettingsRecord, $user['id'] ?? null);
} else {
    $stmt = $pdo->prepare($sqlInsertSettings);
    $stmt->execute([$id, ...$params]);
    
    $newSettingsId = (int)$pdo->lastInsertId();
    $newSettingsRecord = getRecordForAudit($pdo, 'kitchen_settings', $newSettingsId);
    logAudit($pdo, 'kitchen_settings', $newSettingsId, 'insert', null, $newSettingsRecord, $user['id'] ?? null);
}


/* --------------------------
   3. Zapis kitchen_quality_settings
--------------------------- */

$quality = $data["quality"] ?? [];
$exists = $pdo->prepare("SELECT id FROM kitchen_quality_settings WHERE kitchen_id=?");
$exists->execute([$id]);
$qualityId = $exists->fetchColumn();

$sqlInsertQ = "
    INSERT INTO kitchen_quality_settings (
        kitchen_id, min_in_process_checks, min_final_checks, audit_5s_frequency_days
    ) VALUES (?, ?, ?, ?)
";

$sqlUpdateQ = "
    UPDATE kitchen_quality_settings SET
        min_in_process_checks=?, min_final_checks=?, audit_5s_frequency_days=?, updated_at=NOW()
    WHERE kitchen_id=?
";

$paramsQ = [
    $quality["min_in_process_checks"] ?? 0,
    $quality["min_final_checks"] ?? 0,
    $quality["audit_5s_frequency_days"] ?? 30
];

if ($qualityId) {
    $oldQualityRecord = getRecordForAudit($pdo, 'kitchen_quality_settings', (int)$qualityId);
    
    $stmt = $pdo->prepare($sqlUpdateQ);
    $stmt->execute([...$paramsQ, $id]);
    
    $newQualityRecord = getRecordForAudit($pdo, 'kitchen_quality_settings', (int)$qualityId);
    logAudit($pdo, 'kitchen_quality_settings', (int)$qualityId, 'update', $oldQualityRecord, $newQualityRecord, $user['id'] ?? null);
} else {
    $stmt = $pdo->prepare($sqlInsertQ);
    $stmt->execute([$id, ...$paramsQ]);
    
    $newQualityId = (int)$pdo->lastInsertId();
    $newQualityRecord = getRecordForAudit($pdo, 'kitchen_quality_settings', $newQualityId);
    logAudit($pdo, 'kitchen_quality_settings', $newQualityId, 'insert', null, $newQualityRecord, $user['id'] ?? null);
}

/* --------------------------
   4. Zapis kitchen_monthly_targets
--------------------------- */

$targets = $data["targets"] ?? [];

$sql = "
    INSERT INTO kitchen_monthly_targets
        (kitchen_id, year, month, target_meals_per_rbh, target_rbh, target_daily_meals)
    VALUES (?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        target_meals_per_rbh = VALUES(target_meals_per_rbh),
        target_rbh = VALUES(target_rbh),
        target_daily_meals = VALUES(target_daily_meals)
";

$stmt = $pdo->prepare($sql);

foreach ($targets as $t) {

    $year  = intval($t["year"]);
    $month = intval($t["month"]);

    // 🌟 Walidacja miesiąca
    if ($month < 1 || $month > 12) {
        jsonResponse(null, false, "Invalid month value: $month. Allowed range is 1–12.", 400);
    }

    // 🌟 Walidacja roku (opcjonalnie)
    if ($year < 2000 || $year > 2100) {
        jsonResponse(null, false, "Invalid year value: $year.", 400);
    }

    // Check if target exists
    $checkStmt = $pdo->prepare("SELECT id FROM kitchen_monthly_targets WHERE kitchen_id = ? AND year = ? AND month = ?");
    $checkStmt->execute([$id, $year, $month]);
    $targetId = $checkStmt->fetchColumn();
    
    $oldTargetRecord = $targetId ? getRecordForAudit($pdo, 'kitchen_monthly_targets', (int)$targetId) : null;

    $stmt->execute([
        $id,
        $year,
        $month,
        $t["target_meals_per_rbh"] ?? null,
        $t["target_rbh"] ?? null,
        $t["target_daily_meals"] ?? null
    ]);
    
    if ($targetId) {
        $newTargetRecord = getRecordForAudit($pdo, 'kitchen_monthly_targets', (int)$targetId);
        logAudit($pdo, 'kitchen_monthly_targets', (int)$targetId, 'update', $oldTargetRecord, $newTargetRecord, $user['id'] ?? null);
    } else {
        $newTargetId = (int)$pdo->lastInsertId();
        if ($newTargetId > 0) {
            $newTargetRecord = getRecordForAudit($pdo, 'kitchen_monthly_targets', $newTargetId);
            logAudit($pdo, 'kitchen_monthly_targets', $newTargetId, 'insert', null, $newTargetRecord, $user['id'] ?? null);
        }
    }
}

jsonResponse([
    "id" => $id
], true);
