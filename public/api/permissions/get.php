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
    respond(false, null, 'Brak ID uprawnienia');
}

try {
    $stmt = $pdo->prepare("
        SELECT id, name, description
        FROM permissions
        WHERE id = :id
        LIMIT 1
    ");
    $stmt->execute([':id' => $id]);

    $perm = $stmt->fetch(PDO::FETCH_ASSOC);
    if (!$perm) {
        respond(false, null, 'Nie znaleziono uprawnienia');
    }

    $payload = [
        'id'          => (int)$perm['id'],
        'name'        => $perm['name'],
        'description' => $perm['description'],
    ];

    respond(true, $payload);
} catch (Throwable $e) {
    respond(false, null, 'Błąd pobierania uprawnienia');
}
