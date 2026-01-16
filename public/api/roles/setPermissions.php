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

$roleId      = isset($input['roleId']) ? (int)$input['roleId'] : 0;
$permissionIds = isset($input['permissionIds']) && is_array($input['permissionIds'])
    ? $input['permissionIds']
    : [];

if ($roleId <= 0) {
    respond(false, null, 'Brak ID roli');
}

try {
    // Get old permissions for audit
    $oldPermsStmt = $pdo->prepare("SELECT permission_id FROM role_permissions WHERE role_id = :role_id");
    $oldPermsStmt->execute([':role_id' => $roleId]);
    $oldPerms = $oldPermsStmt->fetchAll(PDO::FETCH_COLUMN);
    
    $pdo->beginTransaction();

    $stmtDel = $pdo->prepare("DELETE FROM role_permissions WHERE role_id = :role_id");
    $stmtDel->execute([':role_id' => $roleId]);

    if (!empty($permissionIds)) {
        $stmtIns = $pdo->prepare("
            INSERT INTO role_permissions (role_id, permission_id)
            VALUES (:role_id, :permission_id)
        ");
        foreach ($permissionIds as $pid) {
            $pid = (int)$pid;
            if ($pid > 0) {
                $stmtIns->execute([
                    ':role_id'       => $roleId,
                    ':permission_id' => $pid,
                ]);
            }
        }
    }

    $pdo->commit();
    
    // Audit log
    logAudit($pdo, 'role_permissions', $roleId, 'update', 
        ['role_id' => $roleId, 'permission_ids' => $oldPerms], 
        ['role_id' => $roleId, 'permission_ids' => array_map('intval', $permissionIds)], 
        $user['id'] ?? null
    );
    
    respond(true, [
        'roleId'        => $roleId,
        'permissionIds' => array_map('intval', $permissionIds),
    ]);
} catch (Throwable $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    respond(false, null, 'Błąd aktualizacji uprawnień roli');
}
