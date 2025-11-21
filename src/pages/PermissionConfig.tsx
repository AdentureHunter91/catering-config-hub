import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { Save, Trash2 } from "lucide-react";

import {
    getPermission,
    createPermission,
    updatePermission,
    deletePermission,
} from "@/api/permissions";

const PermissionConfig = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const isNew = id === "nowe";

    // Load permission if editing
    const {
        data: permData,
        isLoading,
        error,
    } = useQuery({
        queryKey: ["permission", id],
        queryFn: () => getPermission(Number(id)),
        enabled: !isNew,
    });

    // Form state
    const [form, setForm] = useState({
        name: "",
        description: "",
    });

    // Populate form when editing
    useEffect(() => {
        if (!isNew && permData) {
            setForm({
                name: permData.name,
                description: permData.description ?? "",
            });
        }
    }, [isNew, permData]);

    // Error load fallback
    if (error) {
        return (
            <Layout pageKey="config.permissions">
                <div className="p-6 text-red-500">Nie znaleziono uprawnienia.</div>
            </Layout>
        );
    }

    if (isLoading) {
        return (
            <Layout pageKey="config.permissions">
                <div className="p-6">Ładowanie...</div>
            </Layout>
        );
    }

    const saveHandler = async () => {
        if (isNew) {
            await createPermission({
                name: form.name,
                description: form.description,
            });
            navigate("/uprawnienia");
            return;
        }

        await updatePermission({
            id: Number(id),
            name: form.name,
            description: form.description,
        });

        navigate("/uprawnienia");
    };

    const deleteHandler = async () => {
        if (!confirm("Czy na pewno chcesz usunąć to uprawnienie?")) return;

        await deletePermission(Number(id));
        navigate("/uprawnienia");
    };

    return (
        <Layout pageKey="config.permissions">
            <Breadcrumb
                items={[
                    { label: "Konfiguracja systemu" },
                    { label: "Uprawnienia", href: "/uprawnienia" },
                    {
                        label: isNew ? "Nowe uprawnienie" : `Uprawnienie: ${form.name}`,
                    },
                ]}
            />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">
                    {isNew ? "Nowe uprawnienie" : "Konfiguracja uprawnienia"}
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Zarządzanie uprawnieniem systemowym
                </p>
            </div>

            <Card>
                <div className="border-b p-4">
                    <h2 className="text-lg font-semibold text-foreground">Dane uprawnienia</h2>
                </div>

                <div className="p-6">
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nazwa uprawnienia</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        name: e.target.value,
                                    })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Opis</Label>
                            <Textarea
                                id="description"
                                rows={3}
                                value={form.description}
                                onChange={(e) =>
                                    setForm({
                                        ...form,
                                        description: e.target.value,
                                    })
                                }
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                        <Button className="gap-2" onClick={saveHandler}>
                            <Save className="h-4 w-4" />
                            Zapisz
                        </Button>

                        {!isNew && (
                            <Button
                                variant="outline"
                                className="gap-2 text-destructive hover:text-destructive"
                                onClick={deleteHandler}
                            >
                                <Trash2 className="h-4 w-4" />
                                Usuń
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </Layout>
    );
};

export default PermissionConfig;
