// src/pages/PageAccessList.tsx
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";

import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { Shield, Search, Plus, Edit } from "lucide-react";

import { getPageAccessList, PageAccess } from "@/api/pageAccess";

const PageAccessList = () => {
    const {
        data: pages = [],
        isLoading,
        error,
    } = useQuery<PageAccess[]>({
        queryKey: ["pageAccessList"],
        queryFn: getPageAccessList,
    });

    const [search, setSearch] = useState("");

    const filtered = useMemo(() => {
        const s = search.toLowerCase();
        return pages.filter((p) =>
            p.page_key.toLowerCase().includes(s) ||
            (p.permission_view || "").toLowerCase().includes(s) ||
            (p.permission_read || "").toLowerCase().includes(s) ||
            (p.permission_edit || "").toLowerCase().includes(s)
        );
    }, [pages, search]);

    const totalPages = pages.length;
    const activePages = pages.filter((p) => p.is_active === 1).length;
    const withPermissions = pages.filter(
        (p) => p.permission_view || p.permission_read || p.permission_edit
    ).length;

    if (isLoading) {
        return (
            <Layout pageKey="config.page_access">
                <Breadcrumb
                    items={[
                        { label: "Konfiguracja systemu" },
                        { label: "Dostęp do stron" },
                    ]}
                />
                <div className="p-6">Ładowanie...</div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout pageKey="config.page_access">
                <Breadcrumb
                    items={[
                        { label: "Konfiguracja systemu" },
                        { label: "Dostęp do stron" },
                    ]}
                />
                <div className="p-6 text-red-500">Błąd pobierania danych.</div>
            </Layout>
        );
    }

    return (
        <Layout pageKey="config.page_access">
            <Breadcrumb
                items={[
                    { label: "Konfiguracja systemu" },
                    { label: "Dostęp do stron" },
                ]}
            />

            <div className="mb-6">
                <h1 className="text-3xl font-bold">Dostęp do stron</h1>
                <p className="mt-1 text-muted-foreground">
                    Konfiguracja powiązań stron z uprawnieniami (permissions).
                </p>
            </div>

            {/* Statystyki */}
            <div className="mb-6 grid gap-4 md:grid-cols-3">
                <StatCard
                    icon={<Shield className="h-4 w-4" />}
                    label="Wszystkie strony"
                    value={totalPages}
                    subtext="Zarejestrowane w systemie"
                />

                <StatCard
                    icon={<Shield className="h-4 w-4" />}
                    label="Aktywne strony"
                    value={activePages}
                    subtext="Wyświetlane użytkownikom"
                />

                <StatCard
                    icon={<Shield className="h-4 w-4" />}
                    label="Strony z przypisanymi uprawnieniami"
                    value={withPermissions}
                    subtext="Powiązane z permissions"
                />
            </div>

            {/* Lista stron */}
            <Card>
                <div className="border-b p-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Lista stron</h2>

                    <Link to="/dostep-stron/nowa">
                        <Button className="gap-2">
                            <Plus className="h-4 w-4" />
                            Dodaj stronę
                        </Button>
                    </Link>
                </div>

                <div className="p-4">
                    <div className="mb-4 flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Szukaj po page_key lub uprawnieniach..."
                                className="pl-10"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                            <tr className="border-b">
                                <th className="pb-3 text-left text-sm font-semibold">
                                    Page key
                                </th>
                                <th className="pb-3 text-left text-sm font-semibold">
                                    Permission view
                                </th>
                                <th className="pb-3 text-left text-sm font-semibold">
                                    Permission read
                                </th>
                                <th className="pb-3 text-left text-sm font-semibold">
                                    Permission edit
                                </th>
                                <th className="pb-3 text-left text-sm font-semibold">
                                    Status
                                </th>
                                <th className="pb-3 text-right text-sm font-semibold">
                                    Akcje
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            {filtered.map((page) => (
                                <tr key={page.id} className="border-b last:border-0">
                                    <td className="py-4 font-mono text-sm">
                                        {page.page_key}
                                    </td>
                                    <td className="py-4 text-xs font-mono text-muted-foreground">
                                        {page.permission_view || "-"}
                                    </td>
                                    <td className="py-4 text-xs font-mono text-muted-foreground">
                                        {page.permission_read || "-"}
                                    </td>
                                    <td className="py-4 text-xs font-mono text-muted-foreground">
                                        {page.permission_edit || "-"}
                                    </td>
                                    <td className="py-4">
                                        {page.is_active ? (
                                            <Badge variant="outline" className="bg-emerald-50">
                                                Aktywna
                                            </Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-muted">
                                                Wyłączona
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="py-4 text-right">
                                        <Link to={`/dostep-stron/${page.id}`}>
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
                                    <td
                                        className="py-4 text-center text-muted-foreground"
                                        colSpan={6}
                                    >
                                        Brak wyników
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

export default PageAccessList;
