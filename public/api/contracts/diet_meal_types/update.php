<?php
declare(strict_types=1);

require_once __DIR__ . "/../../db.php";

header("Content-Type: application/json; charset=utf-8");

try {
    $pdo = getDB();

    $raw = file_get_contents("php://input");
    $input = json_decode($raw, true);

    $contractId = intval($input["contract_id"] ?? 0);
    $dietId = intval($input["client_diet_id"] ?? 0);
    $mealTypeId = intval($input["client_meal_type_id"] ?? 0);
    $isActive = intval($input["is_active"] ?? 0);

    if (!$contractId || !$dietId || !$mealTypeId) {
        throw new Exception("Missing required parameters");
    }

    $stmt = $pdo->prepare("
        INSERT INTO contract_diet_meal_types
            (contract_id, client_diet_id, client_meal_type_id, is_active)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            is_active = VALUES(is_active),
            updated_at = NOW()
    ");

    $stmt->execute([$contractId, $dietId, $mealTypeId, $isActive]);

    echo json_encode([
        "success" => true,
        "data" => true
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
