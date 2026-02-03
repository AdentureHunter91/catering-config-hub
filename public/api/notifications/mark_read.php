<?php
declare(strict_types=1);

require_once __DIR__ . "/../bootstrap.php";

$pdo = getPDO();
$user = requireLogin($pdo);
$userId = (int)($user["id"] ?? 0);

$raw = file_get_contents("php://input") ?: "";
$in = json_decode($raw, true);
if (!is_array($in)) {
    $in = [];
}

// Fallback for non-JSON posts or query params
if (empty($in) && !empty($_POST)) {
    $in = $_POST;
}
if (empty($in) && !empty($_GET)) {
    $in = $_GET;
}

$eventId = (int)($in["event_id"] ?? 0);
$eventIds = $in["event_ids"] ?? null;
if (is_string($eventIds)) {
    $eventIds = array_filter(array_map("trim", explode(",", $eventIds)));
}

$ids = [];
if ($eventId > 0) {
    $ids[] = $eventId;
}
if (is_array($eventIds)) {
    foreach ($eventIds as $id) {
        $id = (int)$id;
        if ($id > 0) $ids[] = $id;
    }
}

$ids = array_values(array_unique($ids));
if (count($ids) === 0) {
    jsonResponse(null, false, "INVALID_EVENT_ID", 400);
}

$now = (new DateTimeImmutable("now"))->format("Y-m-d H:i:s");

$stmt = $pdo->prepare("
    INSERT INTO notification_reads (event_id, user_id, read_at)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE read_at = VALUES(read_at)
");

foreach ($ids as $id) {
    $stmt->execute([$id, $userId, $now]);
}

jsonResponse([
    "updated" => count($ids)
]);
