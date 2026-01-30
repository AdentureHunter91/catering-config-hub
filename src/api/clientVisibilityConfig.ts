import { API_BASE } from "./apiBase";

const API = `${API_BASE}/client_visibility_config`;

export type ClientVisibilityConfig = {
    id?: number | null;
    visibility_name: string;
    visibility_label?: string | null;
    is_active: 0 | 1;
};

export async function getClientVisibilityConfig(
    clientId: number
): Promise<ClientVisibilityConfig[]> {
    const r = await fetch(`${API}/list.php?client_id=${clientId}`);
    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to load client visibility config");
    return j.data || [];
}

export async function updateClientVisibilityConfig(payload: {
    client_id: number;
    visibility_name: string;
    is_active: 0 | 1;
}): Promise<void> {
    const r = await fetch(`${API}/update.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
    });

    const j = await r.json();
    if (!j.success) throw new Error(j.error || "Failed to update client visibility config");
}
