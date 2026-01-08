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
            r.id,
            r.name,
            r.description,
            COUNT(ur.user_id) AS user_count
        FROM roles r
        LEFT JOIN user_roles ur ON ur.role_id = r.id
        GROUP BY r.id
        ORDER BY r.name
    ");

    $roles = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $roles[] = [
            'id'         => (int)$row['id'],
            'name'       => $row['name'],
            'description'=> $row['description'],
            'userCount'  => (int)$row['user_count'],
        ];
    }

    respond(true, $roles);
} catch (Throwable $e) {
    respond(false, null, 'Błąd pobierania listy ról');
}
