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
    
    if (empty($input['id']) || !isset($input['new_sort_order'])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'ID and new_sort_order are required']);
        exit;
    }
    
    $id = (int)$input['id'];
    $newSortOrder = (int)$input['new_sort_order'];
    
    // Get current subcategory
    $currentStmt = $pdo->prepare("SELECT * FROM product_subcategories WHERE id = ?");
    $currentStmt->execute([$id]);
    $current = $currentStmt->fetch();
    
    if (!$current) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Subcategory not found']);
        exit;
    }
    
    $categoryId = $current['category_id'];
    $oldSortOrder = $current['sort_order'];
    
    $pdo->beginTransaction();
    
    if ($newSortOrder < $oldSortOrder) {
        // Moving up - shift items down
        $shiftStmt = $pdo->prepare("
            UPDATE product_subcategories 
            SET sort_order = sort_order + 1 
            WHERE category_id = ? AND sort_order >= ? AND sort_order < ? AND id != ?
        ");
        $shiftStmt->execute([$categoryId, $newSortOrder, $oldSortOrder, $id]);
    } else {
        // Moving down - shift items up
        $shiftStmt = $pdo->prepare("
            UPDATE product_subcategories 
            SET sort_order = sort_order - 1 
            WHERE category_id = ? AND sort_order > ? AND sort_order <= ? AND id != ?
        ");
        $shiftStmt->execute([$categoryId, $oldSortOrder, $newSortOrder, $id]);
    }
    
    // Update the moved item
    $updateStmt = $pdo->prepare("UPDATE product_subcategories SET sort_order = ? WHERE id = ?");
    $updateStmt->execute([$newSortOrder, $id]);
    
    $pdo->commit();
    
    echo json_encode([
        'success' => true,
        'message' => 'Sort order updated successfully'
    ]);
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
