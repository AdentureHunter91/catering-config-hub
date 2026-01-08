<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$data = json_decode(file_get_contents("php://input"), true);

$id          = (int)($data['id'] ?? 0);
$short_name  = trim($data['short_name'] ?? "");
$full_name   = trim($data['full_name'] ?? "");
$nip         = trim($data['nip'] ?? "");
$city        = trim($data['city'] ?? "");
$address     = trim($data['address'] ?? "");
$total_beds  = isset($data['total_beds']) ? (int)$data['total_beds'] : null;

if ($short_name === "" || $full_name === "" || $nip === "" || $city === "" || $address === "") {
    jsonResponse(null, false, "MISSING_REQUIRED_FIELDS", 422);
}

if ($id > 0) {

    // UPDATE
    $stmt = $pdo->prepare("
        UPDATE clients
        SET 
            short_name = ?, 
            full_name = ?, 
            nip = ?, 
            city = ?, 
            address = ?,
            total_beds = ?
        WHERE id = ?
    ");
    $stmt->execute([$short_name, $full_name, $nip, $city, $address, $total_beds, $id]);

    jsonResponse([
        "id" => $id,
        "updated" => true
    ]);

} else {

    // INSERT
    $stmt = $pdo->prepare("
        INSERT INTO clients (short_name, full_name, nip, city, address, total_beds)
        VALUES (?, ?, ?, ?, ?, ?)
    ");
    $stmt->execute([$short_name, $full_name, $nip, $city, $address, $total_beds]);

    jsonResponse([
        "id" => $pdo->lastInsertId(),
        "created" => true
    ]);
}
