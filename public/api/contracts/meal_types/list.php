<?php


// ŁADUJEMY bootstrap Z PUBLIC_HTML, a nie z PRIVATE_HTML
require_once __DIR__ . "/../../bootstrap.php";

$contractId = intval($_GET['contract_id'] ?? 0);
if ($contractId <= 0) {
    echo json_encode(["success" => false, "data" => null, "error" => "Invalid contract_id"]);
    exit;
}

$db = getDB();

// Pobieramy client_id
$stmt = $db->prepare("SELECT client_id FROM contracts WHERE id = ?");
$stmt->execute([$contractId]);
$clientId = $stmt->fetchColumn();

if (!$clientId) {
    echo json_encode(["success" => false, "data" => null, "error" => "Contract not found"]);
    exit;
}

$sql = "
SELECT 
    cmt.id AS client_meal_type_id,
    cmt.custom_name,
    cmt.custom_short_name,
    cmt.custom_sort_order,
    mt.name AS global_name,
    mt.short_name AS global_short,
    mt.sort_order AS global_sort,
    IFNULL(cmts.is_active, 1) AS is_active,
    cmts.cutoff_time,
    cmts.cutoff_days_offset,
    cmts.copy_from_client_meal_type_id
FROM client_meal_types cmt
JOIN meal_types mt ON mt.id = cmt.meal_type_id
LEFT JOIN contract_meal_type_settings cmts 
    ON cmts.client_meal_type_id = cmt.id AND cmts.contract_id = ?
WHERE cmt.client_id = ?
ORDER BY COALESCE(cmt.custom_sort_order, mt.sort_order), cmt.id
";

$stmt = $db->prepare($sql);
$stmt->execute([$contractId, $clientId]);

$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode(["success" => true, "data" => $rows]);
