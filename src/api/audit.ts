// src/api/audit.ts
import { API_BASE } from "./apiBase.ts";

const API = `${API_BASE}/audit-log`;


export async function getAuditLog(params: {
    q?: string;
    action?: string;
    table?: string;
    date_from?: string;
    date_to?: string;
    limit?: number;
    offset?: number;
}) {
    const query = new URLSearchParams();

    if (params.q) query.set("q", params.q);
    if (params.action && params.action !== 'all') query.set("action", params.action);
    if (params.table && params.table !== 'all') query.set("table", params.table);
    if (params.date_from) query.set("date_from", params.date_from);
    if (params.date_to) query.set("date_to", params.date_to);
    if (params.limit) query.set("limit", params.limit.toString());
    if (params.offset) query.set("offset", params.offset.toString());

    const r = await fetch(`${API}/list.php?${query.toString()}`);
    const j = await r.json();

    if (!j.success) throw new Error(j.error);

    return j.data;
}
