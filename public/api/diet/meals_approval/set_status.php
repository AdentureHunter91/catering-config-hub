<?php
declare(strict_types=1);

require_once __DIR__ . "/../../bootstrap.php";

header("Content-Type: application/json; charset=utf-8");

$pdo = getPDO();

$raw = file_get_contents("php://input") ?: "";
$in = json_decode($raw, true);

$afterId = (int)($in["after_id"] ?? 0);
$action  = (string)($in["action"] ?? ""); // "approve" | "reject"
$user = requireLogin($pdo);
$userId = (int)($user["id"] ?? 0);

if ($afterId <= 0) {
    jsonResponse(null, false, "INVALID_AFTER_ID", 400);
}

$targetStatus = null;
if ($action === "approve") $targetStatus = "approved";
if ($action === "reject")  $targetStatus = "rejected";

if ($targetStatus === null) {
    jsonResponse(null, false, "INVALID_ACTION", 400);
}

/**
 * Zmieniamy status TYLKO dla:
 * - is_after_cutoff = 1
 * - status = pending_approval
 */
$stmt = $pdo->prepare("
    UPDATE srv83804_client.meal_entries
    SET status = ?,
        cutoff_decision_by = ?,
        cutoff_decision_at = NOW()
    WHERE id = ?
      AND is_after_cutoff = 1
      AND status = 'pending_approval'
    LIMIT 1
");
$stmt->execute([$targetStatus, $userId > 0 ? $userId : null, $afterId]);

if ($stmt->rowCount() !== 1) {
    // nic nie zmieniono: albo nie istnieje, albo już nie pending
    jsonResponse(null, false, "NOT_PENDING_OR_NOT_FOUND", 409);
}

// zwróć świeże dane (status + updated_at)
$stmt2 = $pdo->prepare("
    SELECT id, status, updated_at, cutoff_decision_by, cutoff_decision_at
    FROM srv83804_client.meal_entries
    WHERE id = ?
    LIMIT 1
");
$stmt2->execute([$afterId]);

$row = $stmt2->fetch(PDO::FETCH_ASSOC);
jsonResponse($row);
