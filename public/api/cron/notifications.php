<?php
declare(strict_types=1);

require_once __DIR__ . "/../bootstrap.php";

$pdo = getPDO();

$jobName = "diet_meal_approval";
$now = new DateTimeImmutable("now");
$checkUntil = $now->format("Y-m-d H:i:s");

$pdo->beginTransaction();

// Lock job row
$stmtJob = $pdo->prepare("SELECT last_checked_at FROM notification_jobs WHERE job_name = ? FOR UPDATE");
$stmtJob->execute([$jobName]);
$job = $stmtJob->fetch(PDO::FETCH_ASSOC);

if (!$job) {
    $defaultStart = $now->sub(new DateInterval("PT15M"))->format("Y-m-d H:i:s");
    $pdo->prepare("INSERT INTO notification_jobs (job_name, last_checked_at) VALUES (?, ?)")
        ->execute([$jobName, $defaultStart]);
    $lastChecked = $defaultStart;
} else {
    $lastChecked = $job["last_checked_at"] ?? null;
    if ($lastChecked === null) {
        $lastChecked = $now->sub(new DateInterval("PT15M"))->format("Y-m-d H:i:s");
    }
}

// Aggregate new pending approvals created after last_checked_at
$sql = "
WITH base AS (
  SELECT
    a.meal_date,
    a.client_id,
    a.updated_at
  FROM srv83804_client.meal_entries a
  WHERE a.is_after_cutoff = 1
    AND a.status = 'pending_approval'
    AND a.updated_at > ?
    AND a.updated_at <= ?
),
contract_pick AS (
  SELECT
    b.*,
    c.id AS contract_id,
    c.start_date AS contract_start_date,
    c.end_date   AS contract_end_date,
    c.status     AS contract_status,
    ROW_NUMBER() OVER (
      PARTITION BY b.client_id, b.meal_date, b.updated_at
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
      PARTITION BY cp.client_id, cp.meal_date, cp.updated_at
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
  COALESCE(kitchen_id, 0) AS kitchen_id,
  client_id,
  meal_date,
  COUNT(*) AS cnt,
  MIN(updated_at) AS first_at,
  MAX(updated_at) AS last_at
FROM kitchen_pick
WHERE rn_kitchen = 1 OR rn_kitchen IS NULL
GROUP BY COALESCE(kitchen_id, 0), client_id, meal_date
";

$stmtAgg = $pdo->prepare($sql);
$stmtAgg->execute([$lastChecked, $checkUntil]);
$rows = $stmtAgg->fetchAll(PDO::FETCH_ASSOC);

$insert = $pdo->prepare("
    INSERT INTO notification_events
        (type, kitchen_id, client_id, meal_date, count, first_at, last_at, last_notified_at, status, batch_at)
    VALUES
        ('diet_meal_approval_pending', ?, ?, ?, ?, ?, ?, ?, 'open', ?)
");

$inserted = 0;
foreach ($rows as $r) {
    $insert->execute([
        (int)$r["kitchen_id"],
        (int)$r["client_id"],
        $r["meal_date"],
        (int)$r["cnt"],
        $r["first_at"],
        $r["last_at"],
        $checkUntil,
        $checkUntil
    ]);
    $inserted += 1;
}

$pdo->prepare("UPDATE notification_jobs SET last_checked_at = ? WHERE job_name = ?")
    ->execute([$checkUntil, $jobName]);

$pdo->commit();

jsonResponse([
    "job" => $jobName,
    "last_checked_at" => $lastChecked,
    "checked_until" => $checkUntil,
    "new_groups" => $inserted
]);
