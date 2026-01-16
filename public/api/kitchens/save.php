<?php
declare(strict_types=1);

require_once __DIR__ . "/../bootstrap.php";

$pdo = getPDO();
$user = requireLogin($pdo);

$data = json_decode(file_get_contents("php://input"), true);

$id      = intval($data['id'] ?? 0);
$name    = trim($data['name'] ?? '');
$city    = trim($data['city'] ?? '');
$address = trim($data['address'] ?? '');
$nip     = trim($data['nip'] ?? '');

if ($name === '' || $city === '' || $address === '' || $nip === '') {
    jsonResponse(null, false, "Missing required fields", 400);
}

if ($id > 0) {
    // Get old record for audit
    $oldRecord = getRecordForAudit($pdo, 'kitchens', $id);
    
    // UPDATE
    $sql = "UPDATE kitchens 
            SET name = ?, city = ?, address = ?, nip = ?, updated_at = NOW()
            WHERE id = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$name, $city, $address, $nip, $id]);

    $sql2 = "SELECT id, name, city, address, nip FROM kitchens WHERE id = ?";
    $stmt2 = $pdo->prepare($sql2);
    $stmt2->execute([$id]);
    $kitchen = $stmt2->fetch(PDO::FETCH_ASSOC);
    
    // Audit log
    $newRecord = getRecordForAudit($pdo, 'kitchens', $id);
    logAudit($pdo, 'kitchens', $id, 'update', $oldRecord, $newRecord, $user['id'] ?? null);

    jsonResponse($kitchen, true);
} else {
    // INSERT
    $sql = "INSERT INTO kitchens (name, city, address, nip) 
            VALUES (?, ?, ?, ?)";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([$name, $city, $address, $nip]);

    $newId = (int)$pdo->lastInsertId();

    $sql2 = "SELECT id, name, city, address, nip FROM kitchens WHERE id = ?";
    $stmt2 = $pdo->prepare($sql2);
    $stmt2->execute([$newId]);
    $kitchen = $stmt2->fetch(PDO::FETCH_ASSOC);
    
    // Audit log
    $newRecord = getRecordForAudit($pdo, 'kitchens', $newId);
    logAudit($pdo, 'kitchens', $newId, 'insert', null, $newRecord, $user['id'] ?? null);

    jsonResponse($kitchen, true);
}
