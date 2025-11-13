import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChefHat, Users, TrendingUp, CheckCircle, Plus, Search, Settings } from "lucide-react";
import { Link } from "react-router-dom";

const KitchensList = () => {
  const kitchens = [
    {
      id: 1,
      name: "Kuchnia Centralna A",
      city: "Warszawa",
      activeContracts: 5,
      employees: 12,
      avgDailyMeals: 115,
      quality: "98%",
    },
    {
      id: 2,
      name: "Kuchnia Regionalna B",
      city: "Kraków",
      activeContracts: 3,
      employees: 8,
      avgDailyMeals: 85,
      quality: "96%",
    },
    {
      id: 3,
      name: "Kuchnia Lokalna C",
      city: "Wrocław",
      activeContracts: 2,
      employees: 6,
      avgDailyMeals: 60,
      quality: "95%",
    },
  ];

  return (
    <Layout>
      <Breadcrumb
        items={[{ label: "Konfiguracja systemu" }, { label: "Kuchnie" }]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Kuchnie</h1>
        <p className="mt-1 text-muted-foreground">
          Zarządzanie kuchniami i ich konfiguracją
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-6 md:grid-cols-4">
        <StatCard
          icon={<ChefHat className="h-4 w-4" />}
          label="Wszystkie kuchnie"
          value={kitchens.length}
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Łączna liczba pracowników"
          value={kitchens.reduce((sum, k) => sum + k.employees, 0)}
        />
        <StatCard
          icon={<TrendingUp className="h-4 w-4" />}
          label="Łączna produkcja/dzień"
          value={kitchens.reduce((sum, k) => sum + k.avgDailyMeals, 0)}
        />
        <StatCard
          icon={<CheckCircle className="h-4 w-4" />}
          label="Śr. jakość (5S)"
          value="96%"
        />
      </div>

      {/* Kitchens List */}
      <Card>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Lista kuchni</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Szukaj kuchni..."
                className="pl-9 w-[250px]"
              />
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj kuchnię
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Nazwa kuchni
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Miasto
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Aktywne kontrakty
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Pracownicy
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Śr. posiłki/dzień
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Jakość (5S)
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {kitchens.map((kitchen) => (
                <tr
                  key={kitchen.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {kitchen.name}
                  </td>
                  <td className="px-6 py-4 text-foreground">{kitchen.city}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="secondary">{kitchen.activeContracts}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center text-foreground">
                    {kitchen.employees}
                  </td>
                  <td className="px-6 py-4 text-center text-foreground">
                    {kitchen.avgDailyMeals}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Badge className="bg-success text-success-foreground">
                      {kitchen.quality}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link to={`/kuchnie/${kitchen.id}`}>
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
