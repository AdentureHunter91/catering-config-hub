<?php
// /Login/access.php

// CORS for preview origins (Lovable / external)
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

if ($_SERVER["REQUEST_METHOD"] === "OPTIONS") {
    http_response_code(200);
    exit;
}

$isHttps = (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off")
    || (isset($_SERVER["SERVER_PORT"]) && (int)$_SERVER["SERVER_PORT"] === 443);
$cookieParams = session_get_cookie_params();
$cookieParams["samesite"] = $isHttps ? "None" : "Lax";
$cookieParams["secure"] = $isHttps;
session_set_cookie_params($cookieParams);
session_start();
require_once "../api/bootstrap.php";

// Jeśli użytkownik nie zalogowany → zwróć brak dostępu
if (!isset($_SESSION["user_id"])) {
    echo json_encode(["success" => false, "error" => "Not authenticated"]);
    exit;
}

$userId = $_SESSION["user_id"];

/*
|--------------------------------------------------------------------------
| 1. Pobierz uprawnienia użytkownika
|--------------------------------------------------------------------------
*/
$stmt = $pdo->prepare("
    SELECT p.name 
    FROM user_roles ur
    JOIN role_permissions rp ON rp.role_id = ur.role_id
    JOIN permissions p ON p.id = rp.permission_id
    WHERE ur.user_id = :id
");
$stmt->execute([':id' => $userId]);

$userPermissions = $stmt->fetchAll(PDO::FETCH_COLUMN);
$userPermissions = array_unique($userPermissions); // gdyby duplikaty

/*
|--------------------------------------------------------------------------
| 2. Pobierz wszystkie aktywne strony z page_access
|--------------------------------------------------------------------------
*/
$pagesStmt = $pdo->query("
    SELECT 
        page_key,
        permission_view,
        permission_read,
        permission_edit,
        is_active
    FROM page_access
    WHERE is_active = 1
");
$pages = $pagesStmt->fetchAll(PDO::FETCH_ASSOC);

/*
|--------------------------------------------------------------------------
| 3. Zbuduj wynik "view", "read", "edit"
|--------------------------------------------------------------------------
| Logika:
| - view = użytkownik posiada permission_view
| - read = użytkownik posiada permission_read LUB edit (bo edit > read)
| - edit = użytkownik posiada permission_edit
|--------------------------------------------------------------------------
*/

$result = [];

foreach ($pages as $p) {
    $pageKey = $p["page_key"];

    $permView = $p["permission_view"];
    $permRead = $p["permission_read"];
    $permEdit = $p["permission_edit"];

    // sprawdź, czy użytkownik ma uprawnienia
    $hasEdit = $permEdit && in_array($permEdit, $userPermissions);
    $hasRead = $hasEdit || ($permRead && in_array($permRead, $userPermissions));
    $hasView = $hasRead || ($permView && in_array($permView, $userPermissions));

    $result[$pageKey] = [
        "view" => (bool)$hasView,
        "read" => (bool)$hasRead,
        "edit" => (bool)$hasEdit
    ];
}

/*
|--------------------------------------------------------------------------
| 4. Zwróć wynik
|--------------------------------------------------------------------------
*/
echo json_encode([
    "success" => true,
    "pages" => $result
]);
