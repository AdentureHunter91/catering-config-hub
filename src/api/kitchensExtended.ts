const API = "/Config/api/kitchens";

export interface KitchenExtended {
    id: number;
    name: string;
    city: string;

    active_contracts: number;
    employees: number | null;
    avg_daily_meals: number | null;
    quality: number;
}

export async function getKitchensExtended(): Promise<KitchenExtended[]> {
    const r = await fetch(`${API}/list.php`);
    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to load extended kitchens list");
    }

    return j.data || [];
}
