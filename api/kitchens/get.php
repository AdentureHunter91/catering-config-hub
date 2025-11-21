<?php
declare(strict_types=1);

require_once $_SERVER['DOCUMENT_ROOT'] . "/Config/api/bootstrap.php";

$id = intval($_GET['id'] ?? 0);
if ($id <= 0) {
    jsonResponse(null, false, "Invalid kitchen id", 400);
}

$sql = "SELECT id, name, city, address, nip FROM kitchens WHERE id = ?";
$stmt = $db->prepare($sql);
$stmt->execute([$id]);
$kitchen = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$kitchen) {
    jsonResponse(null, false, "Kitchen not found", 404);
}

jsonResponse($kitchen, true);
