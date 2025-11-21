<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$data = json_decode(file_get_contents("php://input"), true);

$id          = intval($data["id"] ?? 0);
$name        = trim($data["name"] ?? "");
$short       = trim($data["short_name"] ?? "");
$sort        = intval($data["sort_order"] ?? 0);
$desc        = trim($data["description"] ?? "");

if ($name === "") jsonError("Name is required");

if ($id > 0) {
    // UPDATE
    $stmt = $pdo->prepare("
        UPDATE meal_types
        SET name = ?, short_name = ?, sort_order = ?, description = ?
        WHERE id = ?
    ");
    $stmt->execute([$name, $short, $sort, $desc, $id]);
    jsonResponse(["updated" => true, "id" => $id]);
}

// INSERT
$stmt = $pdo->prepare("
    INSERT INTO meal_types (name, short_name, sort_order, description)
    VALUES (?, ?, ?, ?)
");
$stmt->execute([$name, $short, $sort, $desc]);

jsonResponse(["created" => true, "id" => $pdo->lastInsertId()]);
