<?php
declare(strict_types=1);

require_once __DIR__ . "/../../bootstrap.php";

$pdo = getPDO();
$user = requireLogin($pdo);

$schema = 'srv83804_client';
$table = 'meal_variants';

$labelMap = [
    'extra_packaging_count' => 'Dodatkowe opakowania',
    'exclusions_json' => 'Wykluczenia',
    'menu_selection_json' => 'Wybory menu',
    'comment_text' => 'Komentarz',
];

$exclude = [
    'id',
    'client_id',
    'meal_date',
    'department_id',
    'diet_id',
    'meal_type_id',
    'variant_label',
    'created_at',
    'updated_at',
    'created_by',
    'updated_by',
];

try {
    $stmt = $pdo->prepare("
        SELECT COLUMN_NAME, DATA_TYPE
        FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
        ORDER BY ORDINAL_POSITION
    ");
    $stmt->execute([$schema, $table]);

    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    if (!$rows) {
        throw new Exception('NO_COLUMNS');
    }

    $columns = [];
    foreach ($rows as $row) {
        $key = (string)$row['COLUMN_NAME'];
        if (in_array($key, $exclude, true)) {
            continue;
        }

        $dataType = strtolower((string)$row['DATA_TYPE']);
        $type = 'text';

        if (in_array($dataType, ['int', 'integer', 'bigint', 'smallint', 'mediumint', 'tinyint', 'decimal', 'numeric', 'float', 'double'], true)) {
            $type = 'number';
        } elseif (in_array($dataType, ['date', 'datetime', 'timestamp'], true)) {
            $type = 'date';
        } elseif ($dataType === 'json') {
            $type = 'json';
        }

        $columns[] = [
            'key' => $key,
            'label' => $labelMap[$key] ?? $key,
            'data_type' => $type,
        ];
    }

    jsonResponse($columns, true, null);
} catch (Throwable $e) {
    $fallback = [];
    foreach ($labelMap as $key => $label) {
        $fallback[] = [
            'key' => $key,
            'label' => $label,
            'data_type' => $key === 'extra_packaging_count' ? 'number' : 'json',
        ];
    }

    jsonResponse($fallback, true, null);
}
