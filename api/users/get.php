<?php
require_once __DIR__ . '/../bootstrap.php';

// UPEWNIJ SIĘ, ŻE MASZ TO:
$pdo = $db;

function respond(bool $success, $payload = null, string $error = null): void {
    header('Content-Type: application/json; charset=utf-8');
    $out = ['success' => $success];
    if ($success) {
        $out['data'] = $payload;
    } else {
        $out['error'] = $error ?? 'Unknown error';
    }
    echo json_encode($out, JSON_UNESCAPED_UNICODE);
    exit;
}

/* GET /users/get.php?id=5 */
if (!isset($_GET['id'])) {
    respond(false, null, "Brak ID użytkownika");
}

$id = (int)$_GET['id'];
if ($id <= 0) {
    respond(false, null, "Niepoprawne ID użytkownika");
}

try {
    // pobieramy użytkownika, od razu z aliasami pod camelCase
    $stmt = $pdo->prepare("
        SELECT 
            id,
            email,
            first_name AS firstName,
            last_name  AS lastName,
            is_active  AS isActive
        FROM users
        WHERE id = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $id]);
    $user = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$user) {
        respond(false, null, "Użytkownik nie istnieje");
    }

    // pobieramy role użytkownika
    $stmtRoles = $pdo->prepare("
        SELECT r.id, r.name, r.description
        FROM user_roles ur
        JOIN roles r ON r.id = ur.role_id
        WHERE ur.user_id = :id
    ");
    $stmtRoles->execute([':id' => $id]);
    $roles = $stmtRoles->fetchAll(PDO::FETCH_ASSOC);

    // budujemy payload dokładnie pod to, czego oczekuje frontend
    $out = [
        'id'        => (int)$user['id'],
        'email'     => $user['email'],
        'firstName' => $user['firstName'],
        'lastName'  => $user['lastName'],
        'isActive'  => (bool)$user['isActive'],
        'roles'     => array_map(function ($r) {
            return [
                'id'          => (int)$r['id'],
                'name'        => $r['name'],
                'description' => $r['description'],
            ];
        }, $roles),
    ];

    respond(true, $out);

} catch (Throwable $e) {
    respond(false, null, "Błąd pobierania użytkownika");
}
