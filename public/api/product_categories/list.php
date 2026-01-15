<?php
declare(strict_types=1);
require_once __DIR__ . '/../bootstrap.php';

header('Content-Type: application/json; charset=utf-8');

try {
    $pdo = getPDO();
    
    $status = $_GET['status'] ?? 'active';
    
    $sql = "SELECT 
                pc.id,
                pc.name,
                pc.status,
                pc.sort_order,
                pc.created_at,
                pc.updated_at,
                COUNT(ps.id) as subcategory_count
            FROM product_categories pc
            LEFT JOIN product_subcategories ps ON ps.category_id = pc.id AND ps.status = 'active'";
    
    if ($status === 'active') {
        $sql .= " WHERE pc.status = 'active'";
    } elseif ($status === 'archived') {
        $sql .= " WHERE pc.status = 'archived'";
    }
    
    $sql .= " GROUP BY pc.id ORDER BY pc.sort_order ASC, pc.name ASC";
    
    $stmt = $pdo->query($sql);
    $categories = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode([
        'success' => true,
        'data' => $categories
    ]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ]);
}
