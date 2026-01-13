<?php
declare(strict_types=1);

require_once __DIR__ . "/../../db.php";

header("Content-Type: application/json; charset=utf-8");

try {
    $pdo = getDB();

    $contractId = intval($_GET["contract_id"] ?? 0);
    if ($contractId <= 0) throw new Exception("Missing contract_id");

    $stmt = $pdo->prepare("
        SELECT 
            contract_id,
            client_diet_id,
            client_meal_type_id,
            is_active
        FROM contract_diet_meal_types
        WHERE contract_id = ?
    ");
    $stmt->execute([$contractId]);

    echo json_encode([
        "success" => true,
        "data" => $stmt->fetchAll(PDO::FETCH_ASSOC)
    ]);
} catch (Exception $e) {
    echo json_encode([
        "success" => false,
        "error" => $e->getMessage()
    ]);
}
