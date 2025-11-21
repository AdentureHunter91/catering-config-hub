<?php
require_once __DIR__ . '/../../bootstrap.php';
$pdo = getPDO();

$client_id = (int)($_GET['client_id'] ?? 0);
if ($client_id <= 0) {
    jsonResponse(null, false, "Invalid client_id", 422);
}

$stmt = $pdo->prepare("
    SELECT 
        mt.id AS meal_type_id,
        mt.name,
        mt.short_name,
        mt.sort_order,

        cmt.id AS client_meal_type_id,
        cmt.custom_name,
        cmt.custom_short_name,
        cmt.custom_sort_order,
        COALESCE(cmt.is_active, 0) AS is_active
    FROM meal_types mt
    LEFT JOIN client_meal_types cmt
        ON cmt.meal_type_id = mt.id AND cmt.client_id = ?
    ORDER BY mt.sort_order ASC
");
$stmt->execute([$client_id]);

jsonResponse($stmt->fetchAll());
