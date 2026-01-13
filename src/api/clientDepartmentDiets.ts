import { API_BASE } from "./apiBase";

const API = `${API_BASE}/client_department_diets`;

export type ClientDepartmentDiet = {
    id: number;
    client_department_id: number;
    client_diet_id: number;
    is_default: 0 | 1;
    is_active: 0 | 1;
    department_name?: string;
    department_short_name?: string;
    diet_name?: string;
    diet_short_name?: string;
};

export async function getClientDepartmentDiets(
    clientId: number
): Promise<ClientDepartmentDiet[]> {
    const r = await fetch(`${API}/list.php?client_id=${clientId}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to load department diets");
    return j.data || [];
}

export async function addClientDepartmentDiet(payload: {
    client_department_id: number;
    client_diet_id: number;
    is_default?: 0 | 1;
    is_active?: 0 | 1;
}): Promise<ClientDepartmentDiet> {
    const r = await fetch(`${API}/add.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const j = await r.json();
    if (!j.success)
        throw new Error(j.error || "Failed to add department diet");

    return j.data;
}

export async function updateClientDepartmentDiet(payload: {
    id: number;
    is_default?: 0 | 1;
    is_active?: 0 | 1;
}): Promise<void> {
    const r = await fetch(`${API}/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const j = await r.json();
    if (!j.success)
        throw new Error(j.error || "Failed to update department diet");
}

export async function deleteClientDepartmentDiet(id: number): Promise<void> {
    const form = new FormData();
    form.append("id", String(id));

    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        body: form,
    });

    const j = await r.json();
    if (!j.success)
        throw new Error(j.error || "Failed to delete department diet");
}
