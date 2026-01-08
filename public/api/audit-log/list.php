<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

// --- Pobranie parametrów ---
$q      = $_GET['q']      ?? '';
$action = $_GET['action'] ?? 'all';
$table  = $_GET['table']  ?? 'all';

// --- Dozwolone akcje ---
$allowedActions = ['insert', 'update', 'delete', 'all'];

// --- Dozwolone tabele (opcjonalnie możesz to pobrać z DB) ---
$allowedTables = [
    'clients', 'contracts', 'kitchens', 'contract_kitchen_periods', 'departments',
    'client_departments', 'diets', 'client_diets', 'client_department_diets',
    'meal_types', 'client_meal_types', 'roles', 'users', 'user_roles', 'permissions',
    'role_permissions', 'contract_meal_type_settings', 'kitchen_settings',
    'kitchen_monthly_targets', 'kitchen_quality_settings', 'contract_departments',
    'contract_diets', 'contract_department_diets', 'page_access', 'audit_log'
];

// --- Walidacja parametrów ---
if (!in_array($action, $allowedActions)) {
    jsonResponse(null, false, "Invalid action parameter", 400);
}

if ($table !== 'all' && !in_array($table, $allowedTables)) {
    jsonResponse(null, false, "Invalid table parameter", 400);
}

// --- Budowanie zapytania SQL ---
$sql = "
    SELECT 
        al.id,
        al.table_name AS table_name,
        al.record_id,
        al.action,
        al.changed_by,
        al.changed_at,
        al.old_values,
        al.new_values,
        CONCAT(IFNULL(u.first_name, ''), ' ', IFNULL(u.last_name, '')) AS user_name
    FROM audit_log al
    LEFT JOIN users u ON al.changed_by = u.id
    WHERE 1 = 1
";

$params = [];

// --- Filtrowanie wyszukiwania ---
if ($q !== '') {
    $sql .= " AND (
        al.table_name LIKE ?
        OR al.record_id LIKE ?
        OR u.first_name LIKE ?
        OR u.last_name LIKE ?
    )";
    $params[] = "%$q%";
    $params[] = "%$q%";
    $params[] = "%$q%";
    $params[] = "%$q%";
}

// --- Filtrowanie po akcji ---
if ($action !== 'all') {
    $sql .= " AND al.action = ?";
    $params[] = $action;
}

// --- Filtrowanie po tabeli ---
if ($table !== 'all') {
    $sql .= " AND al.table_name = ?";
    $params[] = $table;
}

// --- Sortowanie + limit ---
$sql .= " ORDER BY al.changed_at DESC LIMIT 300";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

jsonResponse($stmt->fetchAll(PDO::FETCH_ASSOC), true);
