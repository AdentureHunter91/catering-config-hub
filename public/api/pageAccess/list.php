<?php
// /api/pageAccess/list.php
require_once __DIR__ . "/../bootstrap.php";

$stmt = $pdo->query("
    SELECT 
        pa.id,
        pa.page_key,
        pa.permission_view,
        pa.permission_read,
        pa.permission_edit,
        pa.is_active,
        pa.created_at,
        pa.updated_at
    FROM page_access pa
    ORDER BY pa.page_key ASC
");

$data = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($data);
