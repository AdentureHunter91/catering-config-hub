<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../db.php';

// This endpoint receives parsed XLSX data from frontend and inserts into database
// Frontend parses XLSX using 'xlsx' library and sends JSON array of records

try {
    $input = json_decode(file_get_contents("php://input"), true);
    
    if (!$input || !isset($input['records']) || !is_array($input['records'])) {
        echo json_encode(["success" => false, "error" => "No records provided"]);
        exit;
    }
    
    $records = $input['records'];
    $uploadedBy = isset($input['uploaded_by']) ? $input['uploaded_by'] : 'System';
    
    if (count($records) === 0) {
        echo json_encode(["success" => false, "error" => "Empty records array"]);
        exit;
    }
    
    $pdo->beginTransaction();
    
    // Clear existing data (full replacement strategy)
    $pdo->exec("DELETE FROM nutrition_database");
    
    // Insert new records
    $stmt = $pdo->prepare("INSERT INTO nutrition_database (
        code, name_pl, name_en, waste_percent, energy_kj, energy_kcal, energy_kj_1169, energy_kcal_1169,
        water, protein_total, protein_animal, protein_plant, protein_1169, fat, carbohydrates_total, carbohydrates_available, ash,
        sodium, salt, potassium, calcium, phosphorus, magnesium, iron, zinc, copper, manganese, iodine,
        vitamin_a, retinol, beta_carotene, vitamin_d, vitamin_e, vitamin_b1, vitamin_b2, niacin, vitamin_b6, folate, vitamin_b12, vitamin_c,
        saturated_fat, cholesterol, sugars, fiber
    ) VALUES (
        :code, :name_pl, :name_en, :waste_percent, :energy_kj, :energy_kcal, :energy_kj_1169, :energy_kcal_1169,
        :water, :protein_total, :protein_animal, :protein_plant, :protein_1169, :fat, :carbohydrates_total, :carbohydrates_available, :ash,
        :sodium, :salt, :potassium, :calcium, :phosphorus, :magnesium, :iron, :zinc, :copper, :manganese, :iodine,
        :vitamin_a, :retinol, :beta_carotene, :vitamin_d, :vitamin_e, :vitamin_b1, :vitamin_b2, :niacin, :vitamin_b6, :folate, :vitamin_b12, :vitamin_c,
        :saturated_fat, :cholesterol, :sugars, :fiber
    )");
    
    $insertedCount = 0;
    
    foreach ($records as $record) {
        $parseNum = function($val) {
            if ($val === null || $val === '' || $val === 'b.d.' || $val === '-') return null;
            return floatval(str_replace(',', '.', $val));
        };
        
        $stmt->execute([
            'code' => $record['code'] ?? null,
            'name_pl' => $record['name_pl'] ?? null,
            'name_en' => $record['name_en'] ?? null,
            'waste_percent' => $parseNum($record['waste_percent'] ?? null),
            'energy_kj' => $parseNum($record['energy_kj'] ?? null),
            'energy_kcal' => $parseNum($record['energy_kcal'] ?? null),
            'energy_kj_1169' => $parseNum($record['energy_kj_1169'] ?? null),
            'energy_kcal_1169' => $parseNum($record['energy_kcal_1169'] ?? null),
            'water' => $parseNum($record['water'] ?? null),
            'protein_total' => $parseNum($record['protein_total'] ?? null),
            'protein_animal' => $parseNum($record['protein_animal'] ?? null),
            'protein_plant' => $parseNum($record['protein_plant'] ?? null),
            'protein_1169' => $parseNum($record['protein_1169'] ?? null),
            'fat' => $parseNum($record['fat'] ?? null),
            'carbohydrates_total' => $parseNum($record['carbohydrates_total'] ?? null),
            'carbohydrates_available' => $parseNum($record['carbohydrates_available'] ?? null),
            'ash' => $parseNum($record['ash'] ?? null),
            'sodium' => $parseNum($record['sodium'] ?? null),
            'salt' => $parseNum($record['salt'] ?? null),
            'potassium' => $parseNum($record['potassium'] ?? null),
            'calcium' => $parseNum($record['calcium'] ?? null),
            'phosphorus' => $parseNum($record['phosphorus'] ?? null),
            'magnesium' => $parseNum($record['magnesium'] ?? null),
            'iron' => $parseNum($record['iron'] ?? null),
            'zinc' => $parseNum($record['zinc'] ?? null),
            'copper' => $parseNum($record['copper'] ?? null),
            'manganese' => $parseNum($record['manganese'] ?? null),
            'iodine' => $parseNum($record['iodine'] ?? null),
            'vitamin_a' => $parseNum($record['vitamin_a'] ?? null),
            'retinol' => $parseNum($record['retinol'] ?? null),
            'beta_carotene' => $parseNum($record['beta_carotene'] ?? null),
            'vitamin_d' => $parseNum($record['vitamin_d'] ?? null),
            'vitamin_e' => $parseNum($record['vitamin_e'] ?? null),
            'vitamin_b1' => $parseNum($record['vitamin_b1'] ?? null),
            'vitamin_b2' => $parseNum($record['vitamin_b2'] ?? null),
            'niacin' => $parseNum($record['niacin'] ?? null),
            'vitamin_b6' => $parseNum($record['vitamin_b6'] ?? null),
            'folate' => $parseNum($record['folate'] ?? null),
            'vitamin_b12' => $parseNum($record['vitamin_b12'] ?? null),
            'vitamin_c' => $parseNum($record['vitamin_c'] ?? null),
            'saturated_fat' => $parseNum($record['saturated_fat'] ?? null),
            'cholesterol' => $parseNum($record['cholesterol'] ?? null),
            'sugars' => $parseNum($record['sugars'] ?? null),
            'fiber' => $parseNum($record['fiber'] ?? null),
        ]);
        $insertedCount++;
    }
    
    // Log the upload
    $logStmt = $pdo->prepare("INSERT INTO nutrition_database_uploads (file_name, uploaded_by, records_count, status) VALUES (?, ?, ?, 'success')");
    $logStmt->execute([$input['file_name'] ?? 'unknown.xlsx', $uploadedBy, $insertedCount]);
    
    $pdo->commit();
    
    echo json_encode([
        "success" => true, 
        "data" => [
            "inserted" => $insertedCount,
            "message" => "Database updated successfully"
        ]
    ]);
} catch (PDOException $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    
    // Log the error
    try {
        $logStmt = $pdo->prepare("INSERT INTO nutrition_database_uploads (file_name, uploaded_by, records_count, status, error_message) VALUES (?, ?, 0, 'error', ?)");
        $logStmt->execute([$input['file_name'] ?? 'unknown.xlsx', $input['uploaded_by'] ?? 'System', $e->getMessage()]);
    } catch (Exception $ex) {
        // Ignore logging errors
    }
    
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
