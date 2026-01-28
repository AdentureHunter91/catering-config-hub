<?php
declare(strict_types=1);

require_once __DIR__ . "/../../bootstrap.php";

header("Content-Type: application/json; charset=utf-8");

$pdo = getPDO();

$limit = (int)($_GET["limit"] ?? 50000);
if ($limit <= 0 || $limit > 200000) $limit = 50000;

$sql = "
SELECT
  v.meal_date,
  v.client_id,

  v.client_department_id,
  v.client_diet_id,
  v.client_meal_type_id,

  v.global_department_id,
  v.global_diet_id,
  v.global_meal_type_id,

  v.variant_label,

  v.quantity,
  v.status,
  v.is_after_cutoff,
  v.cutoff_at,
  v.updated_at,
  v.entry_id,

  v.contract_id,
  v.kitchen_id,

  mv.exclusions_json,
  mv.comment_text
FROM srv83804_client.v_meal_entries_picked_global v
LEFT JOIN (
  SELECT
    client_id,
    meal_date,
    department_id,
    diet_id,
    MAX(exclusions_json) AS exclusions_json,
    MAX(comment_text) AS comment_text
  FROM srv83804_client.meal_variants
  GROUP BY client_id, meal_date, department_id, diet_id
) mv
  ON mv.client_id = v.client_id
 AND mv.meal_date = v.meal_date
 AND mv.department_id = v.client_department_id
 AND mv.diet_id = v.client_diet_id
ORDER BY meal_date DESC, client_id, global_department_id, global_diet_id, global_meal_type_id, variant_label
LIMIT :lim
";

$stmt = $pdo->prepare($sql);
$stmt->bindValue(":lim", $limit, PDO::PARAM_INT);
$stmt->execute();

jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC));
