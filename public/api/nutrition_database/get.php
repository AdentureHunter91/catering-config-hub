<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../db.php';

try {
    $id = isset($_GET['id']) ? intval($_GET['id']) : 0;
    
    if (!$id) {
        echo json_encode(["success" => false, "error" => "ID is required"]);
        exit;
    }
    
    $stmt = $pdo->prepare("SELECT * FROM nutrition_database WHERE id = ?");
    $stmt->execute([$id]);
    $data = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$data) {
        echo json_encode(["success" => false, "error" => "Record not found"]);
        exit;
    }
    
    echo json_encode(["success" => true, "data" => $data]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
