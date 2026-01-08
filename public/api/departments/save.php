<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    jsonError("Invalid JSON payload");
}

$id           = intval($input["id"] ?? 0);
$name         = trim($input["name"] ?? "");
$short_name   = trim($input["short_name"] ?? "");
$description  = trim($input["description"] ?? "");

if ($name === "") {
    jsonError("Department name is required");
}

if ($id > 0) {
    // UPDATE
    $stmt = $pdo->prepare("
        UPDATE departments
        SET name = ?, short_name = ?, description = ?
        WHERE id = ?
    ");
    $stmt->execute([$name, $short_name, $description, $id]);

    jsonResponse([
        "updated" => true,
        "id" => $id
    ]);
} else {
    // INSERT
    $stmt = $pdo->prepare("
        INSERT INTO departments (name, short_name, description)
        VALUES (?, ?, ?)
    ");
    $stmt->execute([$name, $short_name, $description]);

    jsonResponse([
        "created" => true,
        "id" => $pdo->lastInsertId()
    ]);
}
