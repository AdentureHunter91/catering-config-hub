<?php
require_once __DIR__ . '/../../bootstrap.php';

$pdo = getPDO();

$data = json_decode(file_get_contents("php://input"), true);

$id = (int)$data['id'];
$isActive = (int)$data['is_active'];

$stmt = $pdo->prepare("
    UPDATE contract_department_diets
    SET is_active = ?
    WHERE id = ?
");
$stmt->execute([$isActive, $id]);

jsonResponse(true);
