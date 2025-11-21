import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";

import { getClientsFull, ClientListFull } from "@/api/clients";

const ClientsList = () => {
    const navigate = useNavigate();

    const [clients, setClients] = useState<ClientListFull[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        getClientsFull()
            .then(setClients)
            .catch((err) => console.error("Błąd pobierania klientów:", err));
    }, []);

    const filtered = clients.filter((c) => {
        const s = search.toLowerCase();
        return (
            c.short_name.toLowerCase().includes(s) ||
            c.full_name.toLowerCase().includes(s) ||
            c.city.toLowerCase().includes(s) ||
            c.nip.includes(s)
        );
    });

    const statusBadge = (s: string) => {
        switch (s) {
            case "active":
                return (
                    <Badge className="bg-emerald-500 text-white hover:bg-emerald-600">
                        Aktywny
                    </Badge>
                );
            case "planned":
                return (
                    <Badge className="bg-blue-500 text-white hover:bg-blue-600">
                        Planowany
                    </Badge>
                );
            case "expired":
                return (
                    <Badge className="bg-slate-400 text-white hover:bg-slate-500">
                        Wygasły
                    </Badge>
                );
            default:
                return (
                    <Badge
                        variant="outline"
                        className="border-slate-300 text-slate-600 bg-white"
                    >
                        Brak umów
                    </Badge>
                );
        }
    };

    return (
        <Layout pageKey="config.clients_list">
            <Breadcrumb items={[{ label: "Konfiguracja systemu" }, { label: "Klienci" }]} />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">Klienci</h1>
                <p className="mt-1 text-muted-foreground">
                    Zarządzanie klientami i ich kontraktami
                </p>
            </div>

            <Card>
                {/* Header */}
                <div className="border-b p-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-foreground">Lista klientów</h2>

                    <Button className="gap-2" onClick={() => navigate("/klienci/nowy")}>
                        <Plus className="h-4 w-4" />
                        Dodaj klienta
                    </Button>
                </div>

                {/* Search bar */}
                <div className="p-4">
                    <div className="mb-4 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Szukaj klientów..."
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                            <tr className="border-b">
                                <th className="pb-3 text-left font-semibold">Nazwa skrócona</th>
                                <th className="pb-3 text-left font-semibold">Pełna nazwa</th>
                                <th className="pb-3 text-left font-semibold">NIP</th>
                                <th className="pb-3 text-left font-semibold">Miasto</th>
                                <th className="pb-3 text-left font-semibold">Status</th>
                                <th className="pb-3 text-left font-semibold">Kontrakty</th>
                                <th className="pb-3 text-right font-semibold">Akcje</th>
                            </tr>
                            </thead>

                            <tbody>
                            {filtered.map((client) => (
                                <tr key={client.id} className="border-b last:border-0">
                                    <td className="py-4 font-medium">{client.short_name}</td>
                                    <td className="py-4 text-muted-foreground">{client.full_name}</td>
                                    <td className="py-4 text-muted-foreground">{client.nip}</td>
                                    <td className="py-4 text-muted-foreground">{client.city}</td>
                                    <td className="py-4">{statusBadge(client.status)}</td>
                                    <td className="py-4 text-muted-foreground">{client.contracts_count}</td>

                                    <td className="py-4 text-right">
                                        <Link to={`/klienci/${client.id}`}>
                                            <Button variant="ghost" size="sm" className="gap-2">
                                                <Edit className="h-4 w-4" />
                                                Edytuj
                                            </Button>
                                        </Link>
                                    </td>
                                </tr>
                            ))}

                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-6 text-center text-muted-foreground">
                                        Brak klientów spełniających kryteria wyszukiwania.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Card>
        </Layout>
    );
};

export default ClientsList;
