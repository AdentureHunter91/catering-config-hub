// src/pages/PageAccessConfig.tsx
import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "@/components/ui/select";

import { Trash2, Save } from "lucide-react";
import { toast } from "sonner";


import {
    getPageAccess,
    savePageAccess,
    deletePageAccess,
    PageAccess,
} from "@/api/pageAccess";
import { getPermissions } from "@/api/permissions";

const PageAccessConfig = () => {
    const { id } = useParams<{ id: string }>();
    const isNew = id === "nowa";
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [form, setForm] = useState<PageAccess>({
        page_key: "",
        permission_view: null,
        permission_read: null,
        permission_edit: null,
        is_active: 1,
    });

    // Permissions list
    const {
        data: permissions = [],
        isLoading: permsLoading,
        error: permsError,
    } = useQuery({
        queryKey: ["permissions"],
        queryFn: getPermissions,
    });

    // Load pageAccess data
    const {
        data: pageData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["pageAccess", id],
        queryFn: async () => {
            if (isNew) return null;
            return await getPageAccess(Number(id));
        },
        enabled: !isNew,
    });

    useEffect(() => {
        if (pageData) {
            setForm({
                id: pageData.id,
                page_key: pageData.page_key,
                permission_view: pageData.permission_view ?? null,
                permission_read: pageData.permission_read ?? null,
                permission_edit: pageData.permission_edit ?? null,
                is_active: pageData.is_active,
            });
        }
    }, [pageData]);

    const saveMutation = useMutation({
        mutationFn: (payload: PageAccess) => savePageAccess(payload),
        onSuccess: (newId) => {
            toast.success("Zapisano konfigurację strony");
            queryClient.invalidateQueries({ queryKey: ["pageAccessList"] });
            navigate(`/dostep-stron/${newId}`);
        },
        onError: (err: any) => {
            toast.error(err.message || "Błąd zapisu");
        }
    });

    const deleteMutation = useMutation({
        mutationFn: (id: number) => deletePageAccess(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["pageAccessList"] });
            navigate(`/dostep-stron`);
        },
    });

    const handleChange = (field: keyof PageAccess, value: any) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const sortedPermissions = useMemo(
        () => [...permissions].sort((a: any, b: any) => a.name.localeCompare(b.name)),
        [permissions]
    );

    if (isLoading) {
        return (
            <Layout pageKey="config.page_access">
                <Breadcrumb
                    items={[
                        { label: "Konfiguracja systemu" },
                        { label: "Dostęp do stron", href: "/dostep-stron" },
                        { label: isNew ? "Nowa strona" : "Edycja strony" },
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
                        { label: "Dostęp do stron", href: "/dostep-stron" },
                        { label: isNew ? "Nowa strona" : "Edycja strony" },
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
                    { label: "Dostęp do stron", href: "/dostep-stron" },
                    { label: isNew ? "Nowa strona" : form.page_key },
                ]}
            />

            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">
                        {isNew ? "Nowa strona" : `Edycja strony: ${form.page_key}`}
                    </h1>
                    <p className="mt-1 text-muted-foreground">
                        Konfiguracja powiązań page_key ↔ permissions.
                    </p>
                </div>

                <div className="flex gap-2">
                    {!isNew && form.id && (
                        <Button
                            variant="outline"
                            className="gap-2"
                            disabled={deleteMutation.isPending}
                            onClick={() => {
                                if (window.confirm("Na pewno chcesz usunąć konfigurację tej strony?")) {
                                    deleteMutation.mutate(form.id!);
                                }
                            }}
                        >
                            <Trash2 className="h-4 w-4" />
                            Usuń
                        </Button>
                    )}

                    <Button
                        className="gap-2"
                        disabled={saveMutation.isPending}
                        onClick={() => saveMutation.mutate(form)}
                    >
                        <Save className="h-4 w-4" />
                        Zapisz
                    </Button>
                </div>
            </div>

            <Card className="p-6 space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <Label>Page key</Label>
                        <Input
                            className="mt-1 font-mono"
                            placeholder="np. config.contracts"
                            value={form.page_key}
                            onChange={(e) => handleChange("page_key", e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-3 mt-6 md:mt-0">
                        <Switch
                            checked={form.is_active === 1}
                            onCheckedChange={(checked) =>
                                handleChange("is_active", checked ? 1 : 0)
                            }
                        />
                        <span className="text-sm">
                            {form.is_active ? "Strona aktywna" : "Strona wyłączona"}
                        </span>
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-3">
                    {/* VIEW */}
                    <div>
                        <Label>Permission view</Label>
                        <Select
                            value={form.permission_view ?? "none"}
                            onValueChange={(val) =>
                                handleChange("permission_view", val === "none" ? null : val)
                            }
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Wybierz permission" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">(brak)</SelectItem>
                                {sortedPermissions.map((p: any) => (
                                    <SelectItem key={p.id} value={p.name}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* READ */}
                    <div>
                        <Label>Permission read</Label>
                        <Select
                            value={form.permission_read ?? "none"}
                            onValueChange={(val) =>
                                handleChange("permission_read", val === "none" ? null : val)
                            }
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Wybierz permission" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">(brak)</SelectItem>
                                {sortedPermissions.map((p: any) => (
                                    <SelectItem key={p.id} value={p.name}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    {/* EDIT */}
                    <div>
                        <Label>Permission edit</Label>
                        <Select
                            value={form.permission_edit ?? "none"}
                            onValueChange={(val) =>
                                handleChange("permission_edit", val === "none" ? null : val)
                            }
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Wybierz permission" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">(brak)</SelectItem>
                                {sortedPermissions.map((p: any) => (
                                    <SelectItem key={p.id} value={p.name}>
                                        {p.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {permsError && (
                    <p className="text-sm text-red-500">Błąd pobierania listy permissions.</p>
                )}

                {permsLoading && (
                    <p className="text-sm text-muted-foreground">Ładowanie permissions...</p>
                )}
            </Card>
        </Layout>
    );
};

export default PageAccessConfig;
