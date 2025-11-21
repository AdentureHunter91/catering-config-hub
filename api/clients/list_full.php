<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

$stmt = $pdo->query("
    SELECT 
        c.id,
        c.short_name,
        c.full_name,
        c.nip,
        c.city,
        c.total_beds,

        -- ile kontraktów ma klient
        (SELECT COUNT(*) FROM contracts ct WHERE ct.client_id = c.id) AS contracts_count,

        -- status nadrzędny klienta (priorytet: active > planned > expired > none)
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
        ) AS status

    FROM clients c
    ORDER BY c.short_name ASC
");

$rows = $stmt->fetchAll();

jsonResponse($rows);
