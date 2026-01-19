<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

// ==========================================
// KLIENCI (szpitale) z danymi kontraktów
// ==========================================
$clientsSql = "
    SELECT 
        c.id,
        c.short_name,
        c.full_name,
        c.city,
        c.address,
        c.total_beds,

        -- Dane kontraktu
        (
            SELECT ct.contract_beds 
            FROM contracts ct 
            WHERE ct.client_id = c.id 
            AND ct.status = 'active'
            ORDER BY ct.id DESC
            LIMIT 1
        ) AS active_contract_beds,

        (
            SELECT ct.contract_beds 
            FROM contracts ct 
            WHERE ct.client_id = c.id 
            AND ct.status = 'planned'
            ORDER BY ct.id DESC
            LIMIT 1
        ) AS planned_contract_beds,

        -- Status klienta
        (
            SELECT 
                CASE 
                    WHEN EXISTS (
                        SELECT 1 FROM contracts ct 
                        WHERE ct.client_id = c.id AND ct.status = 'active'
                    ) THEN 'active'
                    WHEN EXISTS (
                        SELECT 1 FROM contracts ct 
                        WHERE ct.client_id = c.id AND ct.status = 'planned'
                    ) THEN 'planned'
                    WHEN EXISTS (
                        SELECT 1 FROM contracts ct 
                        WHERE ct.client_id = c.id AND ct.status = 'expired'
                    ) THEN 'expired'
                    ELSE 'none'
                END
        ) AS status,

        -- ID aktywnego kontraktu
        (
            SELECT ct.id 
            FROM contracts ct 
            WHERE ct.client_id = c.id 
            AND ct.status IN ('active', 'planned')
            ORDER BY FIELD(ct.status, 'active', 'planned'), ct.id DESC
            LIMIT 1
        ) AS contract_id

    FROM clients c
    ORDER BY c.short_name ASC
";

$clientsStmt = $pdo->query($clientsSql);
$clients = $clientsStmt->fetchAll(PDO::FETCH_ASSOC);

// ==========================================
// KUCHNIE z danymi operacyjnymi
// ==========================================
$kitchensSql = "
    SELECT 
        k.id,
        k.name,
        k.city,
        k.address,

        -- Maks. osobodni z ustawień
        (
            SELECT ks.max_daily_patient_days
            FROM kitchen_settings ks
            WHERE ks.kitchen_id = k.id
            LIMIT 1
        ) AS max_osobodni,

        -- Aktualnie obsługiwane osobodni (aktywne kontrakty)
        (
            SELECT SUM(c.contract_beds)
            FROM contract_kitchen_periods ckp
            JOIN contracts c ON c.id = ckp.contract_id
            WHERE ckp.kitchen_id = k.id
              AND c.status = 'active'
              AND ckp.start_date <= CURDATE()
              AND (ckp.end_date IS NULL OR ckp.end_date >= CURDATE())
        ) AS current_osobodni,

        -- Planowane osobodni
        (
            SELECT SUM(c.contract_beds)
            FROM contract_kitchen_periods ckp
            JOIN contracts c ON c.id = ckp.contract_id
            WHERE ckp.kitchen_id = k.id
              AND c.status = 'planned'
        ) AS planned_osobodni,

        -- Liczba aktywnych kontraktów
        (
            SELECT COUNT(*)
            FROM contract_kitchen_periods ckp
            JOIN contracts c ON c.id = ckp.contract_id
            WHERE ckp.kitchen_id = k.id
              AND c.status = 'active'
              AND ckp.start_date <= CURDATE()
              AND (ckp.end_date IS NULL OR ckp.end_date >= CURDATE())
        ) AS active_contracts,

        -- Liczba planowanych kontraktów
        (
            SELECT COUNT(*)
            FROM contract_kitchen_periods ckp
            JOIN contracts c ON c.id = ckp.contract_id
            WHERE ckp.kitchen_id = k.id
              AND c.status = 'planned'
        ) AS planned_contracts,

        -- Liczba pracowników
        (
            SELECT ks.planned_employees
            FROM kitchen_settings ks
            WHERE ks.kitchen_id = k.id
            LIMIT 1
        ) AS employees

    FROM kitchens k
    ORDER BY k.name ASC
";

$kitchensStmt = $pdo->query($kitchensSql);
$kitchens = $kitchensStmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode([
    "success" => true,
    "data" => [
        "clients" => $clients,
        "kitchens" => $kitchens
    ]
], JSON_UNESCAPED_UNICODE);
