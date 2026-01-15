<?php
declare(strict_types=1);
error_reporting(E_ALL);
ini_set("display_errors", "0");

require_once __DIR__ . "/../bootstrap.php";
header('Cache-Control: no-store');

try {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
    $limit = max(1, min($limit, 200));

    // With native prepares (ATTR_EMULATE_PREPARES=false) LIMIT placeholders can be finicky on some hosts,
    // so we interpolate a validated integer.
    $stmt = $pdo->prepare("SELECT * FROM nutrition_database_uploads ORDER BY uploaded_at DESC LIMIT {$limit}");
    $stmt->execute();
    $data = $stmt->fetchAll();

    jsonResponse($data);
} catch (Throwable $e) {
    jsonResponse(null, false, $e->getMessage(), 500);
}
