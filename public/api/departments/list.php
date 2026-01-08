<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$stmt = $pdo->query("
    SELECT 
        id,
        name,
        short_name,
        description
    FROM departments
    ORDER BY name ASC
");

jsonResponse($stmt->fetchAll());