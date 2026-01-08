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

try {
    $stmt = $pdo->query("
        SELECT 
            p.id,
            p.name,
            p.description,
            COUNT(rp.role_id) AS roles_count
        FROM permissions p
        LEFT JOIN role_permissions rp ON rp.permission_id = p.id
        GROUP BY p.id
        ORDER BY p.name
    ");

    $permissions = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $permissions[] = [
            'id'           => (int)$row['id'],
            'name'         => $row['name'],
            'description'  => $row['description'],
            'roles_count'  => (int)$row['roles_count'],
        ];
    }

    respond(true, $permissions);
} catch (Throwable $e) {
    respond(false, null, 'Błąd pobierania listy uprawnień');
}
