<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = getPDO();
    
    $categoryId = isset($_GET['category_id']) ? (int)$_GET['category_id'] : null;
    $status = $_GET['status'] ?? null;
    
    $sql = "SELECT 
                ps.id,
                ps.category_id,
                ps.name,
                ps.status,
                ps.sort_order,
                ps.created_at,
                ps.updated_at,
                0 as product_count
            FROM product_subcategories ps
            WHERE 1=1";
    
    $params = [];
    
    if ($categoryId) {
        $sql .= " AND ps.category_id = ?";
        $params[] = $categoryId;
    }
    
    if ($status === 'active') {
        $sql .= " AND ps.status = 'active'";
    } elseif ($status === 'archived') {
        $sql .= " AND ps.status = 'archived'";
    }
    
    $sql .= " ORDER BY ps.sort_order ASC, ps.name ASC";
    
    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);
    $subcategories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $subcategories
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
