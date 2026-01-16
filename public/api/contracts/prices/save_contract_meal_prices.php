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

function readJson(): array {
    $raw = file_get_contents('php://input');
    $in = json_decode($raw ?: '', true);
    return is_array($in) ? $in : [];
}

function uuidv4(): string {
    $data = random_bytes(16);
    $data[6] = chr((ord($data[6]) & 0x0f) | 0x40);
    $data[8] = chr((ord($data[8]) & 0x3f) | 0x80);
    return vsprintf('%s%s-%s-%s-%s-%s%s%s', str_split(bin2hex($data), 4));
}

try {
    $session = requireLogin();
    $pdo = getPDO();

    $userId = (int)($session['user_id'] ?? $session['id'] ?? 0);

    $in = readJson();
    $contractId = (int)($in['contract_id'] ?? 0);
    $mode = (string)($in['mode'] ?? '');

    if ($contractId <= 0) throw new Exception('contract_id required');
    if (!in_array($mode, ['basic','detailed'], true)) throw new Exception('Invalid mode');

    $columns = $in['priceColumns'] ?? [];
    if (!is_array($columns) || count($columns) === 0) throw new Exception('priceColumns required');

    // map: colKey => [dept_ids, label]
    $colMap = [];
    $deptUsed = [];

    foreach ($columns as $c) {
        $colKey = (string)($c['id'] ?? '');
        if ($colKey === '') throw new Exception('column id required');

        $deptIds = $c['department_ids'] ?? [];
        if (!is_array($deptIds)) $deptIds = [];

        $deptIds = array_values(array_unique(array_map('intval', $deptIds)));
        $label = (string)($c['label'] ?? '');

        // nie pozwalamy, żeby oddział był w 2 kolumnach
        foreach ($deptIds as $d) {
            if (isset($deptUsed[$d])) throw new Exception("Department {$d} assigned to multiple columns");
            $deptUsed[$d] = true;
        }

        $colMap[$colKey] = ['dept_ids' => $deptIds, 'label' => $label];
    }

    $basePrices = $in['basePrices'] ?? [];
    $dietPrices = $in['dietPrices'] ?? [];

    $batchId = uuidv4();

    $pdo->beginTransaction();

    $ins = $pdo->prepare("
    INSERT INTO contract_meal_prices
      (contract_id, batch_id, saved_by, mode, column_key, column_label,
       client_department_id, client_meal_type_id, client_diet_id, price)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  ");

    $rowsInserted = 0;

    if ($mode === 'basic') {
        foreach ($basePrices as $mealTypeIdStr => $cols) {
            $mealTypeId = (int)$mealTypeIdStr;
            if (!is_array($cols)) continue;

            foreach ($cols as $colKey => $priceVal) {
                if (!isset($colMap[$colKey])) continue;
                if ($priceVal === '' || $priceVal === null) continue;

                $price = (float)$priceVal;

                foreach ($colMap[$colKey]['dept_ids'] as $deptId) {
                    $ins->execute([
                        $contractId, $batchId, $userId > 0 ? $userId : null, $mode,
                        $colKey, $colMap[$colKey]['label'] ?: null,
                        (int)$deptId, $mealTypeId, null, $price
                    ]);
                    $rowsInserted++;
                }
            }
        }
    }

    if ($mode === 'detailed') {
        foreach ($dietPrices as $mealTypeIdStr => $dietMap) {
            $mealTypeId = (int)$mealTypeIdStr;
            if (!is_array($dietMap)) continue;

            foreach ($dietMap as $dietIdStr => $cols) {
                $dietId = (int)$dietIdStr;
                if (!is_array($cols)) continue;

                foreach ($cols as $colKey => $priceVal) {
                    if (!isset($colMap[$colKey])) continue;
                    if ($priceVal === '' || $priceVal === null) continue;

                    $price = (float)$priceVal;

                    foreach ($colMap[$colKey]['dept_ids'] as $deptId) {
                        $ins->execute([
                            $contractId, $batchId, $userId > 0 ? $userId : null, $mode,
                            $colKey, $colMap[$colKey]['label'] ?: null,
                            (int)$deptId, $mealTypeId, $dietId, $price
                        ]);
                        $rowsInserted++;
                    }
                }
            }
        }
    }

    $pdo->commit();

    // Audit log for batch price save
    logAudit($pdo, 'contract_meal_prices', $contractId, 'insert', null, [
        'batch_id' => $batchId,
        'mode' => $mode,
        'rows_inserted' => $rowsInserted,
        'contract_id' => $contractId
    ], $userId > 0 ? $userId : null);

    respond(true, ['batch_id' => $batchId, 'rows_inserted' => $rowsInserted]);

} catch (Throwable $e) {
    if (isset($pdo) && $pdo->inTransaction()) $pdo->rollBack();
    respond(false, null, $e->getMessage());
}
