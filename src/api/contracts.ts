import { API_BASE } from "./apiBase";

const API = `${API_BASE}/contracts`;

export async function getContracts(clientId?: number) {
    let url = `${API}/list.php`;
    if (clientId) {
        url += `?client_id=${clientId}`;
    }

    const r = await fetch(url);
    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to load contracts list");
    }

    return j.data || [];
}

export async function getContract(id: number) {
    const r = await fetch(`${API}/get.php?id=${id}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function saveContract(data: any) {
    const r = await fetch(`${API}/save.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function deleteContract(id: number) {
    const form = new FormData();
    form.append("id", String(id));

    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        body: form,
    });

    return r.json();
}
