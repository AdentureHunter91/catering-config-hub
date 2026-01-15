<?php
declare(strict_types=1);
error_reporting(E_ALL);
ini_set("display_errors", "0");

require_once __DIR__ . "/../bootstrap.php";
header('Cache-Control: no-store');

try {
    $search = isset($_GET['search']) ? trim((string)$_GET['search']) : '';
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $limit = max(1, min($limit, 2000));

    $sql = "SELECT id, code, name_pl, name_en, energy_kj, energy_kcal, energy_kj_1169, energy_kcal_1169, 
            water, protein_total, protein_animal, protein_plant, protein_1169, fat, saturated_fat, 
            carbohydrates_total, carbohydrates_available, sugars, fiber, sodium, salt, potassium, calcium, phosphorus, 
            magnesium, iron, zinc, copper, manganese, iodine, vitamin_a, retinol, beta_carotene, 
            vitamin_d, vitamin_e, vitamin_c, vitamin_b1, vitamin_b2, vitamin_b6, vitamin_b12, folate, niacin, cholesterol, ash, waste_percent
            FROM nutrition_database";

    $params = [];

    if ($search !== '') {
        $sql .= " WHERE name_pl LIKE :q OR name_en LIKE :q OR code LIKE :q";
        $params['q'] = "%" . $search . "%";
    }

    // With native prepares (ATTR_EMULATE_PREPARES=false) LIMIT placeholders can be finicky on some hosts,
    // so we interpolate a validated integer.
    $sql .= " ORDER BY name_pl ASC LIMIT {$limit}";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $data = $stmt->fetchAll();

    jsonResponse($data);
} catch (Throwable $e) {
    jsonResponse(null, false, $e->getMessage(), 500);
}
