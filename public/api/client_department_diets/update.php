<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$data = json_decode(file_get_contents("php://input"), true);

$id = isset($data['id']) ? (int)$data['id'] : 0;

if ($id <= 0) {
    jsonResponse(null, false, "INVALID_ID", 422);
}

$stmt = $pdo->prepare("
    SELECT is_active, is_default
    FROM client_department_diets
    WHERE id = ?
");
$stmt->execute([$id]);
$row = $stmt->fetch();

if (!$row) {
    jsonResponse(null, false, "NOT_FOUND", 404);
}

$currentActive  = (int)$row['is_active'];
$currentDefault = (int)$row['is_default'];

$isActive  = array_key_exists('is_active', $data)  ? (int)$data['is_active']  : $currentActive;
$isDefault = array_key_exists('is_default', $data) ? (int)$data['is_default'] : $currentDefault;

// Naprawiamy relację: nie może być domyślna i nieaktywna
if ($isActive === 0 && $isDefault === 1) {
    $isDefault = 0;
}

$upd = $pdo->prepare("
    UPDATE client_department_diets
    SET is_active = ?, is_default = ?
    WHERE id = ?
");
$upd->execute([$isActive, $isDefault, $id]);

jsonResponse(true);
