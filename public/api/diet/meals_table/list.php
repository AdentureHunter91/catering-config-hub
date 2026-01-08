<?php
declare(strict_types=1);

require_once __DIR__ . "/../../bootstrap.php";

header("Content-Type: application/json; charset=utf-8");

$pdo = getPDO();

$limit = (int)($_GET["limit"] ?? 50000);
if ($limit <= 0 || $limit > 200000) $limit = 50000;

$sql = "
SELECT
  meal_date,
  client_id,

  client_department_id,
  client_diet_id,
  client_meal_type_id,

  global_department_id,
  global_diet_id,
  global_meal_type_id,

  variant_label,

  quantity,
  status,
  is_after_cutoff,
  cutoff_at,
  updated_at,
  entry_id,

  contract_id,
  kitchen_id
FROM srv83804_client.v_meal_entries_picked_global
ORDER BY meal_date DESC, client_id, global_department_id, global_diet_id, global_meal_type_id, variant_label
LIMIT :lim
";

$stmt = $pdo->prepare($sql);
$stmt->bindValue(":lim", $limit, PDO::PARAM_INT);
$stmt->execute();

jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
