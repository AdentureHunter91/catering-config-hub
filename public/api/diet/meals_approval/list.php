<?php
declare(strict_types=1);

require_once __DIR__ . "/../../bootstrap.php";

header("Content-Type: application/json; charset=utf-8");

$pdo = getPDO();

/**
 * Lista korekt po czasie (do akceptacji) + mapowanie custom->global ID + kitchen_id.
 * Bez filtrowania (front filtruje po pobraniu).
 *
 * kitchen_id wyliczamy tak samo jak w widoku:
 * - dobieramy kontrakt po client_id + meal_date w zakresie + status active/planned (preferuj active)
 * - dobieramy kitchen_period po contract_id + meal_date w zakresie start/end (NULL end_date => do końca kontraktu)
 */
$sql = "
WITH base AS (
  SELECT
    a.meal_date,
    a.client_id,

    -- lokalne (custom klienta)
    a.department_id     AS client_department_id,
    a.diet_id           AS client_diet_id,
    a.meal_type_id      AS client_meal_type_id,

    -- GLOBALNE ID (do filtrowania)
    cd.department_id    AS global_department_id,
    cdi.diet_id         AS global_diet_id,
    cmt.meal_type_id    AS global_meal_type_id,

    a.quantity          AS qty_after,
    p.quantity          AS qty_before,
    (a.quantity - IFNULL(p.quantity, 0)) AS qty_diff,

    a.status,
    a.updated_at,
    a.cutoff_at,
    TIMESTAMPDIFF(MINUTE, a.cutoff_at, a.updated_at) AS minutes_after_cutoff,
    a.cutoff_decision_by,
    a.cutoff_decision_at,

    a.id AS after_id,
    p.id AS before_id

  FROM srv83804_client.meal_entries a

  /* mapowanie custom -> global */
  LEFT JOIN srv83804_contracts.client_departments cd
    ON cd.id = a.department_id
   AND cd.client_id = a.client_id

  LEFT JOIN srv83804_contracts.client_diets cdi
    ON cdi.id = a.diet_id
   AND cdi.client_id = a.client_id

  LEFT JOIN srv83804_contracts.client_meal_types cmt
    ON cmt.id = a.meal_type_id
   AND cmt.client_id = a.client_id

  /* poprzedni wpis (w terminie) dla tego samego klucza */
  LEFT JOIN srv83804_client.meal_entries p
    ON p.id = (
      SELECT p2.id
      FROM srv83804_client.meal_entries p2
      WHERE p2.meal_date        = a.meal_date
        AND p2.client_id        = a.client_id
        AND p2.department_id    = a.department_id
        AND p2.diet_id          = a.diet_id
        AND p2.meal_type_id     = a.meal_type_id
        AND p2.is_after_cutoff  = 0
      ORDER BY p2.updated_at DESC, p2.id DESC
      LIMIT 1
    )

  WHERE a.is_after_cutoff = 1
    AND a.status IN ('pending_approval','approved','rejected')
),

contract_pick AS (
  SELECT
    b.*,
    c.id AS contract_id,
    c.start_date AS contract_start_date,
    c.end_date   AS contract_end_date,
    c.status     AS contract_status,
    ROW_NUMBER() OVER (
      PARTITION BY b.after_id
      ORDER BY
        CASE WHEN c.status = 'active' THEN 2 ELSE 1 END DESC,
        c.start_date DESC,
        c.id DESC
    ) AS rn_contract
  FROM base b
  JOIN srv83804_contracts.contracts c
    ON c.client_id = b.client_id
   AND b.meal_date >= c.start_date
   AND b.meal_date <= COALESCE(c.end_date, '9999-12-31')
   AND c.status IN ('active','planned')
),

kitchen_pick AS (
  SELECT
    cp.*,
    ckp.kitchen_id,
    ROW_NUMBER() OVER (
      PARTITION BY cp.after_id
      ORDER BY
        ckp.start_date DESC,
        ckp.id DESC
    ) AS rn_kitchen
  FROM contract_pick cp
  LEFT JOIN srv83804_contracts.contract_kitchen_periods ckp
    ON ckp.contract_id = cp.contract_id
   AND cp.meal_date >= ckp.start_date
   AND cp.meal_date <= COALESCE(ckp.end_date, COALESCE(cp.contract_end_date, '9999-12-31'))
  WHERE cp.rn_contract = 1
)

SELECT
  meal_date,
  client_id,

  client_department_id,
  client_diet_id,
  client_meal_type_id,

  global_department_id,
  global_diet_id,
  global_meal_type_id,

  qty_after,
  qty_before,
  qty_diff,

  status,
  updated_at,
  cutoff_at,
  minutes_after_cutoff,
  cutoff_decision_by,
  cutoff_decision_at,

  after_id,
  before_id,

  contract_id,
  kitchen_id

FROM kitchen_pick
WHERE rn_kitchen = 1 OR rn_kitchen IS NULL
ORDER BY meal_date DESC, updated_at DESC, after_id DESC
";

$stmt = $pdo->query($sql);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

// resolve decision user names from contracts.users
$decisionUserIds = array_values(array_unique(array_filter(array_map(
    fn($r) => (int)($r['cutoff_decision_by'] ?? 0),
    $rows
), fn($id) => $id > 0)));

$decisionUsers = [];
if (count($decisionUserIds) > 0) {
    $placeholders = implode(',', array_fill(0, count($decisionUserIds), '?'));
    $uStmt = $pdo->prepare("
        SELECT id, first_name, last_name, email
        FROM srv83804_contracts.users
        WHERE id IN ($placeholders)
    ");
    $uStmt->execute($decisionUserIds);
    foreach ($uStmt->fetchAll(PDO::FETCH_ASSOC) as $u) {
        $name = trim(($u['first_name'] ?? '') . ' ' . ($u['last_name'] ?? ''));
        $decisionUsers[(int)$u['id']] = $name !== '' ? $name : ($u['email'] ?? ('#' . $u['id']));
    }
}

foreach ($rows as &$r) {
    $uid = (int)($r['cutoff_decision_by'] ?? 0);
    $r['cutoff_decision_user'] = $uid > 0 ? ($decisionUsers[$uid] ?? ('#' . $uid)) : null;
}
unset($r);

jsonResponse($rows);
