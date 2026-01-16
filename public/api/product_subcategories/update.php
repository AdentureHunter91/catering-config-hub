<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' && $_SERVER['REQUEST_METHOD'] !== 'PUT') {
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
        echo json_encode(['success' => false, 'error' => 'Subcategory ID is required']);
        exit;
    }
    
    $id = (int)$input['id'];
    
    // Get old record for audit
    $oldRecord = getRecordForAudit($pdo, 'product_subcategories', $id);
    
    $updates = [];
    $params = [];
    
    if (isset($input['name'])) {
        $name = trim($input['name']);
        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Name cannot be empty']);
            exit;
        }
        $updates[] = "name = ?";
        $params[] = $name;
    }
    
    if (isset($input['category_id'])) {
        $categoryId = (int)$input['category_id'];
        
        // Check if category exists
        $catStmt = $pdo->prepare("SELECT id FROM product_categories WHERE id = ?");
        $catStmt->execute([$categoryId]);
        if (!$catStmt->fetch()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Target category not found']);
            exit;
        }
        
        // Get max sort order for new category
        $maxOrderStmt = $pdo->prepare("SELECT COALESCE(MAX(sort_order), 0) + 1 as next_order FROM product_subcategories WHERE category_id = ?");
        $maxOrderStmt->execute([$categoryId]);
        $nextOrder = $maxOrderStmt->fetch()['next_order'];
        
        $updates[] = "category_id = ?";
        $params[] = $categoryId;
        $updates[] = "sort_order = ?";
        $params[] = $nextOrder;
    }
    
    if (isset($input['status'])) {
        $updates[] = "status = ?";
        $params[] = $input['status'];
    }
    
    if (isset($input['sort_order']) && !isset($input['category_id'])) {
        $updates[] = "sort_order = ?";
        $params[] = (int)$input['sort_order'];
    }
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No fields to update']);
        exit;
    }
    
    $params[] = $id;
    $sql = "UPDATE product_subcategories SET " . implode(", ", $updates) . " WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Audit log
    $newRecord = getRecordForAudit($pdo, 'product_subcategories', $id);
    logAudit($pdo, 'product_subcategories', $id, 'update', $oldRecord, $newRecord, $user['id'] ?? null);
    
    // Fetch updated subcategory
    $fetchStmt = $pdo->prepare("SELECT * FROM product_subcategories WHERE id = ?");
    $fetchStmt->execute([$id]);
    $subcategory = $fetchStmt->fetch();
    
    echo json_encode([
        'success' => true,
        'data' => $subcategory
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
