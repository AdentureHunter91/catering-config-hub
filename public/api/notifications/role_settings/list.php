<?php
declare(strict_types=1);

require_once __DIR__ . "/../../bootstrap.php";

$pdo = getPDO();

$type = (string)($_GET["type"] ?? "diet_meal_approval_pending");
if ($type === "") {
    $type = "diet_meal_approval_pending";
}

$stmt = $pdo->prepare("
    SELECT
        r.id AS role_id,
        r.name AS role_name,
        r.description AS role_description,
        s.inapp_enabled,
        s.email_enabled
    FROM roles r
    LEFT JOIN notification_role_settings s
        ON s.role_id = r.id AND s.type = ?
    ORDER BY r.id ASC
");
$stmt->execute([$type]);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

jsonResponse([
    "type" => $type,
    "rows" => $rows
]);
