import type { Department } from "./departments";

const API = "/Config/api/client_departments";

export type ClientDepartment = {
    id: number | null;           // null = jeszcze nie zapisany
    client_id: number;
    department_id: number | null;
    department_name?: string;
    department_short_name?: string;
    custom_name: string;
    custom_short_name: string;
    _temp?: boolean;             // lokalny wiersz tymczasowy
};

export async function getClientDepartments(clientId: number): Promise<ClientDepartment[]> {
    const r = await fetch(`${API}/list.php?client_id=${clientId}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to load client departments");
    return j.data || [];
}

export async function addClientDepartment(payload: {
    client_id: number;
    department_id: number;
    custom_name?: string;
    custom_short_name?: string;
}): Promise<ClientDepartment> {
    const r = await fetch(`${API}/add.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to add client department");

    return j.data;
}

export async function updateClientDepartment(payload: {
    id: number;
    department_id: number;
    custom_name?: string;
    custom_short_name?: string;
}): Promise<void> {
    const r = await fetch(`${API}/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to update client department");
}

export async function deleteClientDepartment(id: number): Promise<void> {
    const form = new FormData();
    form.append("id", String(id));

    const r = await fetch(`${API}/delete.php`, {
        method: "POST",
        body: form,
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to delete client department");
}
