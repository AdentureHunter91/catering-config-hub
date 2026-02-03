import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { listNotifications, markNotificationsRead, NotificationRow } from "@/api/notifications";
import { cn } from "@/lib/utils";

const NotificationsHistory = () => {
    const [rows, setRows] = useState<NotificationRow[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await listNotifications({ status: "open", unreadOnly: false, limit: 200 });
            setRows(data.rows || []);
        } catch (e: any) {
            setError(e?.message || "Błąd pobierania powiadomień");
            setRows([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void load();
    }, []);

    const markRead = async (id: number) => {
        try {
            await markNotificationsRead([id]);
            await load();
        } catch (e: any) {
            setError(e?.message || "Błąd oznaczania powiadomienia");
        }
    };

    const labelForType = (type: string) => {
        if (type === "diet_meal_approval_pending") return "Korekty po czasie";
        return type;
    };

    return (
        <Layout pageKey="config.page_access">
            <Breadcrumb items={[{ label: "Ustawienia" }, { label: "Powiadomienia — historia" }]} />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">Historia powiadomień</h1>
                <p className="mt-1 text-muted-foreground">Lista wszystkich powiadomień (przeczytane i nieprzeczytane).</p>
            </div>

            <Card>
                <div className="border-b p-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Powiadomienia</h2>
                    <Button variant="outline" onClick={load} disabled={loading}>
                        Odśwież
                    </Button>
                </div>

                <div className="p-4">
                    {loading ? (
                        <div className="text-sm text-muted-foreground">Ładowanie…</div>
                    ) : error ? (
                        <div className="text-sm text-rose-600">{error}</div>
                    ) : rows.length === 0 ? (
                        <div className="text-sm text-muted-foreground">Brak powiadomień</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b">
                                        <th className="pb-3 text-left text-xs font-semibold text-foreground">Typ</th>
                                        <th className="pb-3 text-left text-xs font-semibold text-foreground">Kuchnia</th>
                                        <th className="pb-3 text-left text-xs font-semibold text-foreground">Klient</th>
                                        <th className="pb-3 text-left text-xs font-semibold text-foreground">Data posiłku</th>
                                        <th className="pb-3 text-right text-xs font-semibold text-foreground">Ilość</th>
                                        <th className="pb-3 text-left text-xs font-semibold text-foreground">Ostatnia zmiana</th>
                                        <th className="pb-3 text-left text-xs font-semibold text-foreground">Status</th>
                                        <th className="pb-3 text-right text-xs font-semibold text-foreground">Akcje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rows.map((r) => {
                                        const kitchen = r.kitchen_short_name || r.kitchen_name || "—";
                                        const client = r.client_short_name || r.client_full_name || `#${r.client_id}`;
                                        const isRead = r.is_read === 1;
                                        return (
                                            <tr key={r.id} className="border-b last:border-0">
                                                <td className="py-3 text-sm text-foreground">{labelForType(r.type)}</td>
                                                <td className="py-3 text-sm text-foreground">{kitchen}</td>
                                                <td className="py-3 text-sm text-foreground">{client}</td>
                                                <td className="py-3 text-sm text-foreground">{r.meal_date}</td>
                                                <td className="py-3 text-sm text-right text-foreground">{r.count}</td>
                                                <td className="py-3 text-sm text-muted-foreground">{r.last_at}</td>
                                                <td className="py-3 text-sm">
                                                    <span
                                                        className={cn(
                                                            "px-2 py-1 rounded text-xs font-medium",
                                                            isRead ? "bg-muted text-foreground" : "bg-amber-100 text-amber-800"
                                                        )}
                                                    >
                                                        {isRead ? "Przeczytane" : "Nieprzeczytane"}
                                                    </span>
                                                </td>
                                                <td className="py-3 text-right">
                                                    {!isRead && (
                                                        <Button size="sm" variant="outline" onClick={() => void markRead(r.id)}>
                                                            Oznacz jako przeczytane
                                                        </Button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Card>
        </Layout>
    );
};

export default NotificationsHistory;
