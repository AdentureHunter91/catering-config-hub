<?php
$isHttps = (!empty($_SERVER["HTTPS"]) && $_SERVER["HTTPS"] !== "off")
    || (isset($_SERVER["SERVER_PORT"]) && (int)$_SERVER["SERVER_PORT"] === 443);
$cookieParams = session_get_cookie_params();
$cookieParams["samesite"] = $isHttps ? "None" : "Lax";
$cookieParams["secure"] = $isHttps;
session_set_cookie_params($cookieParams);
session_start();

// jeśli zalogowany — przekieruj
if (isset($_SESSION["user_id"])) {
    header("Location: /");
    exit;
}
?>
<!DOCTYPE html>
<html lang="pl">
<head>
    <meta charset="UTF-8">
    <title>Rejestracja • Platforma Cateringowa</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

<canvas id="bg"></canvas>
<script src="background.js"></script>

<div class="login-card">
    <h2>Platforma Cateringowa</h2>
    <p class="subtitle">Utwórz nowe konto</p>

    <form id="regForm">
        <div class="field">
            <label>Imię</label>
            <input type="text" name="first_name" required>
        </div>

        <div class="field">
            <label>Nazwisko</label>
            <input type="text" name="last_name" required>
        </div>

        <div class="field">
            <label>Email</label>
            <input type="email" name="email" required>
        </div>

        <div class="field">
            <label>Hasło</label>
            <input type="password" name="password" required minlength="6">
        </div>

        <button type="submit" class="btn">Zarejestruj</button>

        <p id="msg" class="error hidden"></p>
        <p class="note small-text">Po rejestracji Twoje konto musi zostać aktywowane przez administratora.</p>

        <p class="small-text">
            Masz konto? <a href="/Login">Zaloguj się</a>
        </p>
    </form>
</div>

<!-- SUCCESS MODAL -->
<div id="successModal" class="modal hidden">
    <div class="modal-content">
        <h3>Rejestracja zakończona</h3>
        <p>Poczekaj na aktywację konta przez administratora.</p>
        <p id="countdownText" class="countdown">Za 10 sekund zostaniesz przeniesiony do logowania...</p>
    </div>
</div>

<script>
    document.getElementById("regForm").addEventListener("submit", async (e) => {
        e.preventDefault();

        const form = new FormData(e.target);
        const res = await fetch("register_submit.php", {
            method: "POST",
            body: form
        });

        const j = await res.json();
        const msg = document.getElementById("msg");

        if (!j.success) {
            msg.textContent = j.error;
            msg.classList.remove("hidden");
            msg.classList.add("error");
            return;
        }

        // Ukryj komunikat błędu
        msg.classList.add("hidden");

        // Pokaż modal sukcesu
        const modal = document.getElementById("successModal");
        modal.classList.remove("hidden");

        let seconds = 10;
        const countdownText = document.getElementById("countdownText");

        countdownText.textContent = `Za ${seconds} sekund zostaniesz przeniesiony do logowania...`;

        const interval = setInterval(() => {
            seconds--;
            countdownText.textContent = `Za ${seconds} sekund zostaniesz przeniesiony do logowania...`;

            if (seconds <= 0) {
                clearInterval(interval);
                window.location.href = "/Login";
            }
        }, 1000);
    });
</script>


</body>
</html>
