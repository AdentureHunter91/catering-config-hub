import { buildApiUrl } from "./apiBase";

export type NotificationRow = {
    id: number;
    type: string;
    kitchen_id: number;
    client_id: number;
    meal_date: string;
    count: number;
    first_at: string;
    last_at: string;
    last_notified_at: string | null;
    status: string;
    created_at: string;
    updated_at: string;
    read_at: string | null;
    is_read: number;
    kitchen_name?: string | null;
    kitchen_short_name?: string | null;
    client_full_name?: string | null;
    client_short_name?: string | null;
};

export async function listNotifications(params: {
    status?: "open" | "closed";
    type?: string;
    unreadOnly?: boolean;
    limit?: number;
    offset?: number;
} = {}) {
    const search = new URLSearchParams();
    if (params.status) search.set("status", params.status);
    if (params.type) search.set("type", params.type);
    if (params.unreadOnly) search.set("unread_only", "1");
    if (params.limit != null) search.set("limit", String(params.limit));
    if (params.offset != null) search.set("offset", String(params.offset));

    const url = buildApiUrl(`notifications/list.php?${search.toString()}`);
    const res = await fetch(url, { credentials: "include" });
    const payload = await res.json();
    if (!payload.success) throw new Error(payload.error || "BĹ‚Ä…d pobierania powiadomieĹ„");
    return payload.data as { rows: NotificationRow[]; limit: number; offset: number };
}

export async function markNotificationsRead(eventIds: number[]) {
    const url = buildApiUrl("notifications/mark_read.php");
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({ event_ids: eventIds }),
    });
    const payload = await res.json();
    if (!payload.success) throw new Error(payload.error || "BĹ‚Ä…d zapisu odczytu");
    return payload.data as { updated: number };
}

export type RoleNotificationSettingRow = {
    role_id: number;
    role_name: string;
    role_description: string | null;
    inapp_enabled: number | null;
    email_enabled: number | null;
};

export async function listRoleNotificationSettings(type = "diet_meal_approval_pending") {
    const url = buildApiUrl(`notifications/role_settings/list.php?type=${encodeURIComponent(type)}`);
    const res = await fetch(url, { credentials: "include" });
    const payload = await res.json();
    if (!payload.success) throw new Error(payload.error || "BĹ‚Ä…d pobierania ustawieĹ„ rĂłl");
    return payload.data as { type: string; rows: RoleNotificationSettingRow[] };
}

export async function saveRoleNotificationSetting(params: {
    roleId: number;
    type: string;
    inappEnabled: boolean;
    emailEnabled?: boolean;
}) {
    const url = buildApiUrl("notifications/role_settings/save.php");
    const res = await fetch(url, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json; charset=utf-8" },
        body: JSON.stringify({
            role_id: params.roleId,
            type: params.type,
            inapp_enabled: params.inappEnabled ? 1 : 0,
            email_enabled: params.emailEnabled ? 1 : 0,
        }),
    });
    const payload = await res.json();
    if (!payload.success) throw new Error(payload.error || "BĹ‚Ä…d zapisu ustawieĹ„ rĂłl");
    return payload.data;
}
