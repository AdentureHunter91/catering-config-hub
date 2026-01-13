// src/api/clientContacts.ts
import { API_BASE } from "./apiBase.ts";

export type ClientContact = {
    id: number;
    client_id: number;
    full_name: string | null;
    position: string | null;
    phone: string | null;
    email: string | null;
    notes: string | null;
};

const API = `${API_BASE}/clientContacts`;

async function handleResponse(res: Response) {
    const json = await res.json();
    if (!res.ok || json.success === false) {
        throw new Error(json.error || "REQUEST_FAILED");
    }
    return json.data;
}

export async function getClientContacts(clientId: number): Promise<ClientContact[]> {
    const res = await fetch(`${API}/list.php?client_id=${clientId}`, {
        method: "GET",
        credentials: "include",
    });
    return handleResponse(res);
}

type CreateContactPayload = {
    client_id: number;
    full_name?: string | null;
    position?: string | null;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
};

export async function addClientContact(payload: CreateContactPayload): Promise<ClientContact> {
    const res = await fetch(`${API}/create.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

type UpdateContactPayload = {
    id: number;
    full_name?: string | null;
    position?: string | null;
    phone?: string | null;
    email?: string | null;
    notes?: string | null;
};

export async function updateClientContact(payload: UpdateContactPayload): Promise<ClientContact> {
    const res = await fetch(`${API}/update.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });
    return handleResponse(res);
}

export async function deleteClientContact(id: number): Promise<void> {
    const res = await fetch(`${API}/delete.php`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
    });
    await handleResponse(res);
}
