<?php
declare(strict_types=1);
error_reporting(E_ALL);
ini_set("display_errors", "0");

require_once __DIR__ . "/../bootstrap.php";
header('Cache-Control: no-store');

// This endpoint receives parsed XLSX data from frontend and inserts into database
// Frontend parses XLSX using 'xlsx' library and sends JSON array of records

try {
    $inputRaw = file_get_contents('php://input');
    $input = json_decode($inputRaw, true);

    if (!$input || !isset($input['records']) || !is_array($input['records'])) {
        jsonResponse(null, false, 'No records provided', 400);
    }

    $records = $input['records'];
    $uploadedBy = isset($input['uploaded_by']) ? (string)$input['uploaded_by'] : 'System';

    if (count($records) === 0) {
        jsonResponse(null, false, 'Empty records array', 400);
    }

    $pdo->beginTransaction();

    // Clear existing data (full replacement strategy)
    $pdo->exec('DELETE FROM nutrition_database');

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

    $parseNum = static function ($val): ?float {
        if ($val === null) return null;
        if (is_string($val)) {
            $v = trim($val);
            if ($v === '' || $v === 'b.d.' || $v === '-') return null;
            $v = str_replace(',', '.', $v);
            return is_numeric($v) ? (float)$v : null;
        }
        if (is_int($val) || is_float($val)) return (float)$val;
        return null;
    };

    $insertedCount = 0;

    foreach ($records as $record) {
        if (!is_array($record)) continue;

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

    // Log the upload (best-effort)
    try {
        $logStmt = $pdo->prepare("INSERT INTO nutrition_database_uploads (file_name, uploaded_by, records_count, status) VALUES (?, ?, ?, 'success')");
        $logStmt->execute([$input['file_name'] ?? 'unknown.xlsx', $uploadedBy, $insertedCount]);
    } catch (Throwable $e) {
        // ignore
    }

    $pdo->commit();

    jsonResponse([
        'inserted' => $insertedCount,
        'message' => 'Database updated successfully',
    ]);
} catch (Throwable $e) {
    if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
        $pdo->rollBack();
    }

    // Log the error (best-effort)
    try {
        $fileName = is_array($input ?? null) ? ($input['file_name'] ?? 'unknown.xlsx') : 'unknown.xlsx';
        $who = is_array($input ?? null) ? ((string)($input['uploaded_by'] ?? 'System')) : 'System';

        $logStmt = $pdo->prepare("INSERT INTO nutrition_database_uploads (file_name, uploaded_by, records_count, status, error_message) VALUES (?, ?, 0, 'error', ?)");
        $logStmt->execute([$fileName, $who, $e->getMessage()]);
    } catch (Throwable $ex) {
        // ignore
    }

    jsonResponse(null, false, $e->getMessage(), 500);
}
