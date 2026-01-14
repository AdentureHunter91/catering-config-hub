<?php
session_start();

if (!isset($_SESSION["user_id"])) {
    $current = $_SERVER["REQUEST_URI"];
    header("Location: /Login?returnUrl=" . urlencode($current));
    exit;
}
