<?php
require_once __DIR__ . '/../../bootstrap.php';

$pdo = getPDO();

$contractId = isset($_GET['contract_id']) ? (int)$_GET['contract_id'] : 0;

if ($contractId <= 0) {
    jsonResponse(null, false, "INVALID_CONTRACT_ID", 400);
}

$stmt = $pdo->prepare("
    SELECT ckp.*, k.name AS kitchen_name
    FROM contract_kitchen_periods ckp
    JOIN kitchens k ON k.id = ckp.kitchen_id
    WHERE ckp.contract_id = ?
    ORDER BY ckp.start_date ASC
");
$stmt->execute([$contractId]);

jsonResponse($stmt->fetchAll());
