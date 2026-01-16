<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit;
}

try {
    $pdo = getPDO();
    $user = requireLogin($pdo);
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['name'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Name is required']);
        exit;
    }
    
    $name = trim($input['name']);
    
    // Check for duplicate name
    $checkStmt = $pdo->prepare("SELECT id FROM product_categories WHERE name = ? AND status = 'active'");
    $checkStmt->execute([$name]);
    if ($checkStmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Category with this name already exists']);
        exit;
    }
    
    // Get max sort order
    $maxOrderStmt = $pdo->query("SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM product_categories");
    $nextOrder = $maxOrderStmt->fetch()['next_order'];
    
    $stmt = $pdo->prepare("INSERT INTO product_categories (name, status, sort_order) VALUES (?, 'active', ?)");
    $stmt->execute([$name, $nextOrder]);
    
    $newId = (int)$pdo->lastInsertId();
    
    // Audit log
    $newRecord = getRecordForAudit($pdo, 'product_categories', $newId);
    logAudit($pdo, 'product_categories', $newId, 'insert', null, $newRecord, $user['id'] ?? null);
    
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => $newId,
            'name' => $name,
            'status' => 'active',
            'sort_order' => (int)$nextOrder,
            'subcategory_count' => 0
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
