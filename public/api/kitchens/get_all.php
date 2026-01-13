<?php
declare(strict_types=1);

require_once __DIR__ . "/../bootstrap.php";

$id = intval($_GET["id"] ?? 0);
if ($id <= 0) {
    jsonResponse(null, false, "Invalid kitchen id", 400);
}

/* -------------------------------------------
   1) Pobieramy główne dane kuchni
-------------------------------------------- */

$sql = "SELECT id, name, city, address, nip 
        FROM kitchens 
        WHERE id = ?";
$stmt = $db->prepare($sql);
$stmt->execute([$id]);
$kitchen = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$kitchen) {
    jsonResponse(null, false, "Kitchen not found", 404);
}

/* -------------------------------------------
   2) Pobieramy ustawienia operacyjne kitchen_settings
-------------------------------------------- */

$sql = "SELECT 
            located_in_hospital,
            max_daily_patient_days,
            max_daily_meals,
            number_of_shifts,
            planned_employees,
            work_start,
            work_end,
            works_weekends,
            notes
        FROM kitchen_settings
        WHERE kitchen_id = ?";
$stmt = $db->prepare($sql);
$stmt->execute([$id]);
$settings = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$settings) {
    // jeżeli nie ma zapisanych ustawień — zwracamy domyślne
    $settings = [
        "located_in_hospital"      => 0,
        "max_daily_patient_days"   => null,
        "max_daily_meals"          => null,
        "number_of_shifts"         => 1,
        "planned_employees"        => null,
        "work_start"               => null,
        "work_end"                 => null,
        "works_weekends"           => 0,
        "notes"                    => "",
    ];
}

/* -------------------------------------------
   3) Pobieramy jakość kitchen_quality_settings
-------------------------------------------- */

$sql = "SELECT 
            min_in_process_checks,
            min_final_checks,
            audit_5s_frequency_days
        FROM kitchen_quality_settings
        WHERE kitchen_id = ?";
$stmt = $db->prepare($sql);
$stmt->execute([$id]);
$quality = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$quality) {
    $quality = [
        "min_in_process_checks"     => 0,
        "min_final_checks"          => 0,
        "audit_5s_frequency_days"   => 30,
    ];
}

/* -------------------------------------------
   4) Pobieramy cele miesięczne kitchen_monthly_targets
-------------------------------------------- */

$sql = "SELECT 
            id,
            year,
            month,
            target_meals_per_rbh,
            target_rbh,
            target_daily_meals
        FROM kitchen_monthly_targets
        WHERE kitchen_id = ?
        ORDER BY year ASC, month ASC";
$stmt = $db->prepare($sql);
$stmt->execute([$id]);
$targets = $stmt->fetchAll(PDO::FETCH_ASSOC);

jsonResponse([
    "kitchen" => $kitchen,
    "settings" => $settings,
    "quality" => $quality,
    "targets" => $targets
], true);
