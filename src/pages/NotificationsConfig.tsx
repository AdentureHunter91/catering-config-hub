import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listRoleNotificationSettings, saveRoleNotificationSetting, RoleNotificationSettingRow } from "@/api/notifications";

const NOTIFICATION_TYPE = "diet_meal_approval_pending";

const NotificationsConfig = () => {
    const [rows, setRows] = useState<RoleNotificationSettingRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [saving, setSaving] = useState<Record<number, boolean>>({});

    const load = async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await listRoleNotificationSettings(NOTIFICATION_TYPE);
            setRows(data.rows || []);
        } catch (e: any) {
            setError(e?.message || "BĹ‚Ä…d pobierania ustawieĹ„");
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const toggleInApp = async (roleId: number, nextValue: boolean) => {
        try {
            setSaving((p) => ({ ...p, [roleId]: true }));
            await saveRoleNotificationSetting({
                roleId,
                type: NOTIFICATION_TYPE,
                inappEnabled: nextValue,
                emailEnabled: false,
            });
            setRows((prev) =>
                prev.map((r) =>
                    r.role_id === roleId ? { ...r, inapp_enabled: nextValue ? 1 : 0 } : r
                )
            );
        } catch (e: any) {
            setError(e?.message || "BĹ‚Ä…d zapisu ustawieĹ„");
        } finally {
            setSaving((p) => ({ ...p, [roleId]: false }));
        }
    };

    return (
        <Layout pageKey="config.page_access">
            <Breadcrumb items={[{ label: "Ustawienia" }, { label: "Powiadomienia" }]} />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">Powiadomienia — konfiguracja ról</h1>
                <p className="mt-1 text-muted-foreground">
                    Ustaw, które role dostają powiadomienia w aplikacji. Obecnie: dietetyka (korekty po czasie).
                </p>
            </div>

            <Card>
                <div className="border-b p-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Role i powiadomienia</h2>
                    <Button variant="outline" onClick={load} disabled={loading}>
                        Odśwież
                    </Button>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="text-sm text-muted-foreground">Ładowanie…</div>
                    ) : error ? (
                        <div className="text-sm text-rose-600">{error}</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="pb-3 text-left text-xs font-semibold text-foreground">Rola</th>
                                        <th className="pb-3 text-left text-xs font-semibold text-foreground">Opis</th>
                                        <th className="pb-3 text-right text-xs font-semibold text-foreground">
                                            In-app (dietetyka)
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r) => {
                                        const enabled = (r.inapp_enabled ?? 0) === 1;
                                        const isSaving = saving[r.role_id];
                                        return (
                                            <tr key={r.role_id} className="border-b last:border-0">
                                                <td className="py-3 text-sm text-foreground whitespace-nowrap">
                                                    {r.role_name}
                                                </td>
                                                <td className="py-3 text-sm text-muted-foreground">
                                                    {r.role_description || "â€”"}
                                                </td>
                                                <td className="py-3 text-right">
                                                    <label className="inline-flex items-center gap-2 text-sm">
                                                        <input
                                                            type="checkbox"
                                                            checked={enabled}
                                                            disabled={isSaving}
                                                            onChange={(e) => toggleInApp(r.role_id, e.target.checked)}
                                                            className="h-4 w-4"
                                                        />
                                                        <span>{enabled ? "Włączone" : "Wyłączone"}</span>
                                                    </label>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                    {rows.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="py-6 text-center text-muted-foreground">
                                                Brak danych
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>
        </Layout>
    );
};

export default NotificationsConfig;
