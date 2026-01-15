// src/api/products.ts
import { API_BASE } from "./apiBase";

const API = `${API_BASE}/products`;

export type Product = {
    id: number;
    subcategory_id: number;
    name: string;
    description: string;
    status: "active" | "archived";
    // Nutrition database link
    nutrition_database_id: number | null;
    // Nutritional values
    energy_kj: number | null;
    energy_kcal: number | null;
    energy_kj_1169: number | null;
    energy_kcal_1169: number | null;
    water: number | null;
    protein_animal: number | null;
    protein_plant: number | null;
    fat: number | null;
    saturated_fat: number | null;
    carbohydrates: number | null;
    sugars: number | null;
    fiber: number | null;
    sodium: number | null;
    salt: number | null;
    potassium: number | null;
    calcium: number | null;
    phosphorus: number | null;
    magnesium: number | null;
    iron: number | null;
    zinc: number | null;
    vitamin_a: number | null;
    vitamin_d: number | null;
    vitamin_e: number | null;
    vitamin_c: number | null;
    vitamin_b1: number | null;
    vitamin_b2: number | null;
    vitamin_b6: number | null;
    vitamin_b12: number | null;
    folate: number | null;
    niacin: number | null;
    cholesterol: number | null;
    // Allergens
    allergens: string[];
};

export type ProductPayload = Omit<Product, 'id'> & { id?: number };

export async function getProducts(subcategoryId?: number, status?: string): Promise<Product[]> {
    let url = `${API}/list.php`;
    const params = new URLSearchParams();
    
    if (subcategoryId) params.append("subcategory_id", subcategoryId.toString());
    if (status) params.append("status", status);
    
    if (params.toString()) url += `?${params.toString()}`;
    
    const r = await fetch(url);
    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to load products");
    }

    return j.data || [];
}

export async function getProduct(id: number): Promise<Product> {
    const r = await fetch(`${API}/get.php?id=${id}`);
    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to load product");
    }

    return j.data;
}

export async function createProduct(payload: ProductPayload): Promise<{ id: number; created: boolean }> {
    const r = await fetch(`${API}/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    
    const j = await r.json();
    
    if (!j.success) {
        throw new Error(j.error || "Failed to create product");
    }
    
    return j.data;
}

export async function updateProduct(payload: Product): Promise<{ id: number; updated: boolean }> {
    const r = await fetch(`${API}/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    
    const j = await r.json();
    
    if (!j.success) {
        throw new Error(j.error || "Failed to update product");
    }
    
    return j.data;
}

export async function archiveProduct(id: number, restore: boolean = false): Promise<{ id: number; status: string; cascaded: boolean }> {
    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, restore }),
    });

    const j = await r.json();
    
    if (!j.success) {
        throw new Error(j.error || "Failed to archive/restore product");
    }
    
    return j.data;
}
