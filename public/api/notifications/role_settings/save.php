<?php
declare(strict_types=1);

require_once __DIR__ . "/../../bootstrap.php";

$pdo = getPDO();

$raw = file_get_contents("php://input") ?: "";
$in = json_decode($raw, true);

$roleId = (int)($in["role_id"] ?? 0);
$type = (string)($in["type"] ?? "diet_meal_approval_pending");
$inappEnabled = (int)($in["inapp_enabled"] ?? 0);
$emailEnabled = (int)($in["email_enabled"] ?? 0);

if ($roleId <= 0) {
    jsonResponse(null, false, "INVALID_ROLE_ID", 400);
}
if ($type === "") {
    $type = "diet_meal_approval_pending";
}

$stmt = $pdo->prepare("
    INSERT INTO notification_role_settings (role_id, type, inapp_enabled, email_enabled)
    VALUES (?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
        inapp_enabled = VALUES(inapp_enabled),
        email_enabled = VALUES(email_enabled),
        updated_at = CURRENT_TIMESTAMP
");
$stmt->execute([$roleId, $type, $inappEnabled ? 1 : 0, $emailEnabled ? 1 : 0]);

jsonResponse([
    "role_id" => $roleId,
    "type" => $type,
    "inapp_enabled" => $inappEnabled ? 1 : 0,
    "email_enabled" => $emailEnabled ? 1 : 0
]);
