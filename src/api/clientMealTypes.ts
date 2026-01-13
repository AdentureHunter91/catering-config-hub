import { API_BASE } from "./apiBase";

const API = `${API_BASE}/clients/mealTypes`;



export async function getClientMealTypes(clientId: number) {
    const r = await fetch(`${API}/list.php?client_id=${clientId}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

export async function updateClientMealType(payload: any) {
    const r = await fetch(`${API}/update.php`, {
        method: "POST",
        body: JSON.stringify(payload),
    });
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}
