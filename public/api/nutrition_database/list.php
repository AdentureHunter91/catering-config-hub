<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../db.php';

try {
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 100;
    
    $sql = "SELECT id, code, name_pl, name_en, energy_kj, energy_kcal, energy_kj_1169, energy_kcal_1169, 
            water, protein_total, protein_animal, protein_plant, fat, saturated_fat, 
            carbohydrates, sugars, fiber, sodium, salt, potassium, calcium, phosphorus, 
            magnesium, iron, zinc, vitamin_a, vitamin_d, vitamin_e, vitamin_c, 
            vitamin_b1, vitamin_b2, vitamin_b6, vitamin_b12, folate, niacin, cholesterol
            FROM nutrition_database";
    
    $params = [];
    
    if (!empty($search)) {
        $sql .= " WHERE name_pl LIKE ? OR name_en LIKE ? OR code LIKE ?";
        $searchParam = "%" . $search . "%";
        $params = [$searchParam, $searchParam, $searchParam];
    }
    
    $sql .= " ORDER BY name_pl ASC LIMIT ?";
    $params[] = $limit;
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["success" => true, "data" => $data]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
