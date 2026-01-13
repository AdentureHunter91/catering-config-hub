import { API_BASE } from "./apiBase";

const API = `${API_BASE}/meal_types`;

export type MealType = {
    id: number;
    name: string;
    short_name: string;
    sort_order: number;
    description?: string | null;
};

export async function getMealTypes(): Promise<MealType[]> {
    const r = await fetch(`${API}/list.php`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to load meal types");
    return j.data || [];
}

export async function getMealType(id: number): Promise<MealType> {
    const r = await fetch(`${API}/get.php?id=${id}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to load meal type");
    return j.data;
}

export async function saveMealType(data: MealType): Promise<any> {
    const r = await fetch(`${API}/save.php`, {
        method: "POST",
        body: JSON.stringify(data),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to save meal type");

    return j.data;
}

export async function deleteMealType(id: number): Promise<any> {
    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        body: JSON.stringify({ id }),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to delete meal type");

    return j.data;
}
