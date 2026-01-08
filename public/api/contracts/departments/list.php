<?php
require_once __DIR__ . '/../../bootstrap.php';

$pdo = getPDO();

$contractId = (int)($_GET['contract_id'] ?? 0);
if ($contractId <= 0) {
    jsonResponse(null, false, "INVALID_CONTRACT_ID", 422);
}

$stmt = $pdo->prepare("
    SELECT
        cd.id AS client_department_id,
        d.name,
        d.short_name,
        cd.custom_name,
        cd.custom_short_name,
        COALESCE(cdep.is_active, 1) AS is_active
    FROM client_departments cd
    JOIN departments d ON d.id = cd.department_id
    LEFT JOIN contract_departments cdep
        ON cdep.client_department_id = cd.id
       AND cdep.contract_id = ?
    WHERE cd.client_id = (
        SELECT client_id FROM contracts WHERE id = ?
    )
    ORDER BY d.short_name, cd.custom_short_name
");
$stmt->execute([$contractId, $contractId]);

jsonResponse($stmt->fetchAll());
