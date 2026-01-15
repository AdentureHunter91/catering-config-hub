// src/api/subproducts.ts
import { API_BASE } from "./apiBase";

const API = `${API_BASE}/subproducts`;

export type SubProduct = {
    id: number;
    product_id: number;
    name: string;
    status: "active" | "archived";
    nutrition_database_id: number | null;
    allergens: string[];
    // Nutritional values
    energy_kj: number | null;
    energy_kcal: number | null;
    energy_kj_1169: number | null;
    energy_kcal_1169: number | null;
    water: number | null;
    protein_animal: number | null;
    protein_plant: number | null;
    fat: number | null;
    carbohydrates: number | null;
    fiber: number | null;
    sodium: number | null;
    salt: number | null;
    potassium: number | null;
    calcium: number | null;
    phosphorus: number | null;
    magnesium: number | null;
    iron: number | null;
    vitamin_d: number | null;
    vitamin_c: number | null;
    cholesterol: number | null;
};

export type SubProductPayload = Omit<SubProduct, 'id'> & { id?: number };

export async function getSubProducts(productId?: number, status?: string): Promise<SubProduct[]> {
    let url = `${API}/list.php`;
    const params = new URLSearchParams();
    
    if (productId) params.append("product_id", productId.toString());
    if (status) params.append("status", status);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const r = await fetch(url);
    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to load subproducts");
    }

    return j.data || [];
}

export async function getSubProduct(id: number): Promise<SubProduct> {
    const r = await fetch(`${API}/get.php?id=${id}`);
    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to load subproduct");
    }

    return j.data;
}

export async function createSubProduct(payload: SubProductPayload): Promise<{ id: number; created: boolean }> {
    const r = await fetch(`${API}/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    
    const j = await r.json();
    
    if (!j.success) {
        throw new Error(j.error || "Failed to create subproduct");
    }
    
    return j.data;
}

export async function updateSubProduct(payload: SubProduct): Promise<{ id: number; updated: boolean }> {
    const r = await fetch(`${API}/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    
    const j = await r.json();
    
    if (!j.success) {
        throw new Error(j.error || "Failed to update subproduct");
    }
    
    return j.data;
}

export async function archiveSubProduct(id: number): Promise<{ id: number; archived: boolean }> {
    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });

    const j = await r.json();
    
    if (!j.success) {
        throw new Error(j.error || "Failed to archive subproduct");
    }
    
    return j.data;
}
