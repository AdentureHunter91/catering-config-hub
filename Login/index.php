<?php
session_start();

if (isset($_SESSION["user_id"])) {
    // Jeśli użytkownik już zalogowany — przekieruj do celu lub Config
    $redirect = isset($_GET['returnUrl']) ? $_GET['returnUrl'] : '/Config';
    header("Location: " . $redirect);
    exit;
}
?>
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Logowanie • Platforma Cateringowa</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<canvas id="bg"></canvas>
<script src="background.js"></script>

<div class="login-card">
    <h2>Platforma Cateringowa</h2>
    <p class="subtitle">Logowanie do panelu</p>

    <form id="loginForm">
        <div class="field">
            <label>Email</label>
            <input type="email" name="email" required>
        </div>

        <div class="field">
            <label>Hasło</label>
            <input type="password" name="password" required>
        </div>

        <button type="submit" class="btn">Zaloguj</button>

        <p id="errorMsg" class="error hidden"></p>

        <p class="small-text" style="margin-top:15px;">
            Nie masz jeszcze konta?
            <a href="/Login/register.php">Zarejestruj się</a>
        </p>

    </form>
</div>

<script>
    document.getElementById("loginForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const form = new FormData(e.target);
        const res = await fetch("login.php", {
            method: "POST",
            body: form
        });
        const j = await res.json();

        if (!j.success) {
            const msg = document.getElementById("errorMsg");
            msg.textContent = j.error;
            msg.classList.remove("hidden");
            return;
        }

        const url = new URL(window.location.href);
        const returnUrl = url.searchParams.get("returnUrl") || "/Config";

        window.location.href = returnUrl;
    });
</script>

</body>
</html>
