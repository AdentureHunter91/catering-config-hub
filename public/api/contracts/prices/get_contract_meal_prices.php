<?php
declare(strict_types=1);
error_reporting(E_ALL);
ini_set("display_errors", 0);

require_once __DIR__ . "/../../bootstrap.php";
require_once __DIR__ . "/../../db.php";

header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: no-store');

function respond(bool $success, $data = null, ?string $error = null): void {
    echo json_encode([
        'success' => $success,
        'data' => $success ? $data : null,
        'error' => $success ? null : $error,
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    requireLogin();
    $pdo = getPDO();

    $contractId = (int)($_GET['contract_id'] ?? 0);
    if ($contractId <= 0) throw new Exception('contract_id required');

    // znajdź ostatni batch
    $st = $pdo->prepare("
    SELECT batch_id, mode, MAX(saved_at) AS saved_at
    FROM contract_meal_prices
    WHERE contract_id = ?
    GROUP BY batch_id, mode
    ORDER BY saved_at DESC
    LIMIT 1
  ");
    $st->execute([$contractId]);
    $hdr = $st->fetch(PDO::FETCH_ASSOC);

    if (!$hdr) {
        respond(true, [
            'mode' => 'basic',
            'batch_id' => null,
            'saved_at' => null,
            'priceColumns' => [],
            'basePrices' => new stdClass(),
            'dietPrices' => new stdClass(),
        ]);
    }

    $batchId = (string)$hdr['batch_id'];
    $mode = (string)$hdr['mode'];

    $st2 = $pdo->prepare("
    SELECT column_key, column_label,
           client_department_id, client_meal_type_id, client_diet_id, price
    FROM contract_meal_prices
    WHERE contract_id = ? AND batch_id = ?
  ");
    $st2->execute([$contractId, $batchId]);
    $rows = $st2->fetchAll(PDO::FETCH_ASSOC);

    // odbudowa struktur pod React
    $cols = []; // column_key => ['id','label','department_ids'=>[]]
    $basePrices = [];
    $dietPrices = [];

    foreach ($rows as $r) {
        $colKey = (string)$r['column_key'];
        if (!isset($cols[$colKey])) {
            $cols[$colKey] = [
                'id' => $colKey,
                'label' => $r['column_label'] ?? '',
                'department_ids' => [],
            ];
        }

        $deptId = (int)$r['client_department_id'];
        if (!in_array($deptId, $cols[$colKey]['department_ids'], true)) {
            $cols[$colKey]['department_ids'][] = $deptId;
        }

        $mealTypeId = (int)$r['client_meal_type_id'];
        $dietId = $r['client_diet_id'] !== null ? (int)$r['client_diet_id'] : null;
        $price = (float)$r['price'];

        if ($dietId === null) {
            $basePrices[$mealTypeId] ??= [];
            $basePrices[$mealTypeId][$colKey] = $price;
        } else {
            $dietPrices[$mealTypeId] ??= [];
            $dietPrices[$mealTypeId][$dietId] ??= [];
            $dietPrices[$mealTypeId][$dietId][$colKey] = $price;
        }
    }

    respond(true, [
        'mode' => $mode,
        'batch_id' => $batchId,
        'saved_at' => $hdr['saved_at'],
        'priceColumns' => array_values($cols),
        'basePrices' => $basePrices,
        'dietPrices' => $dietPrices,
    ]);

} catch (Throwable $e) {
    respond(false, null, $e->getMessage());
}
