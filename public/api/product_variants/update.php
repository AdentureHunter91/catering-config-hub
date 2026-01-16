<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$data = json_decode(file_get_contents("php://input"), true);
$user = requireLogin($pdo);

$id            = isset($data['id']) ? (int)$data['id'] : 0;
$product_id    = isset($data['product_id']) ? (int)$data['product_id'] : null;
$ean           = trim($data['ean'] ?? "");
$name          = trim($data['name'] ?? "");
$content       = trim($data['content'] ?? "");
$unit          = trim($data['unit'] ?? "");
$sku           = trim($data['sku'] ?? "");
$status        = trim($data['status'] ?? "active");
$brands        = trim($data['brands'] ?? "");
$categories    = trim($data['categories'] ?? "");
$image_url     = trim($data['image_url'] ?? "");

// Nutritional values
$nutrition_database_id = isset($data['nutrition_database_id']) ? (int)$data['nutrition_database_id'] : null;
$energy_kj       = isset($data['energy_kj']) && $data['energy_kj'] !== "" ? (float)$data['energy_kj'] : null;
$energy_kcal     = isset($data['energy_kcal']) && $data['energy_kcal'] !== "" ? (float)$data['energy_kcal'] : null;
$energy_kj_1169  = isset($data['energy_kj_1169']) && $data['energy_kj_1169'] !== "" ? (float)$data['energy_kj_1169'] : null;
$energy_kcal_1169 = isset($data['energy_kcal_1169']) && $data['energy_kcal_1169'] !== "" ? (float)$data['energy_kcal_1169'] : null;
$water           = isset($data['water']) && $data['water'] !== "" ? (float)$data['water'] : null;
$protein_animal  = isset($data['protein_animal']) && $data['protein_animal'] !== "" ? (float)$data['protein_animal'] : null;
$protein_plant   = isset($data['protein_plant']) && $data['protein_plant'] !== "" ? (float)$data['protein_plant'] : null;
$fat             = isset($data['fat']) && $data['fat'] !== "" ? (float)$data['fat'] : null;
$carbohydrates   = isset($data['carbohydrates']) && $data['carbohydrates'] !== "" ? (float)$data['carbohydrates'] : null;
$fiber           = isset($data['fiber']) && $data['fiber'] !== "" ? (float)$data['fiber'] : null;
$sodium          = isset($data['sodium']) && $data['sodium'] !== "" ? (float)$data['sodium'] : null;
$salt            = isset($data['salt']) && $data['salt'] !== "" ? (float)$data['salt'] : null;
$potassium       = isset($data['potassium']) && $data['potassium'] !== "" ? (float)$data['potassium'] : null;
$calcium         = isset($data['calcium']) && $data['calcium'] !== "" ? (float)$data['calcium'] : null;
$phosphorus      = isset($data['phosphorus']) && $data['phosphorus'] !== "" ? (float)$data['phosphorus'] : null;
$magnesium       = isset($data['magnesium']) && $data['magnesium'] !== "" ? (float)$data['magnesium'] : null;
$iron            = isset($data['iron']) && $data['iron'] !== "" ? (float)$data['iron'] : null;
$vitamin_d       = isset($data['vitamin_d']) && $data['vitamin_d'] !== "" ? (float)$data['vitamin_d'] : null;
$vitamin_c       = isset($data['vitamin_c']) && $data['vitamin_c'] !== "" ? (float)$data['vitamin_c'] : null;
$cholesterol     = isset($data['cholesterol']) && $data['cholesterol'] !== "" ? (float)$data['cholesterol'] : null;

$allergens = $data['allergens'] ?? [];

if ($id <= 0) {
    jsonResponse(null, false, "MISSING_ID", 422);
}

// Validate required fields
if ($ean === "" || $name === "" || $content === "" || $unit === "" || $sku === "") {
    jsonResponse(null, false, "MISSING_REQUIRED_FIELDS", 422);
}

// Check for duplicate EAN (excluding current record)
$checkStmt = $pdo->prepare("SELECT id FROM product_variants WHERE ean = ? AND id != ?");
$checkStmt->execute([$ean, $id]);
if ($checkStmt->fetch()) {
    jsonResponse(null, false, "EAN_ALREADY_EXISTS", 409);
}

// Get old record for audit
$oldRecord = getRecordForAudit($pdo, 'product_variants', $id);

try {
    $pdo->beginTransaction();

    // UPDATE variant
    $stmt = $pdo->prepare("
        UPDATE product_variants SET
            product_id = ?, ean = ?, name = ?, content = ?, unit = ?, sku = ?, status = ?,
            brands = ?, categories = ?, image_url = ?,
            nutrition_database_id = ?, energy_kj = ?, energy_kcal = ?, energy_kj_1169 = ?, energy_kcal_1169 = ?,
            water = ?, protein_animal = ?, protein_plant = ?, fat = ?, carbohydrates = ?, fiber = ?,
            sodium = ?, salt = ?, potassium = ?, calcium = ?, phosphorus = ?, magnesium = ?, iron = ?,
            vitamin_d = ?, vitamin_c = ?, cholesterol = ?
        WHERE id = ?
    ");
    $stmt->execute([
        $product_id, $ean, $name, $content, $unit, $sku, $status,
        $brands, $categories, $image_url,
        $nutrition_database_id, $energy_kj, $energy_kcal, $energy_kj_1169, $energy_kcal_1169,
        $water, $protein_animal, $protein_plant, $fat, $carbohydrates, $fiber,
        $sodium, $salt, $potassium, $calcium, $phosphorus, $magnesium, $iron,
        $vitamin_d, $vitamin_c, $cholesterol,
        $id
    ]);

    // Delete existing allergens and insert new ones
    $deleteStmt = $pdo->prepare("DELETE FROM product_variant_allergens WHERE product_variant_id = ?");
    $deleteStmt->execute([$id]);

    if (!empty($allergens)) {
        $allergenStmt = $pdo->prepare("INSERT INTO product_variant_allergens (product_variant_id, allergen_id) VALUES (?, ?)");
        foreach ($allergens as $allergenId) {
            $allergenStmt->execute([$id, $allergenId]);
        }
    }

    $pdo->commit();

    // Audit log
    $newRecord = getRecordForAudit($pdo, 'product_variants', $id);
    logAudit($pdo, 'product_variants', $id, 'update', $oldRecord, $newRecord, $user['id'] ?? null);

    jsonResponse([
        "id" => $id,
        "updated" => true
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    jsonResponse(null, false, "DB_ERROR: " . $e->getMessage(), 500);
}
