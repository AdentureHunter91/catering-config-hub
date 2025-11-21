import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";

import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Trash2 } from "lucide-react";

import {
    getDepartment,
    saveDepartment,
    Department,
} from "@/api/departments";

const DepartmentConfig = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const isNew = id === "nowy";

    const [form, setForm] = useState<Department>({
        id: 0,
        name: "",
        short_name: "",
        description: "",
    });

    useEffect(() => {
        if (isNew) return;

        getDepartment(Number(id))
            .then((d) => setForm(d))
            .catch((e) => console.error(e));
    }, [id]);

    const handleChange = (field: keyof Department, value: string) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSave = async () => {
        await saveDepartment(form);
        navigate("/oddzialy");
    };

    return (
        <Layout pageKey="config.departments">
            <Breadcrumb
                items={[
                    { label: "Konfiguracja systemu" },
                    { label: "Oddziały", href: "/oddzialy" },
                    { label: isNew ? "Nowy oddział" : form.name || "Oddział" },
                ]}
            />

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-foreground">
                    {isNew ? "Dodaj nowy oddział" : "Konfiguracja oddziału"}
                </h1>
                <p className="mt-1 text-muted-foreground">
                    Dane globalnego oddziału systemowego
                </p>
            </div>

            <Card>
                <div className="border-b p-4">
                    <h2 className="text-lg font-semibold text-foreground">Dane oddziału</h2>
                </div>

                <div className="p-6">
                    <div className="grid gap-6">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nazwa</Label>
                            <Input
                                id="name"
                                value={form.name}
                                onChange={(e) => handleChange("name", e.target.value)}
                                placeholder="np. Oddział Internistyczny"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="short-name">Nazwa skrócona</Label>
                            <Input
                                id="short-name"
                                value={form.short_name}
                                onChange={(e) => handleChange("short_name", e.target.value)}
                                placeholder="np. Interna"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Opis</Label>
                            <Textarea
                                id="description"
                                rows={3}
                                value={form.description || ""}
                                onChange={(e) => handleChange("description", e.target.value)}
                                placeholder="Opis oddziału..."
                            />
                        </div>
                    </div>

                    <div className="mt-6 flex gap-2">
                        <Button className="gap-2" onClick={handleSave}>
                            <Save className="h-4 w-4" />
                            Zapisz zmiany
                        </Button>

                        {!isNew && (
                            <Button
                                variant="outline"
                                className="gap-2 text-destructive hover:text-destructive"
                                onClick={() => alert("TODO: usuwanie oddziału")}
                            >
                                <Trash2 className="h-4 w-4" />
                                Usuń oddział
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </Layout>
    );
};

export default DepartmentConfig;
