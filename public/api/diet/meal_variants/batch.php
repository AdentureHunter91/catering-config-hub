<?php
declare(strict_types=1);

require_once __DIR__ . "/../../bootstrap.php";

header("Content-Type: application/json; charset=utf-8");

$pdo = getPDO();

$raw = file_get_contents("php://input") ?: "";
$in = json_decode($raw, true);
if (!is_array($in)) {
    jsonResponse(null, false, "INVALID_JSON", 400);
}

$labels = $in["variant_labels"] ?? null;
if (!is_array($labels)) {
    jsonResponse(null, false, "INVALID_VARIANT_LABELS", 400);
}

// sanitize
$labels = array_values(array_unique(array_filter(array_map(function ($x) {
    $s = is_string($x) ? trim($x) : "";
    // proste zabezpieczenie na długość
    if ($s === "" || strlen($s) > 64) return null;
    return $s;
}, $labels))));

if (count($labels) === 0) {
    jsonResponse([]); // nic do pobrania
}
if (count($labels) > 500) {
    jsonResponse(null, false, "TOO_MANY_LABELS", 413);
}

// IN placeholders
$placeholders = implode(",", array_fill(0, count($labels), "?"));

$sql = "
SELECT
  variant_label,
  exclusions_json,
  menu_selection_json
FROM srv83804_client.meal_variants
WHERE variant_label IN ($placeholders)
";

$stmt = $pdo->prepare($sql);
$stmt->execute($labels);

jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
