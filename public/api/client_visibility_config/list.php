<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$clientId = isset($_GET['client_id']) ? (int)$_GET['client_id'] : 0;

if ($clientId <= 0) {
    jsonResponse(null, false, "INVALID_CLIENT_ID", 400);
}

$hasLabel = false;
try {
    $check = $pdo->prepare("
        SELECT COUNT(*)
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
          AND TABLE_NAME = 'client_visibility_config'
          AND COLUMN_NAME = 'visibility_label'
    ");
    $check->execute();
    $hasLabel = (int)$check->fetchColumn() > 0;
} catch (Throwable $e) {
    $hasLabel = false;
}

$labelSelect = $hasLabel ? "MAX(visibility_label) AS visibility_label" : "NULL AS visibility_label";

$stmt = $pdo->prepare("
    SELECT
        v.visibility_name,
        v.visibility_label,
        c.id,
        COALESCE(c.is_active, 0) AS is_active
    FROM (
        SELECT visibility_name, {$labelSelect}
        FROM client_visibility_config
        GROUP BY visibility_name
    ) v
    LEFT JOIN client_visibility_config c
        ON c.visibility_name = v.visibility_name
       AND c.client_id = ?
    ORDER BY v.visibility_name ASC
");

$stmt->execute([$clientId]);
jsonResponse($stmt->fetchAll());
