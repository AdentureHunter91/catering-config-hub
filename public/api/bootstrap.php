<?php
declare(strict_types=1);

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

set_exception_handler(function(Throwable $e) {
    jsonResponse(null, false, "SERVER_ERROR: " . $e->getMessage(), 500);
});
