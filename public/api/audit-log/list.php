<?php
require_once __DIR__ . '/../bootstrap.php';

$pdo = getPDO();

// --- Pobranie parametrów ---
$q      = $_GET['q']      ?? '';
$action = $_GET['action'] ?? 'all';
$table  = $_GET['table']  ?? 'all';
$dateFrom = $_GET['date_from'] ?? '';
$dateTo   = $_GET['date_to'] ?? '';
$limit    = (int)($_GET['limit'] ?? 300);
$offset   = (int)($_GET['offset'] ?? 0);

if ($limit > 500) $limit = 500;
if ($limit < 1) $limit = 50;

// --- Dozwolone akcje ---
$allowedActions = ['insert', 'update', 'delete', 'all'];

// --- Dozwolone tabele (wszystkie możliwe) ---
$allowedTables = [
    'clients', 'contracts', 'kitchens', 'contract_kitchen_periods', 'departments',
    'client_departments', 'diets', 'client_diets', 'client_department_diets',
    'meal_types', 'client_meal_types', 'roles', 'users', 'user_roles', 'permissions',
    'role_permissions', 'contract_meal_type_settings', 'kitchen_settings',
    'kitchen_monthly_targets', 'kitchen_quality_settings', 'contract_departments',
    'contract_diets', 'contract_department_diets', 'page_access', 'audit_log',
    'products', 'product_variants', 'product_categories', 'product_subcategories',
    'subproducts', 'nutrition_database', 'nutrition_database_uploads',
    'contract_diet_meal_types', 'contract_meal_prices', 'client_contacts'
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
        OR al.old_values LIKE ?
        OR al.new_values LIKE ?
    )";
    $params[] = "%$q%";
    $params[] = "%$q%";
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

// --- Filtrowanie po datach ---
if ($dateFrom !== '') {
    $sql .= " AND DATE(al.changed_at) >= ?";
    $params[] = $dateFrom;
}

if ($dateTo !== '') {
    $sql .= " AND DATE(al.changed_at) <= ?";
    $params[] = $dateTo;
}

// --- Sortowanie + limit ---
$sql .= " ORDER BY al.changed_at DESC LIMIT $limit OFFSET $offset";

$stmt = $pdo->prepare($sql);
$stmt->execute($params);

// Get total count for pagination
$countSql = "SELECT COUNT(*) FROM audit_log al LEFT JOIN users u ON al.changed_by = u.id WHERE 1=1";
$countParams = [];

if ($q !== '') {
    $countSql .= " AND (al.table_name LIKE ? OR al.record_id LIKE ? OR u.first_name LIKE ? OR u.last_name LIKE ? OR al.old_values LIKE ? OR al.new_values LIKE ?)";
    $countParams = array_merge($countParams, ["%$q%", "%$q%", "%$q%", "%$q%", "%$q%", "%$q%"]);
}
if ($action !== 'all') {
    $countSql .= " AND al.action = ?";
    $countParams[] = $action;
}
if ($table !== 'all') {
    $countSql .= " AND al.table_name = ?";
    $countParams[] = $table;
}
if ($dateFrom !== '') {
    $countSql .= " AND DATE(al.changed_at) >= ?";
    $countParams[] = $dateFrom;
}
if ($dateTo !== '') {
    $countSql .= " AND DATE(al.changed_at) <= ?";
    $countParams[] = $dateTo;
}

$countStmt = $pdo->prepare($countSql);
$countStmt->execute($countParams);
$totalCount = (int)$countStmt->fetchColumn();

$logs = $stmt->fetchAll(PDO::FETCH_ASSOC);

jsonResponse([
    'logs' => $logs,
    'total' => $totalCount,
    'limit' => $limit,
    'offset' => $offset
], true);
