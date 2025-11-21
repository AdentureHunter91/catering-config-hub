<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$input = json_decode(file_get_contents("php://input"), true);
$id = intval($input["id"] ?? 0);

if ($id <= 0) {
    jsonError("Invalid ID");
}

// (opcjonalnie) blokada, jeśli oddział jest używany
// np. sprawdzamy powiązania w clients_departments
// ...

$stmt = $pdo->prepare("DELETE FROM departments WHERE id = ?");
$stmt->execute([$id]);

jsonResponse([
    "deleted" => true,
    "id" => $id
]);
