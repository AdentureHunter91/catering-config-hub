// src/api/kitchens.ts
import { API_BASE } from "./apiBase";

const API = `${API_BASE}/contracts`;

export type Kitchen = {
    id: number;
    name: string;
};

export async function getKitchens(): Promise<Kitchen[]> {
    const r = await fetch(`${API}/list_kitchens.php`);
    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to load kitchens");
    }

    return j.data || [];
}
