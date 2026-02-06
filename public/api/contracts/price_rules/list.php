<?php
declare(strict_types=1);

require_once __DIR__ . "/../../bootstrap.php";

$pdo = getPDO();
$user = requireLogin($pdo);

$contractId = isset($_GET['contract_id']) ? (int)$_GET['contract_id'] : 0;
if ($contractId <= 0) {
    jsonResponse(null, false, "INVALID_CONTRACT_ID", 400);
}

$stmt = $pdo->prepare("
    SELECT
        id,
        contract_id,
        name,
        client_meal_type_id,
        client_diet_id,
        client_department_id,
        variant_key,
        variant_operator,
        variant_value,
        amount,
        use_date_range,
        valid_from,
        valid_to
    FROM contract_price_rules
    WHERE contract_id = ?
    ORDER BY id
");
$stmt->execute([$contractId]);

$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

jsonResponse($rows, true, null);
