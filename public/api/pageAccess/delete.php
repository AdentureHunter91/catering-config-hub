<?php
// /Config/api/pageAccess/delete.php
require_once __DIR__ . "/../bootstrap.php";

$input = json_decode(file_get_contents("php://input"), true);
$id = isset($input['id']) ? (int)$input['id'] : 0;

if ($id <= 0) {
    echo json_encode(["success" => false, "error" => "Invalid id"]);
    exit;
}

try {
    $stmt = $pdo->prepare("DELETE FROM page_access WHERE id = :id");
    $stmt->execute([':id' => $id]);

    echo json_encode(["success" => true]);
} catch (Throwable $e) {
    echo json_encode(["success" => false, "error" => $e->getMessage()]);
}
