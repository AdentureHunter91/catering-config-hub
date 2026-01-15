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
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (empty($input['id'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Category ID is required']);
        exit;
    }
    
    $id = (int)$input['id'];
    $updates = [];
    $params = [];
    
    if (isset($input['name'])) {
        $name = trim($input['name']);
        if (empty($name)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Name cannot be empty']);
            exit;
        }
        
        // Check for duplicate name (excluding current)
        $checkStmt = $pdo->prepare("SELECT id FROM product_categories WHERE name = ? AND id != ? AND status = 'active'");
        $checkStmt->execute([$name, $id]);
        if ($checkStmt->fetch()) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Category with this name already exists']);
            exit;
        }
        
        $updates[] = "name = ?";
        $params[] = $name;
    }
    
    if (isset($input['status'])) {
        $updates[] = "status = ?";
        $params[] = $input['status'];
    }
    
    if (isset($input['sort_order'])) {
        $updates[] = "sort_order = ?";
        $params[] = (int)$input['sort_order'];
    }
    
    if (empty($updates)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'No fields to update']);
        exit;
    }
    
    $params[] = $id;
    $sql = "UPDATE product_categories SET " . implode(", ", $updates) . " WHERE id = ?";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    
    // Fetch updated category
    $fetchStmt = $pdo->prepare("SELECT * FROM product_categories WHERE id = ?");
    $fetchStmt->execute([$id]);
    $category = $fetchStmt->fetch();
    
    echo json_encode([
        'success' => true,
        'data' => $category
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
