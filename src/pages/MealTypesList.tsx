import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { getMealTypes, MealType } from "@/api/mealTypes";

const MealTypesList = () => {
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getMealTypes().then(setMealTypes).catch(console.error);
  }, []);

  const filtered = mealTypes.filter((m) => {
    const s = search.toLowerCase();
    return (
        m.name.toLowerCase().includes(s) ||
        m.short_name.toLowerCase().includes(s) ||
        (m.description || "").toLowerCase().includes(s)
    );
  });

  return (
      <Layout pageKey="config.meal_types">
        <Breadcrumb
            items={[
              { label: "Konfiguracja systemu" },
              { label: "Typy posiłków" },
            ]}
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Typy posiłków</h1>
          <p className="mt-1 text-muted-foreground">Globalne zarządzanie rodzajami posiłków</p>
        </div>

        <Card>
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Lista typów posiłków</h2>

              <Link to="/posilki/nowy">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Dodaj typ
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2" />
                <Input
                    placeholder="Szukaj..."
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
                  <th className="pb-3 text-left">Kolejność</th>
                  <th className="pb-3 text-left">Nazwa</th>
                  <th className="pb-3 text-left">Skrót</th>
                  <th className="pb-3 text-left">Opis</th>
                  <th className="pb-3 text-right">Akcje</th>
                </tr>
                </thead>
                <tbody>
                {filtered.map((m) => (
                    <tr key={m.id} className="border-b last:border-0">
                      <td className="py-4">{m.sort_order}</td>
                      <td className="py-4">{m.name}</td>
                      <td className="py-4 text-muted-foreground">{m.short_name}</td>
                      <td className="py-4 text-muted-foreground">{m.description}</td>

                      <td className="py-4 text-right">
                        <Link to={`/posilki/${m.id}`}>
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
                      <td colSpan={5} className="py-6 text-center text-muted-foreground">
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

export default MealTypesList;

