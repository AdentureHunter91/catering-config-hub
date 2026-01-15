import { buildApiUrl } from "./apiBase";

export interface ProductCategory {
  id: number;
  name: string;
  status: "active" | "archived";
  sort_order: number;
  subcategory_count: number;
  created_at?: string;
  updated_at?: string;
}

export interface ProductSubcategory {
  id: number;
  category_id: number;
  name: string;
  status: "active" | "archived";
  sort_order: number;
  product_count: number;
  created_at?: string;
  updated_at?: string;
}

// Categories API
export async function fetchCategories(status: "active" | "archived" | "all" = "all"): Promise<ProductCategory[]> {
  const url = buildApiUrl(`product_categories/list.php?status=${status}`);
  const response = await fetch(url, { credentials: "include" });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || "Failed to fetch categories");
  return result.data.map((c: any) => ({
    id: Number(c.id),
    name: c.name,
    status: c.status,
    sort_order: Number(c.sort_order),
    subcategory_count: Number(c.subcategory_count || 0),
    created_at: c.created_at,
    updated_at: c.updated_at,
  }));
}

export async function createCategory(name: string): Promise<ProductCategory> {
  const url = buildApiUrl("product_categories/create.php");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ name }),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || "Failed to create category");
  return result.data;
}

export async function updateCategory(id: number, data: Partial<Pick<ProductCategory, "name" | "status" | "sort_order">>): Promise<ProductCategory> {
  const url = buildApiUrl("product_categories/update.php");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id, ...data }),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || "Failed to update category");
  return result.data;
}

export async function archiveCategory(id: number): Promise<void> {
  const url = buildApiUrl("product_categories/delete.php");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id }),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || "Failed to archive category");
}

// Subcategories API
export async function fetchSubcategories(categoryId?: number, status?: "active" | "archived"): Promise<ProductSubcategory[]> {
  let url = buildApiUrl("product_subcategories/list.php");
  const params = new URLSearchParams();
  if (categoryId) params.append("category_id", String(categoryId));
  if (status) params.append("status", status);
  if (params.toString()) url += "?" + params.toString();
  
  const response = await fetch(url, { credentials: "include" });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || "Failed to fetch subcategories");
  return result.data.map((s: any) => ({
    id: Number(s.id),
    category_id: Number(s.category_id),
    name: s.name,
    status: s.status,
    sort_order: Number(s.sort_order),
    product_count: Number(s.product_count || 0),
    created_at: s.created_at,
    updated_at: s.updated_at,
  }));
}

export async function createSubcategory(categoryId: number, name: string): Promise<ProductSubcategory> {
  const url = buildApiUrl("product_subcategories/create.php");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ category_id: categoryId, name }),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || "Failed to create subcategory");
  return result.data;
}

export async function updateSubcategory(id: number, data: Partial<Pick<ProductSubcategory, "name" | "status" | "category_id" | "sort_order">>): Promise<ProductSubcategory> {
  const url = buildApiUrl("product_subcategories/update.php");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id, ...data }),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || "Failed to update subcategory");
  return result.data;
}

export async function archiveSubcategory(id: number): Promise<void> {
  const url = buildApiUrl("product_subcategories/delete.php");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id }),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || "Failed to archive subcategory");
}

export async function reorderSubcategory(id: number, newSortOrder: number): Promise<void> {
  const url = buildApiUrl("product_subcategories/reorder.php");
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ id, new_sort_order: newSortOrder }),
  });
  const result = await response.json();
  if (!result.success) throw new Error(result.error || "Failed to reorder subcategory");
}

export async function moveSubcategory(id: number, targetCategoryId: number): Promise<ProductSubcategory> {
  return updateSubcategory(id, { category_id: targetCategoryId });
}
