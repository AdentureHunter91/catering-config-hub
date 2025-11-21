<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

/*
    LISTA KUCHNI — z liczbą kontraktów:
    - aktywnych
    - planowanych
    - wygasłych
    oraz z liczbą osobodni (contract_beds)
*/

$sql = "
    SELECT 
        k.id,
        k.name,
        k.city,

        /* --- Kontrakty aktywne (status=active + okres obejmuje dziś) --- */
        (
            SELECT COUNT(*)
            FROM contract_kitchen_periods ckp
            JOIN contracts c ON c.id = ckp.contract_id
            WHERE ckp.kitchen_id = k.id
              AND c.status = 'active'
              AND ckp.start_date <= CURDATE()
              AND (ckp.end_date IS NULL OR ckp.end_date >= CURDATE())
        ) AS active_contracts,

        /* --- Kontrakty planowane (status=planned) --- */
        (
            SELECT COUNT(*)
            FROM contract_kitchen_periods ckp
            JOIN contracts c ON c.id = ckp.contract_id
            WHERE ckp.kitchen_id = k.id
              AND c.status = 'planned'
        ) AS planned_contracts,

        /* --- Kontrakty wygasłe (status=expired) --- */
        (
            SELECT COUNT(*)
            FROM contract_kitchen_periods ckp
            JOIN contracts c ON c.id = ckp.contract_id
            WHERE ckp.kitchen_id = k.id
              AND c.status = 'expired'
        ) AS expired_contracts,


        /* ████████████████████████████████████████████████████████████████ */
        /*                           OSOBODNI                              */
        /* ████████████████████████████████████████████████████████████████ */

        /* --- Łączna liczba osobodni (contract_beds) dla aktywnych kontraktów --- */
        (
            SELECT SUM(c.contract_beds)
            FROM contract_kitchen_periods ckp
            JOIN contracts c ON c.id = ckp.contract_id
            WHERE ckp.kitchen_id = k.id
              AND c.status = 'active'
              AND ckp.start_date <= CURDATE()
              AND (ckp.end_date IS NULL OR ckp.end_date >= CURDATE())
        ) AS active_beds,

        /* --- Łączna liczba osobodni (contract_beds) dla kontraktów planowanych --- */
        (
            SELECT SUM(c.contract_beds)
            FROM contract_kitchen_periods ckp
            JOIN contracts c ON c.id = ckp.contract_id
            WHERE ckp.kitchen_id = k.id
              AND c.status = 'planned'
        ) AS planned_beds,


        /* --- Liczba pracowników --- */
        (
            SELECT ks.planned_employees
            FROM kitchen_settings ks
            WHERE ks.kitchen_id = k.id
            LIMIT 1
        ) AS employees

    FROM kitchens k
    ORDER BY k.name ASC
";

$stmt = $pdo->query($sql);
$rows = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "data" => $rows
], JSON_UNESCAPED_UNICODE);
