<?php
declare(strict_types=1);

require_once __DIR__ . "/../../bootstrap.php";
require_once __DIR__ . "/../../db.php";

header("Content-Type: application/json; charset=utf-8");

try {
    $pdo = getPDO();
    $user = requireLogin($pdo);

    $raw = file_get_contents("php://input");
    $input = json_decode($raw, true);

    $contractId = intval($input["contract_id"] ?? 0);
    $dietId = intval($input["client_diet_id"] ?? 0);
    $mealTypeId = intval($input["client_meal_type_id"] ?? 0);
    $isActive = intval($input["is_active"] ?? 0);

    if (!$contractId || !$dietId || !$mealTypeId) {
        throw new Exception("Missing required parameters");
    }

    // Check if exists
    $checkStmt = $pdo->prepare("
        SELECT id FROM contract_diet_meal_types
        WHERE contract_id = ? AND client_diet_id = ? AND client_meal_type_id = ?
    ");
    $checkStmt->execute([$contractId, $dietId, $mealTypeId]);
    $existingId = $checkStmt->fetchColumn();

    if ($existingId) {
        // Get old record for audit
        $oldRecord = getRecordForAudit($pdo, 'contract_diet_meal_types', (int)$existingId);
        
        // Update
        $stmt = $pdo->prepare("
            UPDATE contract_diet_meal_types
            SET is_active = ?, updated_at = NOW()
            WHERE id = ?
        ");
        $stmt->execute([$isActive, $existingId]);
        
        // Audit log
        $newRecord = getRecordForAudit($pdo, 'contract_diet_meal_types', (int)$existingId);
        logAudit($pdo, 'contract_diet_meal_types', (int)$existingId, 'update', $oldRecord, $newRecord, $user['id'] ?? null);
    } else {
        // Insert
        $stmt = $pdo->prepare("
            INSERT INTO contract_diet_meal_types
                (contract_id, client_diet_id, client_meal_type_id, is_active)
            VALUES (?, ?, ?, ?)
        ");
        $stmt->execute([$contractId, $dietId, $mealTypeId, $isActive]);
        
        $newId = (int)$pdo->lastInsertId();
        
        // Audit log
        $newRecord = getRecordForAudit($pdo, 'contract_diet_meal_types', $newId);
        logAudit($pdo, 'contract_diet_meal_types', $newId, 'insert', null, $newRecord, $user['id'] ?? null);
    }

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
