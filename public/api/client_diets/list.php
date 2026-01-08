<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$clientId = isset($_GET['client_id']) ? (int)$_GET['client_id'] : 0;

if ($clientId <= 0) {
    jsonResponse(null, false, "INVALID_CLIENT_ID", 400);
}

$stmt = $pdo->prepare("
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
    WHERE cd.client_id = ?
    ORDER BY d.name ASC
");
$stmt->execute([$clientId]);

jsonResponse($stmt->fetchAll());
