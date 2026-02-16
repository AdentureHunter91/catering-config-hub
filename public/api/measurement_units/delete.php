<?php
require_once __DIR__ . '/../bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['id'])) jsonResponse(null, false, 'ID jest wymagane', 400);

$id = (int)$input['id'];
$old = getRecordForAudit($pdo, 'measurement_units', $id);

if (!$old) jsonResponse(null, false, 'Nie znaleziono jednostki', 404);

// Don't allow deleting base units
if (empty($old['base_unit_symbol']) && in_array($old['symbol'], ['g', 'ml'])) {
    jsonResponse(null, false, 'Nie można usunąć jednostki bazowej', 400);
}

$stmt = $pdo->prepare("UPDATE measurement_units SET status='archived' WHERE id=?");
$stmt->execute([$id]);
logAudit($pdo, 'measurement_units', $id, 'delete', $old, ['status' => 'archived'], $authUser['id'] ?? null);

jsonResponse(['id' => $id, 'archived' => true]);
