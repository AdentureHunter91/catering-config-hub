<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$stmt = $pdo->query("
    SELECT 
        id,
        name,
        short_name,
        sort_order,
        description
    FROM meal_types
    ORDER BY sort_order ASC, name ASC
");

jsonResponse($stmt->fetchAll());
