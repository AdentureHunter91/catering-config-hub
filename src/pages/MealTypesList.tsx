import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Utensils, Search, Plus, Edit } from "lucide-react";
import { Link } from "react-router-dom";

const MealTypesList = () => {
  const mealTypes = [
    { id: 1, name: "Śniadanie", short_name: "SNI", sort_order: 1, description: "Pierwszy posiłek dnia" },
    { id: 2, name: "II Śniadanie", short_name: "II SNI", sort_order: 2, description: "Posiłek przedpołudniowy" },
    { id: 3, name: "Obiad", short_name: "OB", sort_order: 3, description: "Główny posiłek" },
    { id: 4, name: "Podwieczorek", short_name: "POD", sort_order: 4, description: "Posiłek popołudniowy" },
    { id: 5, name: "Kolacja", short_name: "KOL", sort_order: 5, description: "Ostatni posiłek dnia" },
  ];

  return (
    <Layout>
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Typy posiłków" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Typy posiłków</h1>
        <p className="mt-1 text-muted-foreground">Globalne zarządzanie rodzajami posiłków</p>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Utensils className="h-4 w-4" />}
          label="Wszystkie typy"
          value={5}
          subtext="W systemie"
        />
        <StatCard
          icon={<Utensils className="h-4 w-4" />}
          label="Aktywne"
          value={5}
          subtext="Używane przez klientów"
        />
        <StatCard
          icon={<Utensils className="h-4 w-4" />}
          label="Klienci"
          value={8}
          subtext="Używających systemu"
        />
      </div>

      {/* Main Card */}
      <Card>
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Lista typów posiłków</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj typ posiłku
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Szukaj typów posiłków..." className="pl-10" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Kolejność</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Nazwa</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Skrót</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Opis</th>
                  <th className="pb-3 text-right text-sm font-semibold text-foreground">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {mealTypes.map((meal) => (
                  <tr key={meal.id} className="border-b last:border-0">
                    <td className="py-4 text-sm font-medium text-foreground">{meal.sort_order}</td>
                    <td className="py-4 text-sm font-medium text-foreground">{meal.name}</td>
                    <td className="py-4 text-sm text-muted-foreground">{meal.short_name}</td>
                    <td className="py-4 text-sm text-muted-foreground">{meal.description}</td>
                    <td className="py-4 text-right">
                      <Link to={`/posilki/${meal.id}`}>
                        <Button variant="ghost" size="sm" className="gap-2">
                          <Edit className="h-4 w-4" />
                          Edytuj
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default MealTypesList;
