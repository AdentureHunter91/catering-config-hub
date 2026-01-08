<?php
require_once __DIR__ . '/../../bootstrap.php';

$pdo = getPDO();

$contractDepartmentId = (int)($_GET['contract_department_id'] ?? 0);
if ($contractDepartmentId <= 0) jsonResponse(null, false, "INVALID_ID");

// get diets for this department based on client data
$stmt = $pdo->prepare("
    SELECT 
        cdd.id,
        cd2.id AS contract_department_id,
        cdd.client_diet_id,
        cdd.is_active,
        d.name,
        d.short_name
    FROM contract_department_diets cdd
    JOIN client_diets cd ON cd.id = cdd.client_diet_id
    JOIN diets d ON d.id = cd.diet_id
    WHERE cdd.contract_department_id = ?
    ORDER BY d.sort_order, d.name
");
$stmt->execute([$contractDepartmentId]);

jsonResponse($stmt->fetchAll());
