import { buildApiUrl } from "./apiBase";



const apiUrl = (p: string) => buildApiUrl(p);

async function fetchJson(url: string) {
    const res = await fetch(url, { credentials: "include" });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    return await res.json();
}

/** API może zwracać [] albo {data: []} */
function unwrapArray<T>(payload: any): T[] {
    if (Array.isArray(payload)) return payload as T[];
    if (payload && typeof payload === "object" && Array.isArray(payload.data)) return payload.data as T[];
    return [];
}

export type PickedGlobalRow = {
    meal_date: string;
    client_id: number;

    client_department_id: number | null;
    client_diet_id: number | null;
    client_meal_type_id: number | null;

    global_department_id: number | null;
    global_diet_id: number | null;
    global_meal_type_id: number | null;

    variant_label: string | null;

    quantity: number;
    status: string;
    is_after_cutoff: number;
    cutoff_at: string | null;
    updated_at: string;
    entry_id: number;

    contract_id: number | null;
    kitchen_id: number | null;
};

export async function getMealsPickedGlobal(limit = 50000): Promise<PickedGlobalRow[]> {
    const payload = await fetchJson(apiUrl(`diet/meals_table/list.php?limit=${limit}`));
    return unwrapArray<PickedGlobalRow>(payload);
}
