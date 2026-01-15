<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../db.php';

try {
    $limit = isset($_GET['limit']) ? intval($_GET['limit']) : 20;
    
    $stmt = $pdo->prepare("SELECT * FROM nutrition_database_uploads ORDER BY uploaded_at DESC LIMIT ?");
    $stmt->execute([$limit]);
    $data = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    echo json_encode(["success" => true, "data" => $data]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
