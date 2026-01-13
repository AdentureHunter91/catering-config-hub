import { API_BASE } from "./apiBase";

const API = `${API_BASE}/client_diets`;



export type ClientDiet = {
    id: number | null;
    client_id: number;
    diet_id: number | null;
    diet_name?: string;
    diet_short_name?: string;
    custom_name: string;
    custom_short_name: string;
    _temp?: boolean;
};

export async function getClientDiets(clientId: number): Promise<ClientDiet[]> {
    const r = await fetch(`${API}/list.php?client_id=${clientId}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to load client diets");
    return j.data || [];
}

export async function addClientDiet(payload: {
    client_id: number;
    diet_id: number;
    custom_name?: string;
    custom_short_name?: string;
}): Promise<ClientDiet> {
    const r = await fetch(`${API}/add.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to add client diet");

    return j.data;
}

export async function updateClientDiet(payload: {
    id: number;
    diet_id: number;
    custom_name?: string;
    custom_short_name?: string;
}): Promise<void> {
    const r = await fetch(`${API}/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to update client diet");
}

export async function deleteClientDiet(id: number): Promise<void> {
    const form = new FormData();
    form.append("id", String(id));

    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        body: form,
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to delete client diet");
}
