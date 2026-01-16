<?php
declare(strict_types=1);
error_reporting(E_ALL);
ini_set("display_errors", "0");

require_once __DIR__ . "/../bootstrap.php";
header('Cache-Control: no-store');

try {
    $id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
    
    if (!$id) {
        jsonResponse(null, false, 'ID is required', 400);
    }
    
    $stmt = $pdo->prepare("SELECT * FROM nutrition_database WHERE id = ?");
    $stmt->execute([$id]);
    $data = $stmt->fetch();
    
    if (!$data) {
        jsonResponse(null, false, 'Record not found', 404);
    }
    
    jsonResponse($data);
} catch (Throwable $e) {
    jsonResponse(null, false, $e->getMessage(), 500);
}
