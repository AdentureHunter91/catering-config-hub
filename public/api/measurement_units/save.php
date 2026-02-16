<?php
require_once __DIR__ . '/../bootstrap.php';

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) jsonResponse(null, false, 'Invalid JSON', 400);

$id = isset($input['id']) ? (int)$input['id'] : null;
$symbol = trim($input['symbol'] ?? '');
$name = trim($input['name'] ?? '');
$type = $input['type'] ?? 'mass';
$baseUnitSymbol = isset($input['base_unit_symbol']) ? ($input['base_unit_symbol'] ?: null) : null;
$toBaseFactor = isset($input['to_base_factor']) ? (float)$input['to_base_factor'] : 1.0;
$sortOrder = isset($input['sort_order']) ? (int)$input['sort_order'] : 0;
$status = $input['status'] ?? 'active';

if (!$symbol) jsonResponse(null, false, 'Symbol jest wymagany', 400);
if (!$name) jsonResponse(null, false, 'Nazwa jest wymagana', 400);

if ($id) {
    $old = getRecordForAudit($pdo, 'measurement_units', $id);
    $stmt = $pdo->prepare("UPDATE measurement_units SET symbol=?, name=?, type=?, base_unit_symbol=?, to_base_factor=?, sort_order=?, status=? WHERE id=?");
    $stmt->execute([$symbol, $name, $type, $baseUnitSymbol, $toBaseFactor, $sortOrder, $status, $id]);
    logAudit($pdo, 'measurement_units', $id, 'update', $old, $input, $authUser['id'] ?? null);
    jsonResponse(['id' => $id, 'updated' => true]);
} else {
    $stmt = $pdo->prepare("INSERT INTO measurement_units (symbol, name, type, base_unit_symbol, to_base_factor, sort_order, status) VALUES (?,?,?,?,?,?,?)");
    $stmt->execute([$symbol, $name, $type, $baseUnitSymbol, $toBaseFactor, $sortOrder, $status]);
    $newId = (int)$pdo->lastInsertId();
    logAudit($pdo, 'measurement_units', $newId, 'insert', null, $input, $authUser['id'] ?? null);
    jsonResponse(['id' => $newId, 'created' => true]);
}
