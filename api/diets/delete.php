<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$data = json_decode(file_get_contents("php://input"), true);
$id = intval($data["id"] ?? 0);

if ($id <= 0) jsonError("Invalid ID");

$stmt = $pdo->prepare("DELETE FROM diets WHERE id = ?");
$stmt->execute([$id]);

jsonResponse(["deleted" => true, "id" => $id]);
