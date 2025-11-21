import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Trash2 } from "lucide-react";

import { getMealType, saveMealType, deleteMealType, MealType } from "@/api/mealTypes";

const MealTypeConfig = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNew = id === "nowy";

  const [form, setForm] = useState<MealType>({
    id: 0,
    name: "",
    short_name: "",
    sort_order: 1,
    description: "",
  });

  useEffect(() => {
    if (isNew) return;
    getMealType(Number(id)).then(setForm).catch(console.error);
  }, [id]);

  const handleChange = (field: keyof MealType, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    await saveMealType(form);
    navigate("/posilki");
  };

  const handleDelete = async () => {
    if (!confirm("Czy na pewno usunąć ten typ posiłku?")) return;
    await deleteMealType(form.id);
    navigate("/posilki");
  };

  return (
      <Layout pageKey="config.meal_types">
        <Breadcrumb
            items={[
              { label: "Konfiguracja systemu" },
              { label: "Typy posiłków", href: "/posilki" },
              { label: isNew ? "Nowy typ posiłku" : form.name },
            ]}
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Konfiguracja typu posiłku</h1>
          <p className="mt-1 text-muted-foreground">
            Dane globalnego typu posiłku
          </p>
        </div>

        <Card>
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Dane typu posiłku</h2>
          </div>

          <div className="p-6">
            <div className="grid gap-6">
              <div className="space-y-2">
                <Label>Nazwa</Label>
                <Input
                    value={form.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Skrót</Label>
                <Input
                    value={form.short_name}
                    onChange={(e) => handleChange("short_name", e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Kolejność sortowania</Label>
                <Input
                    type="number"
                    value={form.sort_order}
                    onChange={(e) => handleChange("sort_order", Number(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label>Opis</Label>
                <Textarea
                    rows={3}
                    value={form.description || ""}
                    onChange={(e) => handleChange("description", e.target.value)}
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
                      className="gap-2 text-destructive"
                      onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4" />
                    Usuń typ
                  </Button>
              )}
            </div>
          </div>
        </Card>
      </Layout>
  );
};

export default MealTypeConfig;
