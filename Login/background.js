const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");

function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resize();
window.onresize = resize;

// --- PREMIUM LIQUID PLATES + STEAM EFFECT ---
let t = 0;

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // gradient background - brighter, premium
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#ffffff");
    gradient.addColorStop(1, "#e9f6ff");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- Large soft plate-like circles ---
    const plates = [
        { x: canvas.width * 0.3, y: canvas.height * 0.35, r: 420 },
        { x: canvas.width * 0.75, y: canvas.height * 0.25, r: 360 },
        { x: canvas.width * 0.55, y: canvas.height * 0.75, r: 500 },
    ];

    ctx.globalAlpha = 0.14;
    plates.forEach((p, i) => {
        ctx.beginPath();
        ctx.arc(
            p.x + Math.sin(t * 0.002 + i) * 18,
            p.y + Math.cos(t * 0.002 + i) * 18,
            p.r + Math.sin(t * 0.003 + i) * 20,
            0,
            Math.PI * 2
        );
        ctx.fillStyle = ["#d8eeff", "#fef6e7", "#e0f2ff"][i];
        ctx.fill();
    });
    ctx.globalAlpha = 1;

    // --- Soft flowing steam/wave layers ---
    for (let i = 0; i < 4; i++) {
        ctx.beginPath();
        ctx.moveTo(0, canvas.height * (0.3 + i * 0.15));

        for (let x = 0; x < canvas.width; x += 10) {
            const y =
                canvas.height * (0.3 + i * 0.15) +
                Math.sin((x * 0.003) + (t * 0.005) + i) * 30;
            ctx.lineTo(x, y);
        }

        ctx.strokeStyle = `rgba(180, 210, 255, ${0.14 - i * 0.03})`;
        ctx.lineWidth = 90;
        ctx.stroke();
    }

    t += 1.5;
    requestAnimationFrame(draw);
}

draw();
