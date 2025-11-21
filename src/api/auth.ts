export async function getMe() {
    const r = await fetch(`${window.location.origin}/Login/me.php`, {
        credentials: "include",
    });
    return await r.json();
}
