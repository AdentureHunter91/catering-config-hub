<?php
declare(strict_types=1);

require_once __DIR__ . "/../bootstrap.php";

$pdo = getPDO();
$user = requireLogin($pdo);
$userId = (int)($user["id"] ?? 0);

$status = (string)($_GET["status"] ?? "open");
$type = (string)($_GET["type"] ?? "");
$unreadOnly = (int)($_GET["unread_only"] ?? 0) === 1;
$limit = (int)($_GET["limit"] ?? 50);
$offset = (int)($_GET["offset"] ?? 0);

if ($limit < 1) $limit = 50;
if ($limit > 200) $limit = 200;
if ($offset < 0) $offset = 0;

$params = [":user_id" => $userId, ":user_id2" => $userId];
$where = "ne.status = :status";
$params[":status"] = $status;

if ($type !== "") {
    $where .= " AND ne.type = :type";
    $params[":type"] = $type;
}

if ($unreadOnly) {
    $where .= " AND (nr.read_at IS NULL OR nr.read_at < ne.last_at)";
}

$sql = "
    SELECT
        ne.id,
        ne.type,
        ne.kitchen_id,
        ne.client_id,
        ne.meal_date,
        ne.count,
        ne.first_at,
        ne.last_at,
        ne.last_notified_at,
        ne.status,
        ne.created_at,
        ne.updated_at,
        nr.read_at,
        CASE
            WHEN nr.read_at IS NULL THEN 0
            WHEN nr.read_at < ne.last_at THEN 0
            ELSE 1
        END AS is_read,
        k.name AS kitchen_name,
        NULL AS kitchen_short_name,
        c.full_name AS client_full_name,
        c.short_name AS client_short_name
    FROM notification_events ne
    LEFT JOIN notification_reads nr
        ON nr.event_id = ne.id AND nr.user_id = :user_id
    LEFT JOIN srv83804_contracts.kitchens k
        ON k.id = ne.kitchen_id
    LEFT JOIN srv83804_contracts.clients c
        ON c.id = ne.client_id
    WHERE {$where}
      AND EXISTS (
        SELECT 1
        FROM user_roles ur
        JOIN notification_role_settings nrs
          ON nrs.role_id = ur.role_id
         AND nrs.type = ne.type
         AND nrs.inapp_enabled = 1
        WHERE ur.user_id = :user_id2
      )
    ORDER BY ne.last_at DESC, ne.id DESC
    LIMIT {$limit} OFFSET {$offset}
";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

jsonResponse([
    "rows" => $rows,
    "limit" => $limit,
    "offset" => $offset
]);
