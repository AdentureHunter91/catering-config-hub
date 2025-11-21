import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

import {
  ChefHat,
  Users,
  TrendingUp,
  Plus,
  Search,
  Settings,
} from "lucide-react";

import {
  getKitchensExtended,
  KitchenExtended,
} from "@/api/kitchensExtended";

const KitchensList = () => {
  const [kitchens, setKitchens] = useState<KitchenExtended[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getKitchensExtended().then(setKitchens);
  }, []);

  const filteredKitchens = kitchens.filter((k) =>
      (k.name + " " + k.city).toLowerCase().includes(search.toLowerCase())
  );

  return (
      <Layout pageKey="config.kitchens_list">
        <Breadcrumb
            items={[
              { label: "Konfiguracja systemu" },
              { label: "Kuchnie" },
            ]}
        />

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Kuchnie</h1>
          <p className="mt-1 text-muted-foreground">
            Zarządzanie kuchniami i ich konfiguracją
          </p>
        </div>

        {/* Quick stats */}
        <div className="mb-6 grid gap-6 md:grid-cols-4">
          <StatCard
              icon={<ChefHat className="h-4 w-4" />}
              label="Wszystkie kuchnie"
              value={filteredKitchens.length}
          />

          <StatCard
              icon={<Users className="h-4 w-4" />}
              label="Łączna liczba pracowników"
              value={filteredKitchens.reduce(
                  (sum, k) => sum + (k.employees ?? 0),
                  0
              )}
          />

          <StatCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Aktywne kontrakty (łącznie)"
              value={filteredKitchens.reduce(
                  (sum, k) => sum + (k.active_contracts ?? 0),
                  0
              )}
          />

          <StatCard
              icon={<TrendingUp className="h-4 w-4" />}
              label="Planowane kontrakty (łącznie)"
              value={filteredKitchens.reduce(
                  (sum, k) => sum + (k.planned_contracts ?? 0),
                  0
              )}
          />
        </div>

        {/* Table */}
        <Card>
          <div className="border-b p-4">
            {/* Wiersz 1 — tytuł + search + przycisk */}
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">
                Lista kuchni
              </h2>

              <div className="flex items-center gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                      placeholder="Szukaj kuchni..."
                      className="pl-9 w-[250px]"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                {/* Add button */}
                <Link to="/kuchnie/nowa">
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Dodaj kuchnię
                  </Button>
                </Link>
              </div>
            </div>

            {/* Wiersz 2 — legenda */}
            <div className="flex items-center gap-6 mt-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Badge className="bg-green-600 text-white px-2 py-0.5" />
                Aktywny
              </div>

              <div className="flex items-center gap-1">
                <Badge className="bg-blue-600 text-white px-2 py-0.5" />
                Planowany
              </div>

              <div className="flex items-center gap-1">
                <Badge className="bg-gray-500 text-white px-2 py-0.5" />
                Wygasły
              </div>
            </div>
          </div>


          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm">Nazwa kuchni</th>
                <th className="px-6 py-3 text-left text-sm">Miasto</th>
                <th className="px-6 py-3 text-center text-sm">Kontrakty</th>
                <th className="px-6 py-3 text-center text-sm">Szac. osobodni</th>
                <th className="px-6 py-3 text-center text-sm">Pracownicy</th>
                <th className="px-6 py-3 text-center text-sm">Akcje</th>
              </tr>
              </thead>

              <tbody className="divide-y">
              {filteredKitchens.map((k) => (
                  <tr key={k.id} className="hover:bg-muted/30">
                    <td className="px-6 py-4 font-medium">{k.name}</td>

                    <td className="px-6 py-4">{k.city}</td>

                    {/* Kontrakty badge */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        <Badge className="bg-green-600 text-white">
                          {k.active_contracts}
                        </Badge>
                        <Badge className="bg-blue-600 text-white">
                          {k.planned_contracts}
                        </Badge>
                        <Badge className="bg-gray-500 text-white">
                          {k.expired_contracts}
                        </Badge>
                      </div>
                    </td>

                    {/* Osobodni (na razie pusty placeholder) */}
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center gap-2">
                        {/* Aktywne */}
                        <Badge className="bg-green-600 text-white">
                          {k.active_beds ?? 0}
                        </Badge>

                        {/* Planowane */}
                        <Badge className="bg-blue-600 text-white">
                          {k.planned_beds ?? 0}
                        </Badge>
                      </div>
                    </td>

                    {/* Pracownicy */}
                    <td className="px-6 py-4 text-center">
                      {k.employees ?? "—"}
                    </td>

                    {/* Akcje */}
                    <td className="px-6 py-4 text-center">
                      <Link to={`/kuchnie/${k.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Settings className="h-4 w-4" />
                          Zarządzaj
                        </Button>
                      </Link>
                    </td>
                  </tr>
              ))}
              </tbody>
            </table>
          </div>
        </Card>
      </Layout>
  );
};

export default KitchensList;
