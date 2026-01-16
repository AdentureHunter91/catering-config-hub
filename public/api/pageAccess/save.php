<?php
// /api/pageAccess/save.php
require_once __DIR__ . "/../bootstrap.php";

$pdo = getPDO();
$user = requireLogin($pdo);

$input = json_decode(file_get_contents("php://input"), true);

$id = isset($input['id']) ? (int)$input['id'] : 0;
$page_key = trim($input['page_key'] ?? '');
$permission_view = trim($input['permission_view'] ?? '');
$permission_read = trim($input['permission_read'] ?? '');
$permission_edit = trim($input['permission_edit'] ?? '');
$is_active = isset($input['is_active']) ? (int)$input['is_active'] : 1;

if ($page_key === '') {
    echo json_encode(["success" => false, "error" => "Brak page_key"]);
    exit;
}

try {
    if ($id > 0) {
        // Get old record for audit
        $oldRecord = getRecordForAudit($pdo, 'page_access', $id);
        
        // update
        $stmt = $pdo->prepare("
            UPDATE page_access
            SET page_key = :page_key,
                permission_view = :permission_view,
                permission_read = :permission_read,
                permission_edit = :permission_edit,
                is_active = :is_active
            WHERE id = :id
        ");

        $stmt->execute([
            ':page_key' => $page_key,
            ':permission_view' => $permission_view ?: null,
            ':permission_read' => $permission_read ?: null,
            ':permission_edit' => $permission_edit ?: null,
            ':is_active' => $is_active,
            ':id' => $id
        ]);
        
        // Audit log
        $newRecord = getRecordForAudit($pdo, 'page_access', $id);
        logAudit($pdo, 'page_access', $id, 'update', $oldRecord, $newRecord, $user['id'] ?? null);

    } else {
        // insert
        $stmt = $pdo->prepare("
            INSERT INTO page_access (page_key, permission_view, permission_read, permission_edit, is_active)
            VALUES (:page_key, :permission_view, :permission_read, :permission_edit, :is_active)
        ");

        $stmt->execute([
            ':page_key' => $page_key,
            ':permission_view' => $permission_view ?: null,
            ':permission_read' => $permission_read ?: null,
            ':permission_edit' => $permission_edit ?: null,
            ':is_active' => $is_active
        ]);

        $id = (int)$pdo->lastInsertId();
        
        // Audit log
        $newRecord = getRecordForAudit($pdo, 'page_access', $id);
        logAudit($pdo, 'page_access', $id, 'insert', null, $newRecord, $user['id'] ?? null);
    }

    echo json_encode(["success" => true, "id" => $id]);

} catch (Throwable $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
