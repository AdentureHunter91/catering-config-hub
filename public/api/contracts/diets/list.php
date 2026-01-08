<?php
require_once __DIR__ . '/../../bootstrap.php';

$pdo = getPDO();

$contractId = (int)($_GET['contract_id'] ?? 0);
if ($contractId <= 0) {
    jsonResponse(null, false, "INVALID_CONTRACT_ID", 422);
}

// Zwracamy wszystkie diety skonfigurowane dla klienta tego kontraktu
// + info czy są aktywne w tym konkretnym kontrakcie
$stmt = $pdo->prepare("
    SELECT
        cd.id AS client_diet_id,
        d.name,
        d.short_name,
        cd.custom_name,
        cd.custom_short_name,
        COALESCE(cdiet.is_active, 1) AS is_active
    FROM client_diets cd
    JOIN diets d ON d.id = cd.diet_id
    LEFT JOIN contract_diets cdiet
        ON cdiet.client_diet_id = cd.id
       AND cdiet.contract_id = ?
    WHERE cd.client_id = (
        SELECT client_id FROM contracts WHERE id = ?
    )
    ORDER BY d.name, cd.custom_name
");
$stmt->execute([$contractId, $contractId]);

jsonResponse($stmt->fetchAll());
