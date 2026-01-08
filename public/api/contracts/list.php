<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$clientId = isset($_GET['client_id']) ? (int)$_GET['client_id'] : 0;

if ($clientId > 0) {
    // kontrakty tylko dla wybranego klienta
    $stmt = $pdo->prepare("
        SELECT c.*, cl.short_name AS client_short_name
        FROM contracts c
        JOIN clients cl ON cl.id = c.client_id
        WHERE c.client_id = ?
        ORDER BY c.id DESC
    ");
    $stmt->execute([$clientId]);
    jsonResponse($stmt->fetchAll());
    exit;
}

// wszystkie kontrakty — dotychczasowe zachowanie
$stmt = $pdo->query("
    SELECT c.*, cl.short_name AS client_short_name
    FROM contracts c
    JOIN clients cl ON cl.id = c.client_id
    ORDER BY c.id DESC
");

jsonResponse($stmt->fetchAll());
