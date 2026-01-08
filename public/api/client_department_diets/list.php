<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$clientId = isset($_GET['client_id']) ? (int)$_GET['client_id'] : 0;

if ($clientId <= 0) {
    jsonResponse(null, false, "INVALID_CLIENT_ID", 400);
}

$stmt = $pdo->prepare("
    SELECT
        cdd.id,
        cdd.client_department_id,
        cdd.client_diet_id,
        cdd.is_default,
        cdd.is_active,
        cd.client_id,
        dpt.name AS department_name,
        dpt.short_name AS department_short_name,
        d.name AS diet_name,
        d.short_name AS diet_short_name
    FROM client_department_diets cdd
    JOIN client_departments cd ON cd.id = cdd.client_department_id
    JOIN client_diets cdt ON cdt.id = cdd.client_diet_id
    JOIN departments dpt ON dpt.id = cd.department_id
    JOIN diets d ON d.id = cdt.diet_id
    WHERE cd.client_id = ?
    ORDER BY dpt.name ASC, d.name ASC
");
$stmt->execute([$clientId]);

jsonResponse($stmt->fetchAll());
