<?php
declare(strict_types=1);

require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$authUser = requireLogin($pdo);
// opcjonalnie: requirePermission($pdo, 'config.clients_list.edit');

if (!empty($authUser['id'])) {
    $setUser = $pdo->prepare("SET @current_user_id = :uid");
    $setUser->execute(['uid' => (int)$authUser['id']]);
}

$data = json_decode(file_get_contents('php://input'), true) ?? [];
$id = (int)($data['id'] ?? 0);

if ($id <= 0) {
    jsonResponse(null, false, 'INVALID_ID', 400);
}

$fullName = $data['full_name'] ?? null;
$position = $data['position'] ?? null;
$phone    = $data['phone'] ?? null;
$email    = $data['email'] ?? null;
$notes    = $data['notes'] ?? null;

$stmt = $pdo->prepare("
    UPDATE client_contacts
    SET full_name = :full_name,
        position  = :position,
        phone     = :phone,
        email     = :email,
        notes     = :notes
    WHERE id = :id
");
$stmt->execute([
    'id'        => $id,
    'full_name' => $fullName,
    'position'  => $position,
    'phone'     => $phone,
    'email'     => $email,
    'notes'     => $notes,
]);

// zwracamy aktualny stan rekordu
$stmt2 = $pdo->prepare("
    SELECT id, client_id, full_name, position, phone, email, notes
    FROM client_contacts
    WHERE id = :id
");
$stmt2->execute(['id' => $id]);
$row = $stmt2->fetch(PDO::FETCH_ASSOC);

jsonResponse($row, true, null);
