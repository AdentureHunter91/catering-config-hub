// src/api/audit.ts
import { API_BASE } from "./apiBase.ts";

const API = `${API_BASE}/audit-log`;


export async function getAuditLog(params: {
    q?: string;
    action?: string;
    table?: string;
}) {
    const query = new URLSearchParams();

    if (params.q) query.set("q", params.q);
    if (params.action) query.set("action", params.action);
    if (params.table) query.set("table", params.table);

    const r = await fetch(`${API}/list.php?${query.toString()}`);
    const j = await r.json();

    if (!j.success) throw new Error(j.error);

    return j.data;
}