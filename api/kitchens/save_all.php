<?php
declare(strict_types=1);

require_once $_SERVER['DOCUMENT_ROOT'] . "/Config/api/bootstrap.php";

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

if ($id > 0) {
    // UPDATE
    $sql = "UPDATE kitchens SET name=?, city=?, address=?, nip=?, updated_at=NOW() WHERE id=?";
    $stmt = $db->prepare($sql);
    $stmt->execute([$name, $city, $address, $nip, $id]);
} else {
    // INSERT
    $sql = "INSERT INTO kitchens (name, city, address, nip) VALUES (?, ?, ?, ?)";
    $stmt = $db->prepare($sql);
    $stmt->execute([$name, $city, $address, $nip]);
    $id = intval($db->lastInsertId());
}


/* --------------------------
   2. Zapis kitchen_settings
--------------------------- */

$settings = $data["settings"] ?? [];
$exists = $db->prepare("SELECT id FROM kitchen_settings WHERE kitchen_id=?");
$exists->execute([$id]);
$hasSettings = $exists->fetchColumn();

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

if ($hasSettings) {
    $stmt = $db->prepare($sqlUpdateSettings);
    $stmt->execute([...$params, $id]);
} else {
    $stmt = $db->prepare($sqlInsertSettings);
    $stmt->execute([$id, ...$params]);
}


/* --------------------------
   3. Zapis kitchen_quality_settings
--------------------------- */

$quality = $data["quality"] ?? [];
$exists = $db->prepare("SELECT id FROM kitchen_quality_settings WHERE kitchen_id=?");
$exists->execute([$id]);
$hasQuality = $exists->fetchColumn();

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

if ($hasQuality) {
    $stmt = $db->prepare($sqlUpdateQ);
    $stmt->execute([...$paramsQ, $id]);
} else {
    $stmt = $db->prepare($sqlInsertQ);
    $stmt->execute([$id, ...$paramsQ]);
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

$stmt = $db->prepare($sql);

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

    $stmt->execute([
        $id,
        $year,
        $month,
        $t["target_meals_per_rbh"] ?? null,
        $t["target_rbh"] ?? null,
        $t["target_daily_meals"] ?? null
    ]);
}

jsonResponse([
    "id" => $id
], true);
