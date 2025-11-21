<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$data = json_decode(file_get_contents("php://input"), true);

$clientId   = isset($data['client_id']) ? (int)$data['client_id'] : 0;
$dietId     = isset($data['diet_id']) ? (int)$data['diet_id'] : 0;
$customName = trim($data['custom_name'] ?? '');
$customShort = trim($data['custom_short_name'] ?? '');

if ($clientId <= 0 || $dietId <= 0) {
    jsonResponse(null, false, "MISSING_REQUIRED_FIELDS", 422);
}

// unikalność dieta per klient
$check = $pdo->prepare("
    SELECT id FROM client_diets
    WHERE client_id = ? AND diet_id = ?
");
$check->execute([$clientId, $dietId]);
$existing = $check->fetchColumn();

if ($existing) {
    jsonResponse(null, false, "DUPLICATE_DIET", 422);
}

$stmt = $pdo->prepare("
    INSERT INTO client_diets (client_id, diet_id, custom_name, custom_short_name)
    VALUES (?, ?, ?, ?)
");
$stmt->execute([$clientId, $dietId, $customName ?: null, $customShort ?: null]);

$id = (int)$pdo->lastInsertId();

$stmt2 = $pdo->prepare("
    SELECT 
        cd.id,
        cd.client_id,
        cd.diet_id,
        d.name AS diet_name,
        d.short_name AS diet_short_name,
        cd.custom_name,
        cd.custom_short_name
    FROM client_diets cd
    JOIN diets d ON d.id = cd.diet_id
    WHERE cd.id = ?
");
$stmt2->execute([$id]);

jsonResponse($stmt2->fetch());
