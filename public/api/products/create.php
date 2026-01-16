<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$data = json_decode(file_get_contents("php://input"), true);
$user = requireLogin($pdo);

$subcategory_id = isset($data['subcategory_id']) ? (int)$data['subcategory_id'] : 0;
$name = trim($data['name'] ?? "");
$description = trim($data['description'] ?? "");
$status = trim($data['status'] ?? "active");

// Nutritional values
$nutrition_database_id = isset($data['nutrition_database_id']) && $data['nutrition_database_id'] !== "" ? (int)$data['nutrition_database_id'] : null;
$energy_kj = isset($data['energy_kj']) && $data['energy_kj'] !== "" ? (float)$data['energy_kj'] : null;
$energy_kcal = isset($data['energy_kcal']) && $data['energy_kcal'] !== "" ? (float)$data['energy_kcal'] : null;
$energy_kj_1169 = isset($data['energy_kj_1169']) && $data['energy_kj_1169'] !== "" ? (float)$data['energy_kj_1169'] : null;
$energy_kcal_1169 = isset($data['energy_kcal_1169']) && $data['energy_kcal_1169'] !== "" ? (float)$data['energy_kcal_1169'] : null;
$water = isset($data['water']) && $data['water'] !== "" ? (float)$data['water'] : null;
$protein_animal = isset($data['protein_animal']) && $data['protein_animal'] !== "" ? (float)$data['protein_animal'] : null;
$protein_plant = isset($data['protein_plant']) && $data['protein_plant'] !== "" ? (float)$data['protein_plant'] : null;
$fat = isset($data['fat']) && $data['fat'] !== "" ? (float)$data['fat'] : null;
$saturated_fat = isset($data['saturated_fat']) && $data['saturated_fat'] !== "" ? (float)$data['saturated_fat'] : null;
$carbohydrates = isset($data['carbohydrates']) && $data['carbohydrates'] !== "" ? (float)$data['carbohydrates'] : null;
$sugars = isset($data['sugars']) && $data['sugars'] !== "" ? (float)$data['sugars'] : null;
$fiber = isset($data['fiber']) && $data['fiber'] !== "" ? (float)$data['fiber'] : null;
$sodium = isset($data['sodium']) && $data['sodium'] !== "" ? (float)$data['sodium'] : null;
$salt = isset($data['salt']) && $data['salt'] !== "" ? (float)$data['salt'] : null;
$potassium = isset($data['potassium']) && $data['potassium'] !== "" ? (float)$data['potassium'] : null;
$calcium = isset($data['calcium']) && $data['calcium'] !== "" ? (float)$data['calcium'] : null;
$phosphorus = isset($data['phosphorus']) && $data['phosphorus'] !== "" ? (float)$data['phosphorus'] : null;
$magnesium = isset($data['magnesium']) && $data['magnesium'] !== "" ? (float)$data['magnesium'] : null;
$iron = isset($data['iron']) && $data['iron'] !== "" ? (float)$data['iron'] : null;
$zinc = isset($data['zinc']) && $data['zinc'] !== "" ? (float)$data['zinc'] : null;
$vitamin_a = isset($data['vitamin_a']) && $data['vitamin_a'] !== "" ? (float)$data['vitamin_a'] : null;
$vitamin_d = isset($data['vitamin_d']) && $data['vitamin_d'] !== "" ? (float)$data['vitamin_d'] : null;
$vitamin_e = isset($data['vitamin_e']) && $data['vitamin_e'] !== "" ? (float)$data['vitamin_e'] : null;
$vitamin_c = isset($data['vitamin_c']) && $data['vitamin_c'] !== "" ? (float)$data['vitamin_c'] : null;
$vitamin_b1 = isset($data['vitamin_b1']) && $data['vitamin_b1'] !== "" ? (float)$data['vitamin_b1'] : null;
$vitamin_b2 = isset($data['vitamin_b2']) && $data['vitamin_b2'] !== "" ? (float)$data['vitamin_b2'] : null;
$vitamin_b6 = isset($data['vitamin_b6']) && $data['vitamin_b6'] !== "" ? (float)$data['vitamin_b6'] : null;
$vitamin_b12 = isset($data['vitamin_b12']) && $data['vitamin_b12'] !== "" ? (float)$data['vitamin_b12'] : null;
$folate = isset($data['folate']) && $data['folate'] !== "" ? (float)$data['folate'] : null;
$niacin = isset($data['niacin']) && $data['niacin'] !== "" ? (float)$data['niacin'] : null;
$cholesterol = isset($data['cholesterol']) && $data['cholesterol'] !== "" ? (float)$data['cholesterol'] : null;

$allergens = $data['allergens'] ?? [];

if ($name === "" || $subcategory_id <= 0) {
    jsonResponse(null, false, "MISSING_REQUIRED_FIELDS", 422);
}

try {
    $pdo->beginTransaction();

    $stmt = $pdo->prepare("
        INSERT INTO products (
            subcategory_id, name, description, status,
            nutrition_database_id, energy_kj, energy_kcal, energy_kj_1169, energy_kcal_1169,
            water, protein_animal, protein_plant, fat, saturated_fat, carbohydrates, sugars, fiber,
            sodium, salt, potassium, calcium, phosphorus, magnesium, iron, zinc,
            vitamin_a, vitamin_d, vitamin_e, vitamin_c, vitamin_b1, vitamin_b2, vitamin_b6, vitamin_b12,
            folate, niacin, cholesterol
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([
        $subcategory_id, $name, $description, $status,
        $nutrition_database_id, $energy_kj, $energy_kcal, $energy_kj_1169, $energy_kcal_1169,
        $water, $protein_animal, $protein_plant, $fat, $saturated_fat, $carbohydrates, $sugars, $fiber,
        $sodium, $salt, $potassium, $calcium, $phosphorus, $magnesium, $iron, $zinc,
        $vitamin_a, $vitamin_d, $vitamin_e, $vitamin_c, $vitamin_b1, $vitamin_b2, $vitamin_b6, $vitamin_b12,
        $folate, $niacin, $cholesterol
    ]);

    $productId = (int)$pdo->lastInsertId();

    // Insert allergens
    if (!empty($allergens)) {
        $allergenStmt = $pdo->prepare("INSERT INTO product_allergens (product_id, allergen_id) VALUES (?, ?)");
        foreach ($allergens as $allergenId) {
            $allergenStmt->execute([$productId, $allergenId]);
        }
    }

    $pdo->commit();

    // Audit log
    $newRecord = getRecordForAudit($pdo, 'products', $productId);
    logAudit($pdo, 'products', $productId, 'insert', null, $newRecord, $user['id'] ?? null);

    jsonResponse([
        "id" => $productId,
        "created" => true
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    jsonResponse(null, false, "DATABASE_ERROR: " . $e->getMessage(), 500);
}
