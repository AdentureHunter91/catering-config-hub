<?php
require_once __DIR__ . '/../bootstrap.php';

function respond(bool $success, $payload = null, string $error = null): void {
    header('Content-Type: application/json');
    $out = ['success' => $success];
    if ($success) {
        $out['data'] = $payload;
    } else {
        $out['error'] = $error ?? 'Unknown error';
    }
    echo json_encode($out);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, null, 'Metoda niedozwolona');
}

$input = json_decode(file_get_contents('php://input'), true);
if (!is_array($input)) {
    respond(false, null, 'Nieprawidłowe dane wejściowe');
}

$id        = isset($input['id']) ? (int)$input['id'] : 0;
$email     = isset($input['email']) ? trim($input['email']) : '';
$firstName = isset($input['firstName']) ? trim($input['firstName']) : null;
$lastName  = isset($input['lastName']) ? trim($input['lastName']) : null;
$isActive  = isset($input['isActive']) ? (int)(bool)$input['isActive'] : 1;
$password  = isset($input['password']) ? (string)$input['password'] : '';

if ($id <= 0) {
    respond(false, null, 'Brak ID użytkownika');
}
if ($email === '') {
    respond(false, null, 'Email jest wymagany');
}

try {
    $params = [
        ':id'         => $id,
        ':email'      => $email,
        ':first_name' => $firstName,
        ':last_name'  => $lastName,
        ':is_active'  => $isActive,
    ];

    $sql = "
        UPDATE users
        SET email = :email,
            first_name = :first_name,
            last_name = :last_name,
            is_active = :is_active
    ";

    if ($password !== '') {
        $sql .= ", password_hash = :password_hash";
        $params[':password_hash'] = password_hash($password, PASSWORD_DEFAULT);
    }

    $sql .= " WHERE id = :id";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    respond(true, ['id' => $id]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        respond(false, null, 'Użytkownik z takim adresem email już istnieje');
    }
    respond(false, null, 'Błąd aktualizacji użytkownika');
} catch (Throwable $e) {
    respond(false, null, 'Błąd aktualizacji użytkownika');
}
