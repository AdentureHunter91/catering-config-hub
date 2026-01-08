<?php
require_once __DIR__ . '/../../bootstrap.php';

$pdo = getPDO();

$data = json_decode(file_get_contents("php://input"), true);

$contract_id = (int)($data['contract_id'] ?? 0);
$client_diet_id = (int)($data['client_diet_id'] ?? 0);
$is_active = (int)($data['is_active'] ?? 0);

if ($contract_id <= 0 || $client_diet_id <= 0) {
    jsonResponse(null, false, "Invalid parameters", 422);
}

// Sprawdź, czy już istnieje rekord w contract_diets
$stmt = $pdo->prepare("
    SELECT id FROM contract_diets
    WHERE contract_id = ? AND client_diet_id = ?
");
$stmt->execute([$contract_id, $client_diet_id]);
$row = $stmt->fetch();

if ($row) {
    // UPDATE
    $stmt = $pdo->prepare("
        UPDATE contract_diets
        SET is_active = ?
        WHERE id = ?
    ");
    $stmt->execute([$is_active, $row['id']]);
} else {
    // INSERT
    $stmt = $pdo->prepare("
        INSERT INTO contract_diets (contract_id, client_diet_id, is_active)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$contract_id, $client_diet_id, $is_active]);
}

jsonResponse(true);
