<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();
$user = requireLogin($pdo);

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

$id          = isset($input['id']) ? (int)$input['id'] : 0;
$name        = isset($input['name']) ? trim($input['name']) : '';
$description = isset($input['description']) ? trim($input['description']) : null;

if ($id <= 0) {
    respond(false, null, 'Brak ID uprawnienia');
}
if ($name === '') {
    respond(false, null, 'Nazwa uprawnienia jest wymagana');
}

try {
    // Get old record for audit
    $oldRecord = getRecordForAudit($pdo, 'permissions', $id);
    
    $stmt = $pdo->prepare("
        UPDATE permissions
        SET name = :name,
            description = :description
        WHERE id = :id
    ");
    $stmt->execute([
        ':id'          => $id,
        ':name'        => $name,
        ':description' => $description,
    ]);
    
    // Audit log
    $newRecord = getRecordForAudit($pdo, 'permissions', $id);
    logAudit($pdo, 'permissions', $id, 'update', $oldRecord, $newRecord, $user['id'] ?? null);

    respond(true, ['id' => $id]);
} catch (PDOException $e) {
    if ($e->getCode() === '23000') {
        respond(false, null, 'Uprawnienie o takiej nazwie już istnieje');
    }
    respond(false, null, 'Błąd aktualizacji uprawnienia');
} catch (Throwable $e) {
    respond(false, null, 'Błąd aktualizacji uprawnienia');
}
