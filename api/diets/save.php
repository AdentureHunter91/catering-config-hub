<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$data = json_decode(file_get_contents("php://input"), true);

$id = intval($data["id"] ?? 0);
$name = trim($data["name"] ?? "");
$short = trim($data["short_name"] ?? "");
$desc = trim($data["description"] ?? "");

if ($name === "") jsonError("Diet name is required");

if ($id > 0) {
    $stmt = $pdo->prepare("
        UPDATE diets
        SET name = ?, short_name = ?, description = ?
        WHERE id = ?
    ");
    $stmt->execute([$name, $short, $desc, $id]);
    jsonResponse(["updated" => true, "id" => $id]);
}

$stmt = $pdo->prepare("
    INSERT INTO diets (name, short_name, description)
    VALUES (?, ?, ?)
");
$stmt->execute([$name, $short, $desc]);
jsonResponse(["created" => true, "id" => $pdo->lastInsertId()]);
