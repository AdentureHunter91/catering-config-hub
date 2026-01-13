import { API_BASE } from "./apiBase";

const API = `${API_BASE}/users`;

export async function getUsers() {
    const r = await fetch(`${API}/list.php`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function getUser(id: number) {
    const r = await fetch(`${API}/get.php?id=${id}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function createUser(payload: any) {
    const r = await fetch(`${API}/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function updateUser(payload: any) {
    const r = await fetch(`${API}/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function deleteUser(id: number) {
    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function setUserRoles(userId: number, roleIds: number[]) {
    const r = await fetch(`${API}/setRoles.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, roleIds }),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}
