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
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['name'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Name is required']);
        exit;
    }
    
    if (empty($input['category_id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Category ID is required']);
        exit;
    }
    
    $name = trim($input['name']);
    $categoryId = (int)$input['category_id'];
    
    // Check if category exists
    $catStmt = $pdo->prepare("SELECT id FROM product_categories WHERE id = ?");
    $catStmt->execute([$categoryId]);
    if (!$catStmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Category not found']);
        exit;
    }
    
    // Check for duplicate name within the same category
    $checkStmt = $pdo->prepare("SELECT id FROM product_subcategories WHERE name = ? AND category_id = ? AND status = 'active'");
    $checkStmt->execute([$name, $categoryId]);
    if ($checkStmt->fetch()) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Subcategory with this name already exists in this category']);
        exit;
    }
    
    // Get max sort order for this category
    $maxOrderStmt = $pdo->prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM product_subcategories WHERE category_id = ?");
    $maxOrderStmt->execute([$categoryId]);
    $nextOrder = $maxOrderStmt->fetch()['next_order'];
    
    $stmt = $pdo->prepare("INSERT INTO product_subcategories (category_id, name, status, sort_order) VALUES (?, ?, 'active', ?)");
    $stmt->execute([$categoryId, $name, $nextOrder]);
    
    $newId = $pdo->lastInsertId();
    
    echo json_encode([
        'success' => true,
        'data' => [
            'id' => (int)$newId,
            'category_id' => $categoryId,
            'name' => $name,
            'status' => 'active',
            'sort_order' => (int)$nextOrder,
            'product_count' => 0
        ]
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
