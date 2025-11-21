import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Edit, Plus } from "lucide-react";
import { Link } from "react-router-dom";

import { getDiets, Diet } from "@/api/diets";

const DietsList = () => {
  const [diets, setDiets] = useState<Diet[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getDiets().then(setDiets).catch(console.error);
  }, []);

  const filtered = diets.filter((d) => {
    const s = search.toLowerCase();
    return (
        d.name.toLowerCase().includes(s) ||
        d.short_name.toLowerCase().includes(s) ||
        (d.description || "").toLowerCase().includes(s)
    );
  });

  return (
      <Layout pageKey="config.diets">
        <Breadcrumb
            items={[
              { label: "Konfiguracja systemu" },
              { label: "Diety systemowe" },
            ]}
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Diety systemowe</h1>
          <p className="mt-1 text-muted-foreground">
            Globalne zarządzanie dietami
          </p>
        </div>

        <Card>
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Lista diet</h2>

              <Link to="/diety/nowa">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Dodaj dietę
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-4">
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Szukaj diet..."
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
                  <th className="pb-3 text-left text-sm font-semibold">Nazwa</th>
                  <th className="pb-3 text-left text-sm font-semibold">Skrót</th>
                  <th className="pb-3 text-left text-sm font-semibold">Opis</th>
                  <th className="pb-3 text-right text-sm font-semibold">Akcje</th>
                </tr>
                </thead>
                <tbody>
                {filtered.map((diet) => (
                    <tr key={diet.id} className="border-b last:border-0">
                      <td className="py-4 text-sm font-medium">{diet.name}</td>
                      <td className="py-4 text-sm text-muted-foreground">{diet.short_name}</td>
                      <td className="py-4 text-sm text-muted-foreground">{diet.description}</td>

                      <td className="py-4 text-right">
                        <Link to={`/diety/${diet.id}`}>
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
                      <td colSpan={4} className="py-6 text-center text-muted-foreground">
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

export default DietsList;
