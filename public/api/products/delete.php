<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$data = json_decode(file_get_contents("php://input"), true);
$user = requireLogin($pdo);

$id = isset($data['id']) ? (int)$data['id'] : 0;
$restore = isset($data['restore']) && $data['restore'] === true;

if ($id <= 0) {
    $id = isset($_POST['id']) ? (int)$_POST['id'] : 0;
}

if ($id <= 0) {
    jsonResponse(null, false, "MISSING_ID", 422);
}

// Get old record for audit
$oldRecord = getRecordForAudit($pdo, 'products', $id);

try {
    $pdo->beginTransaction();

    $newStatus = $restore ? 'active' : 'archived';
    
    // Archive/restore the product
    $stmt = $pdo->prepare("UPDATE products SET status = ? WHERE id = ?");
    $stmt->execute([$newStatus, $id]);

    // Cascade: archive/restore all subproducts (product_variants)
    $cascadeStmt = $pdo->prepare("UPDATE product_variants SET status = ? WHERE product_id = ?");
    $cascadeStmt->execute([$newStatus, $id]);

    $pdo->commit();

    // Audit log
    $newRecord = getRecordForAudit($pdo, 'products', $id);
    $action = $restore ? 'update' : 'delete';
    logAudit($pdo, 'products', $id, $action, $oldRecord, $newRecord, $user['id'] ?? null);

    jsonResponse([
        "id" => $id,
        "status" => $newStatus,
        "cascaded" => true
    ]);
} catch (Exception $e) {
    $pdo->rollBack();
    jsonResponse(null, false, "DATABASE_ERROR: " . $e->getMessage(), 500);
}
