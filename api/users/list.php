<?php
error_reporting(E_ALL);
ini_set("display_errors", 1);
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
    $q = isset($_GET['q']) ? trim($_GET['q']) : '';

    $sql = "
        SELECT 
            u.id,
            u.email,
            u.first_name,
            u.last_name,
            u.is_active,
            GROUP_CONCAT(r.name ORDER BY r.name SEPARATOR ',') AS roles
        FROM users u
        LEFT JOIN user_roles ur ON ur.user_id = u.id
        LEFT JOIN roles r ON r.id = ur.role_id
    ";

    $params = [];
    if ($q !== '') {
        $sql .= " WHERE (u.email LIKE :q OR u.first_name LIKE :q OR u.last_name LIKE :q)";
        $params[':q'] = '%' . $q . '%';
    }

    $sql .= " GROUP BY u.id ORDER BY u.last_name, u.first_name, u.email";

    $stmt = $pdo->prepare($sql);
    $stmt->execute($params);

    $users = [];
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        $users[] = [
            'id'         => (int)$row['id'],
            'email'      => $row['email'],
            'firstName'  => $row['first_name'],
            'lastName'   => $row['last_name'],
            'isActive'   => (bool)$row['is_active'],
            'roles'      => $row['roles'] ? explode(',', $row['roles']) : [],
        ];
    }

    respond(true, $users);
} catch (Throwable $e) {
    respond(false, null, $e->getMessage());
}
