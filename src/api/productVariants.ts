// src/api/productVariants.ts
import { API_BASE } from "./apiBase";

const API = `${API_BASE}/product_variants`;

export type ProductVariant = {
    id: number;
    subproduct_id: number | null;
    ean: string;
    name: string;
    content: string;
    unit: string;
    sku: string;
    kcal: number | null;
    brands: string;
    categories: string;
    image_url: string;
};

export type ProductVariantPayload = Omit<ProductVariant, 'id'> & { id?: number };

export async function getProductVariants(subproductId?: number): Promise<ProductVariant[]> {
    const url = subproductId 
        ? `${API}/list.php?subproduct_id=${subproductId}` 
        : `${API}/list.php`;
    
    const r = await fetch(url);
    const j = await r.json();

    if (!j.success) {
        throw new Error(j.error || "Failed to load product variants");
    }

    return j.data || [];
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

export async function deleteProductVariant(id: number): Promise<{ id: number; deleted: boolean }> {
    const form = new FormData();
    form.append("id", String(id));

    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        body: form,
    });

    const j = await r.json();
    
    if (!j.success) {
        throw new Error(j.error || "Failed to delete product variant");
    }
    
    return j.data;
}
