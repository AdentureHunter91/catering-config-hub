<?php
// /api/pageAccess/get.php
require_once __DIR__ . "/../bootstrap.php";

$id = isset($_GET['id']) ? (int)$_GET['id'] : 0;

if ($id <= 0) {
    echo json_encode(["success" => false, "error" => "Invalid id"]);
    exit;
}

$stmt = $pdo->prepare("
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
    WHERE pa.id = :id
    LIMIT 1
");
$stmt->execute([':id' => $id]);

$row = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$row) {
    echo json_encode(["success" => false, "error" => "Not found"]);
    exit;
}

echo json_encode(["success" => true, "data" => $row]);
