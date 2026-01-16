<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    $pdo = getPDO();
    $user = requireLogin($pdo);
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Category ID is required']);
        exit;
    }
    
    $id = (int)$input['id'];
    
    // Get old record for audit
    $oldRecord = getRecordForAudit($pdo, 'product_categories', $id);
    
    // Archive instead of delete
    $stmt = $pdo->prepare("UPDATE product_categories SET status = 'archived' WHERE id = ?");
    $stmt->execute([$id]);
    
    // Audit log
    $newRecord = getRecordForAudit($pdo, 'product_categories', $id);
    logAudit($pdo, 'product_categories', $id, 'delete', $oldRecord, $newRecord, $user['id'] ?? null);
    
    echo json_encode([
        'success' => true,
        'message' => 'Category archived successfully'
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
