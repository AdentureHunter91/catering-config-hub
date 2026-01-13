import { API_BASE } from "./apiBase";

const API = `${API_BASE}/clients`;



// ============================
// LISTA KLIENTÓW (DROP-DOWN)
// ============================
export async function getClientsList() {
    const r = await fetch(`${API}/list.php`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

// ============================
// POJEDYNCZY KLIENT
// ============================

export type Client = {
    id: number;
    short_name: string;
    full_name: string;
    nip: string;
    city: string;
    address: string;
    total_beds: number | null;      // <--- NEW
};

export async function getClient(id: number): Promise<Client> {
    const r = await fetch(`${API}/get.php?id=${id}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

// ============================
// LISTA KLIENTÓW (FULL VIEW)
// ============================
// (list_full.php – tu nie dodałeś total_beds, więc nie dodajemy)

export type ClientListFull = {
    id: number;
    short_name: string;
    full_name: string;
    nip: string;
    city: string;
    contracts_count: number;
    status: "active" | "planned" | "expired" | "none";
};

export async function getClientsFull(): Promise<ClientListFull[]> {
    const r = await fetch(`${API}/list_full.php`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error);
    return j.data;
}

// ============================
// ZAPIS KLIENTA (INSERT/UPDATE)
// ============================

export async function saveClient(data: Partial<Client>) {
    const r = await fetch(`${API}/save.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data), // <--- total_beds wysyła się automatycznie
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to save client");

    return j.data;
}
