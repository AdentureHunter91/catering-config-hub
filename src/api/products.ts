// src/api/products.ts
import { API_BASE } from "./apiBase";

const API = `${API_BASE}/products`;

export type Product = {
    id: number;
    subcategory_id: number;
    name: string;
    description: string;
    status: "active" | "archived";
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

export async function archiveProduct(id: number): Promise<{ id: number; archived: boolean }> {
    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });

    const j = await r.json();
    
    if (!j.success) {
        throw new Error(j.error || "Failed to archive product");
    }
    
    return j.data;
}
