<?php
declare(strict_types=1);

/**
 * Ustawia zmienną sesyjną MySQL widoczną dla triggerów
 * @param PDO $pdo
 */
function setCurrentUserId(PDO $pdo): void
{
    // funkcja requireLogin jest w bootstrap.php
    if (function_exists('requireLogin')) {
        $u = requireLogin($pdo);
        $uid = $u["id"] ?? null;

        $stmt = $pdo->prepare("SET @current_user_id = :uid");
        $stmt->execute(["uid" => $uid]);
    } else {
        // awaryjnie — bez użytkownika
        $pdo->exec("SET @current_user_id = NULL");
    }
}

/**
 * Tworzy nowe połączenie PDO i automatycznie ustawia @current_user_id
 */
function createPDO(): PDO
{
    $dbHost = "localhost";
    $dbName = "srv83804_contracts";
    $dbUser = "srv83804_contracts";
    $dbPass = "kCnFVMF6wzLLpdMMx2Vy";
    $charset = "utf8mb4";

    $dsn = "mysql:host={$dbHost};dbname={$dbName};charset={$charset}";

    $pdo = new PDO($dsn, $dbUser, $dbPass, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    // 🔥 kluczowe!
    setCurrentUserId($pdo);

    return $pdo;
}

/**
 * Główne API — w systemie obie funkcje zwracają to samo połączenie
 */
function getPDO(): PDO
{
    return createPDO();
}

function getDB(): PDO
{
    return createPDO();
}
