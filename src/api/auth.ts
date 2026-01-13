import { buildAuthUrl } from "./apiBase";

export async function getMe() {
    const r = await fetch(buildAuthUrl("Login/me.php"), {
        credentials: "include",
    });
    return await r.json();
}
