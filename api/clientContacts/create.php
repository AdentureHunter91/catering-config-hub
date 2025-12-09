<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$authUser = requireLogin($pdo);
// opcjonalnie: requirePermission($pdo, 'config.clients_list.edit');

// ustawiamy current_user_id dla triggerów (jak w innych modułach)
if (!empty($authUser['id'])) {
    $setUser = $pdo->prepare("SET @current_user_id = :uid");
    $setUser->execute(['uid' => (int)$authUser['id']]);
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];

$clientId = (int)($data['client_id'] ?? 0);
if ($clientId <= 0) {
    jsonResponse(null, false, 'INVALID_CLIENT_ID', 400);
}

$fullName = $data['full_name'] ?? null;
$position = $data['position'] ?? null;
$phone    = $data['phone'] ?? null;
$email    = $data['email'] ?? null;
$notes    = $data['notes'] ?? null;

$stmt = $pdo->prepare("
    INSERT INTO client_contacts (client_id, full_name, position, phone, email, notes)
    VALUES (:client_id, :full_name, :position, :phone, :email, :notes)
");
$stmt->execute([
    'client_id' => $clientId,
    'full_name' => $fullName,
    'position'  => $position,
    'phone'     => $phone,
    'email'     => $email,
    'notes'     => $notes,
]);

$id = (int)$pdo->lastInsertId();

$stmt2 = $pdo->prepare("
    SELECT id, client_id, full_name, position, phone, email, notes
    FROM client_contacts
    WHERE id = :id
");
$stmt2->execute(['id' => $id]);
$row = $stmt2->fetch(PDO::FETCH_ASSOC);

jsonResponse($row, true, null);
