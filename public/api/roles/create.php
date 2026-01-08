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

$name        = isset($input['name']) ? trim($input['name']) : '';
$description = isset($input['description']) ? trim($input['description']) : null;

if ($name === '') {
    respond(false, null, 'Nazwa roli jest wymagana');
}

try {
    $stmt = $pdo->prepare("
        INSERT INTO roles (name, description)
        VALUES (:name, :description)
    ");
    $stmt->execute([
        ':name'        => $name,
        ':description' => $description,
    ]);

    $roleId = (int)$pdo->lastInsertId();
    respond(true, ['id' => $roleId]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        respond(false, null, 'Rola o takiej nazwie już istnieje');
    }
    respond(false, null, 'Błąd zapisu roli');
} catch (Throwable $e) {
    respond(false, null, 'Błąd zapisu roli');
}
