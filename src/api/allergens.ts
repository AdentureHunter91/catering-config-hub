// src/api/allergens.ts
import { API_BASE } from "./apiBase";

const API = `${API_BASE}/allergens`;

export type Allergen = {
    id: string;
    name: string;
    icon: string;
};

export async function getAllergens(): Promise<Allergen[]> {
    const r = await fetch(`${API}/list.php`);
    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to load allergens");
    }

    return j.data || [];
}
