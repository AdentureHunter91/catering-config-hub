import { API_BASE } from "./apiBase";

const API = `${API_BASE}/diets`;

export type Diet = {
    id: number;
    name: string;
    short_name: string;
    description?: string | null;
};

export async function getDiets(): Promise<Diet[]> {
    const r = await fetch(`${API}/list.php`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to load diets");
    return j.data || [];
}

export async function getDiet(id: number): Promise<Diet> {
    const r = await fetch(`${API}/get.php?id=${id}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to load diet");
    return j.data;
}

export async function saveDiet(data: Diet): Promise<any> {
    const r = await fetch(`${API}/save.php`, {
        method: "POST",
        body: JSON.stringify(data),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to save diet");

    return j.data;
}

export async function deleteDiet(id: number): Promise<any> {
    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        body: JSON.stringify({ id }),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to delete diet");

    return j.data;
}
