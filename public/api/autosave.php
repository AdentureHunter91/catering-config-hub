<?php
require_once __DIR__ . "/bootstrap.php";

$pdo = getPDO();
$user = requireLogin($pdo);

$table = $_POST["table"] ?? null;
$id    = $_POST["id"] ?? null;
$field = $_POST["field"] ?? null;
$value = $_POST["value"] ?? null;

if (!$table || !$id || !$field) {
    jsonResponse(null, false, "Missing parameters", 400);
}

$stmt = $pdo->prepare("UPDATE {$table} SET {$field} = :value WHERE id = :id");
$stmt->execute([
    "value" => $value,
    "id"    => $id,
]);

jsonResponse(["updated" => true]);