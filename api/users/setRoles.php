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

$userId  = isset($input['userId']) ? (int)$input['userId'] : 0;
$roleIds = isset($input['roleIds']) && is_array($input['roleIds']) ? $input['roleIds'] : [];

if ($userId <= 0) {
    respond(false, null, 'Brak ID użytkownika');
}

try {
    $pdo->beginTransaction();

    $stmtDel = $pdo->prepare("DELETE FROM user_roles WHERE user_id = :user_id");
    $stmtDel->execute([':user_id' => $userId]);

    if (!empty($roleIds)) {
        $stmtIns = $pdo->prepare("
            INSERT INTO user_roles (user_id, role_id)
            VALUES (:user_id, :role_id)
        ");

        foreach ($roleIds as $roleId) {
            $roleId = (int)$roleId;
            if ($roleId > 0) {
                $stmtIns->execute([
                    ':user_id' => $userId,
                    ':role_id' => $roleId,
                ]);
            }
        }
    }

    $pdo->commit();
    respond(true, ['userId' => $userId, 'roles' => array_map('intval', $roleIds)]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    respond(false, null, 'Błąd aktualizacji ról użytkownika');
}
