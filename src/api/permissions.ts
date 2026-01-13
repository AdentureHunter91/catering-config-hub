import { API_BASE } from "./apiBase";

const API = `${API_BASE}/permissions`;

export async function getPermissions() {
    const r = await fetch(`${API}/list.php`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function getPermission(id: number) {
    const r = await fetch(`${API}/get.php?id=${id}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function createPermission(payload: any) {
    const r = await fetch(`${API}/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function updatePermission(payload: any) {
    const r = await fetch(`${API}/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function deletePermission(id: number) {
    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}
