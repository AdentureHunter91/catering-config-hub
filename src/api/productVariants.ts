// src/api/productVariants.ts
import { API_BASE } from "./apiBase";

const API = `${API_BASE}/product_variants`;

export type ProductVariant = {
    id: number;
    product_id: number | null;
    ean: string;
    name: string;
    content: string;
    unit: string;
    sku: string;
    status: "active" | "archived";
    brands: string;
    categories: string;
    image_url: string;
    allergens: string[];
    // Nutritional values
    nutrition_database_id: number | null;
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

export type ProductVariantPayload = Omit<ProductVariant, 'id'> & { id?: number };

export async function getProductVariants(productId?: number, status?: string): Promise<ProductVariant[]> {
    const params = new URLSearchParams();
    if (productId) params.append('product_id', productId.toString());
    if (status) params.append('status', status);
    
    const url = params.toString() 
        ? `${API}/list.php?${params.toString()}` 
        : `${API}/list.php`;
    
    const r = await fetch(url);
    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to load product variants");
    }

    return j.data || [];
}

export async function getProductVariant(id: number): Promise<ProductVariant> {
    const r = await fetch(`${API}/get.php?id=${id}`);
    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to load product variant");
    }

    return j.data;
}

export async function createProductVariant(payload: ProductVariantPayload): Promise<{ id: number; created: boolean }> {
    const r = await fetch(`${API}/create.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    
    const j = await r.json();
    
    if (!j.success) {
        throw new Error(j.error || "Failed to create product variant");
    }
    
    return j.data;
}

export async function updateProductVariant(payload: ProductVariant): Promise<{ id: number; updated: boolean }> {
    const r = await fetch(`${API}/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    
    const j = await r.json();
    
    if (!j.success) {
        throw new Error(j.error || "Failed to update product variant");
    }
    
    return j.data;
}

export async function archiveProductVariant(id: number): Promise<{ id: number; archived: boolean }> {
    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });

    const j = await r.json();
    
    if (!j.success) {
        throw new Error(j.error || "Failed to archive product variant");
    }
    
    return j.data;
}
