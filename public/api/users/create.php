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

$email     = isset($input['email']) ? trim($input['email']) : '';
$firstName = isset($input['firstName']) ? trim($input['firstName']) : null;
$lastName  = isset($input['lastName']) ? trim($input['lastName']) : null;
$isActive  = isset($input['isActive']) ? (int)(bool)$input['isActive'] : 1;
$password  = isset($input['password']) ? (string)$input['password'] : '';
$roles     = isset($input['roles']) && is_array($input['roles']) ? $input['roles'] : [];

if ($email === '' || $password === '') {
    respond(false, null, 'Email i hasło są wymagane');
}

try {
    $pdo->beginTransaction();

    $passwordHash = password_hash($password, PASSWORD_DEFAULT);

    $stmt = $pdo->prepare("
        INSERT INTO users (email, password_hash, first_name, last_name, is_active)
        VALUES (:email, :password_hash, :first_name, :last_name, :is_active)
    ");
    $stmt->execute([
        ':email'         => $email,
        ':password_hash' => $passwordHash,
        ':first_name'    => $firstName,
        ':last_name'     => $lastName,
        ':is_active'     => $isActive,
    ]);

    $userId = (int)$pdo->lastInsertId();

    if (!empty($roles)) {
        $stmtRole = $pdo->prepare("
            INSERT INTO user_roles (user_id, role_id)
            VALUES (:user_id, :role_id)
        ");
        foreach ($roles as $roleId) {
            $roleId = (int)$roleId;
            if ($roleId > 0) {
                $stmtRole->execute([
                    ':user_id' => $userId,
                    ':role_id' => $roleId,
                ]);
            }
        }
    }

    $pdo->commit();

    respond(true, ['id' => $userId]);
} catch (PDOException $e) {
    $pdo->rollBack();
    if ($e->getCode() === '23000') {
        respond(false, null, 'Użytkownik z takim adresem email już istnieje');
    }
    respond(false, null, 'Błąd zapisu użytkownika');
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    respond(false, null, 'Błąd zapisu użytkownika');
}
