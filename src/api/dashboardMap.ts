import { API_BASE } from "./apiBase";

export type ClientMapData = {
    id: number;
    short_name: string;
    full_name: string;
    city: string;
    address: string;
    total_beds: number | null;
    active_contract_beds: number | null;
    planned_contract_beds: number | null;
    status: "active" | "planned" | "expired" | "none";
    contract_id: number | null;
    kitchen_id?: number | null;
    kitchen_ids?: number[] | null;
};

export type KitchenMapData = {
    id: number;
    name: string;
    city: string;
    address: string;
    max_osobodni: number | null;
    current_osobodni: number | null;
    planned_osobodni: number | null;
    active_contracts: number;
    planned_contracts: number;
    employees: number | null;
};

export type DashboardMapData = {
    clients: ClientMapData[];
    kitchens: KitchenMapData[];
};

export async function getDashboardMapData(): Promise<DashboardMapData> {
    const r = await fetch(`${API_BASE}/dashboard/map_data.php`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to load map data");
    return j.data;
}
