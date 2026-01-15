<?php
declare(strict_types=1);
error_reporting(E_ALL);
ini_set("display_errors", "0");

require_once __DIR__ . "/../bootstrap.php";
header('Cache-Control: no-store');

try {
    // Get count of records
    $countStmt = $pdo->query("SELECT COUNT(*) as count FROM nutrition_database");
    $countRow = $countStmt->fetch();
    $count = isset($countRow['count']) ? (int)$countRow['count'] : 0;

    // Get last upload info (optional; don't fail the whole endpoint if uploads table is empty/missing)
    $lastUpload = null;
    try {
        $lastUploadStmt = $pdo->query("SELECT * FROM nutrition_database_uploads WHERE status = 'success' ORDER BY uploaded_at DESC LIMIT 1");
        $lastUpload = $lastUploadStmt->fetch() ?: null;
    } catch (Throwable $e) {
        $lastUpload = null;
    }

    jsonResponse([
        'records_count' => $count,
        'last_upload' => $lastUpload,
    ]);
} catch (Throwable $e) {
    jsonResponse(null, false, $e->getMessage(), 500);
}
