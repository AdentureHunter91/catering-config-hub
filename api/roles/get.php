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

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;
if ($id <= 0) {
    respond(false, null, 'Brak ID roli');
}

try {
    $stmt = $pdo->prepare("
        SELECT id, name, description
        FROM roles
        WHERE id = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $id]);
    $role = $stmt->fetch(PDO::FETCH_ASSOC);

    if (!$role) {
        respond(false, null, 'Nie znaleziono roli');
    }

    $stmtPerm = $pdo->prepare("
        SELECT permission_id
        FROM role_permissions
        WHERE role_id = :id
    ");
    $stmtPerm->execute([':id' => $id]);
    $permIds = array_map('intval', $stmtPerm->fetchAll(PDO::FETCH_COLUMN));

    $payload = [
        'id'          => (int)$role['id'],
        'name'        => $role['name'],
        'description' => $role['description'],
        'permissions' => $permIds,
    ];

    respond(true, $payload);
} catch (Throwable $e) {
    respond(false, null, 'Błąd pobierania danych roli');
}
