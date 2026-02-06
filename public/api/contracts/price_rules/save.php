<?php
declare(strict_types=1);

require_once __DIR__ . "/../../bootstrap.php";

$pdo = getPDO();
$user = requireLogin($pdo);

$raw = file_get_contents("php://input") ?: "";
$in = json_decode($raw, true);
if (!is_array($in)) {
    jsonResponse(null, false, "INVALID_JSON", 400);
}

$id = isset($in['id']) ? (int)$in['id'] : 0;
$contractId = isset($in['contract_id']) ? (int)$in['contract_id'] : 0;

if ($contractId <= 0) {
    jsonResponse(null, false, "INVALID_CONTRACT_ID", 400);
}

$name = trim((string)($in['name'] ?? ""));
if ($name === "") {
    jsonResponse(null, false, "NAME_REQUIRED", 400);
}

$mealTypeId = isset($in['client_meal_type_id']) ? (int)$in['client_meal_type_id'] : 0;
$dietId = isset($in['client_diet_id']) ? (int)$in['client_diet_id'] : 0;
$departmentId = isset($in['client_department_id']) ? (int)$in['client_department_id'] : 0;

$mealTypeId = $mealTypeId > 0 ? $mealTypeId : null;
$dietId = $dietId > 0 ? $dietId : null;
$departmentId = $departmentId > 0 ? $departmentId : null;

$variantKey = isset($in['variant_key']) ? trim((string)$in['variant_key']) : null;
$variantKey = $variantKey !== "" ? $variantKey : null;

$variantOperator = isset($in['variant_operator']) ? trim((string)$in['variant_operator']) : null;
$variantOperator = $variantOperator !== "" ? $variantOperator : null;

$variantValue = isset($in['variant_value']) ? (string)$in['variant_value'] : null;
$variantValue = $variantValue !== "" ? $variantValue : null;

$allowedOperators = ["eq", "neq", "gt", "gte", "lt", "lte", "contains", "not_contains"];
if ($variantOperator !== null && !in_array($variantOperator, $allowedOperators, true)) {
    jsonResponse(null, false, "INVALID_OPERATOR", 400);
}

$amount = isset($in['amount']) ? (float)$in['amount'] : 0.0;

$useDateRange = isset($in['use_date_range']) ? (int)$in['use_date_range'] : 0;
$useDateRange = $useDateRange ? 1 : 0;

$validFrom = isset($in['valid_from']) ? trim((string)$in['valid_from']) : null;
$validTo = isset($in['valid_to']) ? trim((string)$in['valid_to']) : null;

$validFrom = $validFrom !== "" ? $validFrom : null;
$validTo = $validTo !== "" ? $validTo : null;

if (!$useDateRange) {
    $validFrom = null;
    $validTo = null;
}

if ($id > 0) {
    $oldRecord = getRecordForAudit($pdo, 'contract_price_rules', $id);

    $stmt = $pdo->prepare("
        UPDATE contract_price_rules
        SET
            name = ?,
            client_meal_type_id = ?,
            client_diet_id = ?,
            client_department_id = ?,
            variant_key = ?,
            variant_operator = ?,
            variant_value = ?,
            amount = ?,
            use_date_range = ?,
            valid_from = ?,
            valid_to = ?,
            updated_by = ?
        WHERE id = ? AND contract_id = ?
    ");

    $stmt->execute([
        $name,
        $mealTypeId,
        $dietId,
        $departmentId,
        $variantKey,
        $variantOperator,
        $variantValue,
        $amount,
        $useDateRange,
        $validFrom,
        $validTo,
        $user['id'] ?? null,
        $id,
        $contractId,
    ]);

    $newRecord = getRecordForAudit($pdo, 'contract_price_rules', $id);
    logAudit($pdo, 'contract_price_rules', $id, 'update', $oldRecord, $newRecord, $user['id'] ?? null);

    jsonResponse($newRecord, true, null);
}

$stmt = $pdo->prepare("
    INSERT INTO contract_price_rules
        (contract_id, name, client_meal_type_id, client_diet_id, client_department_id,
         variant_key, variant_operator, variant_value, amount, use_date_range, valid_from, valid_to, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
");

$stmt->execute([
    $contractId,
    $name,
    $mealTypeId,
    $dietId,
    $departmentId,
    $variantKey,
    $variantOperator,
    $variantValue,
    $amount,
    $useDateRange,
    $validFrom,
    $validTo,
    $user['id'] ?? null,
]);

$newId = (int)$pdo->lastInsertId();
$newRecord = getRecordForAudit($pdo, 'contract_price_rules', $newId);
logAudit($pdo, 'contract_price_rules', $newId, 'insert', null, $newRecord, $user['id'] ?? null);

jsonResponse($newRecord, true, null);
