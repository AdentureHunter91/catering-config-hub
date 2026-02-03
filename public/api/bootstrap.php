<?php
declare(strict_types=1);

$origin = $_SERVER["HTTP_ORIGIN"] ?? "";
$originHost = $origin ? parse_url($origin, PHP_URL_HOST) : "";
$originScheme = $origin ? parse_url($origin, PHP_URL_SCHEME) : "";
$allowedOrigins = [
    "https://id-preview--d017e342-c02f-476a-94a1-a72ec0222267.lovable.app",
    "https://preview-7c11c837--catering-config-hub.lovable.app",
    "https://d017e342-c02f-476a-94a1-a72ec0222267.lovableproject.com",
];
$allowedHostSuffixes = [
    ".lovable.app",
    ".lovable.dev",
    ".lovableproject.com",
];
$isAllowedOrigin = $origin
    && $originScheme === "https"
    && (in_array($origin, $allowedOrigins, true)
        || array_reduce(
            $allowedHostSuffixes,
            fn($carry, $suffix) => $carry || ($originHost && str_ends_with($originHost, $suffix)),
            false
        ));

if ($isAllowedOrigin) {
    header("Access-Control-Allow-Origin: " . $origin);
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Allow-Headers: Content-Type");
    header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
}

$reqMethod = $_SERVER["REQUEST_METHOD"] ?? "CLI";
if ($reqMethod === "OPTIONS") {
    http_response_code(200);
    exit;
}

header("Content-Type: application/json; charset=utf-8");

// Wymuszamy właściwą lokalizację db.php
require_once __DIR__ . "/db.php";

// 🔌 Połączenie z DB
$db = getDB();
$pdo = $db;

// 🔐 Pobranie użytkownika (twoje login / JWT / sesja)
$authUser = requireLogin($pdo);  // <-- to już masz poniżej

// 🔥 Ustawiamy zmienną sesyjną MySQL widoczną dla triggerów
if (!empty($authUser["id"])) {
    $stmt = $pdo->prepare("SET @current_user_id = :uid");
    $stmt->execute(["uid" => $authUser["id"]]);
} else {
    // brak użytkownika → system
    $pdo->exec("SET @current_user_id = NULL");
}

function requireLogin($pdo = null) {
    // TODO: tu podłączysz realne logowanie, JWT, sesję itd.
    return ["id" => 1, "email" => "dev@local"];
}

function jsonResponse($data = null, bool $success = true, string $error = null, int $code = 200): void {
    http_response_code($code);
    echo json_encode([
        "success" => $success,
        "data" => $success ? $data : null,
        "error" => $success ? null : $error
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

/**
 * Log an action to the audit_log table
 * 
 * @param PDO $pdo Database connection
 * @param string $tableName Name of the table being modified
 * @param int $recordId ID of the record being modified
 * @param string $action One of: 'insert', 'update', 'delete'
 * @param array|null $oldValues Previous values (for update/delete)
 * @param array|null $newValues New values (for insert/update)
 * @param int|null $changedBy User ID who made the change
 */
function logAudit(PDO $pdo, string $tableName, int $recordId, string $action, ?array $oldValues = null, ?array $newValues = null, ?int $changedBy = null): void {
    try {
        $stmt = $pdo->prepare("
            INSERT INTO audit_log (table_name, record_id, action, changed_by, old_values, new_values)
            VALUES (?, ?, ?, ?, ?, ?)
        ");
        $stmt->execute([
            $tableName,
            $recordId,
            $action,
            $changedBy,
            $oldValues ? json_encode($oldValues, JSON_UNESCAPED_UNICODE) : null,
            $newValues ? json_encode($newValues, JSON_UNESCAPED_UNICODE) : null
        ]);
    } catch (Throwable $e) {
        // Silently ignore audit log errors to not break main operations
        error_log("Audit log error: " . $e->getMessage());
    }
}

/**
 * Get record from table by ID for audit purposes
 */
function getRecordForAudit(PDO $pdo, string $tableName, int $recordId): ?array {
    try {
        $stmt = $pdo->prepare("SELECT * FROM `{$tableName}` WHERE id = ?");
        $stmt->execute([$recordId]);
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: null;
    } catch (Throwable $e) {
        return null;
    }
}

set_exception_handler(function(Throwable $e) {
    jsonResponse(null, false, "SERVER_ERROR: " . $e->getMessage(), 500);
});
