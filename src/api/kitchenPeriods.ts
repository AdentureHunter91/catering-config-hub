// src/api/kitchenPeriods.ts
import { API_BASE } from "./apiBase";

const API = `${API_BASE}/contracts/kitchen_periods`;


export type KitchenPeriodPayload = {
    id?: number;
    contract_id?: number;
    kitchen_id: number;
    start_date: string;
    end_date: string | null;
};

// GET listy okresów dla kontraktu
export async function getKitchenPeriods(contractId: number) {
    const r = await fetch(`${API}/list.php?contract_id=${contractId}`);
    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to load kitchen periods");
    }

    return j.data || [];
}

// ADD – dodanie nowego okresu
export async function addKitchenPeriod(payload: {
    contract_id: number;
    kitchen_id: number;
    start_date: string;
    end_date: string | null;
}) {
    const r = await fetch(`${API}/add.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const j = await r.json();
    if (!j.success) {
        throw new Error(j.error || "Failed to add kitchen period");
    }

    // add.php zwraca nowy rekord (id, contract_id, kitchen_id, start_date, end_date)
    return j.data;
}

// UPDATE – aktualizacja istniejącego okresu
export async function updateKitchenPeriod(payload: KitchenPeriodPayload) {
    const r = await fetch(`${API}/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const j = await r.json();
    if (!j.success) {
        throw new Error(j.error || "Failed to update kitchen period");
    }

    return j.data;
}

// DELETE – usunięcie okresu
export async function deleteKitchenPeriod(id: number) {
    const form = new FormData();
    form.append("id", String(id));

    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        body: form,
    });

    const j = await r.json();
    if (!j.success) {
        throw new Error(j.error || "Failed to delete kitchen period");
    }

    return j.data;
}
