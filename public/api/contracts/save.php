<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);

$data = json_decode(file_get_contents("php://input"), true);

$id = $data["id"] ?? 0;
$client_id = $data["client_id"] ?? 0;
$contract_number = $data["contract_number"] ?? "";
$start_date = $data["start_date"] ?? null;
$end_date = $data["end_date"] ?? null;
$contract_value = $data["contract_value"] ?? null;
$status = $data["status"] ?? "active";
$contract_beds = isset($data["contract_beds"]) ? (int)$data["contract_beds"] : null;


if (!$client_id || !$contract_number || !$start_date) {
    jsonResponse(null, false, "Missing fields", 422);
}

if ($id > 0) {
    // Get old record for audit
    $oldRecord = getRecordForAudit($pdo, 'contracts', (int)$id);

    // UPDATE
    $stmt = $pdo->prepare("
        UPDATE contracts 
        SET client_id=?, contract_number=?, start_date=?, end_date=?, contract_value=?, status=?, contract_beds=?
        WHERE id=?
    ");
    $stmt->execute([
        $client_id, $contract_number, $start_date, $end_date, $contract_value, $status, $contract_beds,
        $id
    ]);

    // Audit log
    $newRecord = getRecordForAudit($pdo, 'contracts', (int)$id);
    logAudit($pdo, 'contracts', (int)$id, 'update', $oldRecord, $newRecord, $user['id'] ?? null);
} else {
    // INSERT (NEW CONTRACT)
    $stmt = $pdo->prepare("
        INSERT INTO contracts (client_id, contract_number, start_date, end_date, contract_value, status, contract_beds)
        VALUES (?,?,?,?,?,?,?)
    ");
    $stmt->execute([
        $client_id, $contract_number, $start_date, $end_date, $contract_value, $status, $contract_beds
    ]);

    $id = (int)$pdo->lastInsertId();

    // Audit log for new contract
    $newRecord = getRecordForAudit($pdo, 'contracts', $id);
    logAudit($pdo, 'contracts', $id, 'insert', null, $newRecord, $user['id'] ?? null);

    /*
    |--------------------------------------------------------------------------
    | 1) CONTRACT_DEPARTMENTS – wstaw wszystkie oddziały klienta
    |--------------------------------------------------------------------------
    */
    $stmt = $pdo->prepare("
        INSERT INTO contract_departments (contract_id, client_department_id, is_active)
        SELECT ?, cd.id, 1
        FROM client_departments cd
        WHERE cd.client_id = ?
    ");
    $stmt->execute([$id, $client_id]);

    /*
    |--------------------------------------------------------------------------
    | 2) CONTRACT_DIETS – wstaw wszystkie diety klienta
    |--------------------------------------------------------------------------
    */
    $stmt = $pdo->prepare("
        INSERT INTO contract_diets (contract_id, client_diet_id, is_active)
        SELECT ?, d.id, 1
        FROM client_diets d
        WHERE d.client_id = ?
    ");
    $stmt->execute([$id, $client_id]);

    /*
    |--------------------------------------------------------------------------
    | 3) CONTRACT_DEPARTMENT_DIETS – kopiowanie pełnej konfiguracji klienta
    |--------------------------------------------------------------------------
    */
    $stmt = $pdo->prepare("
        INSERT INTO contract_department_diets (contract_department_id, client_diet_id, is_active)
        SELECT 
            cdep.id AS contract_department_id,
            cdd.client_diet_id,
            1
        FROM client_department_diets cdd
        JOIN client_departments cd ON cd.id = cdd.client_department_id
        JOIN contract_departments cdep
            ON cdep.client_department_id = cd.id
           AND cdep.contract_id = ?
        WHERE cd.client_id = ?
    ");
    $stmt->execute([$id, $client_id]);
}

// Fetch updated/new contract
$stmt = $pdo->prepare("SELECT * FROM contracts WHERE id=?");
$stmt->execute([$id]);

jsonResponse($stmt->fetch());
