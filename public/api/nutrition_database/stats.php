<?php
header("Content-Type: application/json");
require_once __DIR__ . '/../db.php';

try {
    // Get count of records
    $countStmt = $pdo->query("SELECT COUNT(*) as count FROM nutrition_database");
    $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Get last upload info
    $lastUploadStmt = $pdo->query("SELECT * FROM nutrition_database_uploads WHERE status = 'success' ORDER BY uploaded_at DESC LIMIT 1");
    $lastUpload = $lastUploadStmt->fetch(PDO::FETCH_ASSOC);
    
    echo json_encode([
        "success" => true, 
        "data" => [
            "records_count" => intval($count),
            "last_upload" => $lastUpload
        ]
    ]);
} catch (PDOException $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
