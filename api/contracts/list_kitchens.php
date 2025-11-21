<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$stmt = $pdo->query("
    SELECT id, name
    FROM kitchens
    ORDER BY name ASC
");

jsonResponse($stmt->fetchAll());
