// src/api/pageAccess.ts
import { API_BASE } from "./apiBase";


export type PageAccess = {
    id?: number;
    page_key: string;
    permission_view: string | null;
    permission_read: string | null;
    permission_edit: string | null;
    is_active: number;
    created_at?: string;
    updated_at?: string;
};

const BASE = `${API_BASE}/pageAccess`;

export const getPageAccessList = async (): Promise<PageAccess[]> => {
    const res = await fetch(`${BASE}/list.php`);
    if (!res.ok) throw new Error("Błąd pobierania listy page_access");
    return res.json();
};

export const getPageAccess = async (id: number): Promise<PageAccess> => {
    const res = await fetch(`${BASE}/get.php?id=${id}`);
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Błąd pobierania rekordu");
    return data.data;
};

export const savePageAccess = async (payload: PageAccess): Promise<number> => {
    const res = await fetch(`${BASE}/save.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Błąd zapisu");
    return data.id;
};

export const deletePageAccess = async (id: number): Promise<void> => {
    const res = await fetch(`${BASE}/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });

    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Błąd usuwania");
};
