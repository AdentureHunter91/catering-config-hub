<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$authUser = requireLogin($pdo);
// opcjonalnie: requirePermission($pdo, 'config.clients_list.read');

$clientId = isset($_GET['client_id']) ? (int)$_GET['client_id'] : 0;
if ($clientId <= 0) {
    jsonResponse(null, false, 'INVALID_CLIENT_ID', 400);
}

$stmt = $pdo->prepare("
    SELECT id, client_id, full_name, position, phone, email, notes
    FROM client_contacts
    WHERE client_id = :cid
    ORDER BY id
");
$stmt->execute(['cid' => $clientId]);

$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

jsonResponse($rows, true, null);
