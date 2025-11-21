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

$id = isset($input['id']) ? (int)$input['id'] : 0;
if ($id <= 0) {
    respond(false, null, 'Brak ID roli');
}

try {
    $stmt = $pdo->prepare("DELETE FROM roles WHERE id = :id");
    $stmt->execute([':id' => $id]);

    respond(true, ['id' => $id]);
} catch (Throwable $e) {
    respond(false, null, 'Błąd usuwania roli');
}
