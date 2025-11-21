<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$id = intval($_GET['id'] ?? 0);
if ($id <= 0) jsonError("Invalid ID");

$stmt = $pdo->prepare("
    SELECT id, name, short_name, sort_order, description
    FROM meal_types
    WHERE id = ?
");
$stmt->execute([$id]);

$row = $stmt->fetch();
if (!$row) jsonError("Meal type not found");

jsonResponse($row);
