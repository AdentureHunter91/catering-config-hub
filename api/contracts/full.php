<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

//
// 1) Podstawowe dane kontraktu
//
$stmt = $pdo->prepare("
    SELECT 
    c.*,
    cl.short_name AS client_short_name,
    cl.total_beds AS client_total_beds
FROM contracts c
JOIN clients cl ON cl.id = c.client_id
WHERE c.id = ?
");
$stmt->execute([$id]);
$contract = $stmt->fetch();

if (!$contract) {
    jsonResponse(null, false, "NOT_FOUND", 404);
}

$clientId = (int)$contract['client_id'];

//
// 2) Okresy obsługi kuchni
//
$stmt = $pdo->prepare("
    SELECT ckp.*, k.name AS kitchen_name
    FROM contract_kitchen_periods ckp
    JOIN kitchens k ON k.id = ckp.kitchen_id
    WHERE ckp.contract_id = ?
    ORDER BY ckp.start_date ASC
");
$stmt->execute([$id]);
$kitchenPeriods = $stmt->fetchAll();

//
// 3) Oddziały klienta
//
$stmt = $pdo->prepare("
    SELECT cd.*, d.name AS global_name, d.short_name AS global_short_name
    FROM client_departments cd
    JOIN departments d ON d.id = cd.department_id
    WHERE cd.client_id = ?
    ORDER BY d.name ASC
");
$stmt->execute([$clientId]);
$departments = $stmt->fetchAll();

//
// 4) Diety klienta
//
$stmt = $pdo->prepare("
    SELECT cdi.*, di.name AS global_name, di.short_name AS global_short_name
    FROM client_diets cdi
    JOIN diets di ON di.id = cdi.diet_id
    WHERE cdi.client_id = ?
    ORDER BY di.name ASC
");
$stmt->execute([$clientId]);
$diets = $stmt->fetchAll();

//
// 5) Posiłki klienta (domyślne aktywności)
//
$stmt = $pdo->prepare("
    SELECT cmt.*, mt.name AS global_name, mt.short_name AS global_short_name, mt.sort_order
    FROM client_meal_types cmt
    JOIN meal_types mt ON mt.id = cmt.meal_type_id
    WHERE cmt.client_id = ?
    ORDER BY mt.sort_order ASC
");
$stmt->execute([$clientId]);
$mealTypes = $stmt->fetchAll();

//
// 6) Specyficzne ustawienia kontraktu dla posiłków
//
$stmt = $pdo->prepare("
    SELECT *
    FROM contract_meal_type_settings
    WHERE contract_id = ?
");
$stmt->execute([$id]);
$mealSettings = $stmt->fetchAll();


// ▸ Wysyłamy pełny zestaw danych
jsonResponse([
    "contract" => $contract,
    "kitchen_periods" => $kitchenPeriods,
    "departments" => $departments,
    "diets" => $diets,
    "meal_types" => $mealTypes,
    "meal_settings" => $mealSettings
]);
