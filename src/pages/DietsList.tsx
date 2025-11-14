import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Apple, Search, Plus, Edit } from "lucide-react";
import { Link } from "react-router-dom";

const DietsList = () => {
  const diets = [
    { id: 1, name: "Dieta podstawowa", short_name: "PODST", description: "Standardowa dieta", clients_count: 8 },
    { id: 2, name: "Dieta cukrzycowa", short_name: "CUKR", description: "Dla pacjentów z cukrzycą", clients_count: 6 },
    { id: 3, name: "Dieta łatwo strawna", short_name: "ŁS", description: "Łagodna dla układu trawiennego", clients_count: 5 },
    { id: 4, name: "Dieta płynna", short_name: "PŁYN", description: "Tylko pokarmy płynne", clients_count: 3 },
  ];

  return (
    <Layout>
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Diety systemowe" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Diety systemowe</h1>
        <p className="mt-1 text-muted-foreground">Globalne zarządzanie dietami</p>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Apple className="h-4 w-4" />}
          label="Wszystkie diety"
          value={4}
          subtext="W systemie"
        />
        <StatCard
          icon={<Apple className="h-4 w-4" />}
          label="Aktywne"
          value={4}
          subtext="Używane przez klientów"
        />
        <StatCard
          icon={<Apple className="h-4 w-4" />}
          label="Przypisania"
          value={22}
          subtext="Całkowita liczba"
        />
      </div>

      {/* Main Card */}
      <Card>
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Lista diet</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj dietę
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Szukaj diet..." className="pl-10" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Nazwa</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Skrót</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Opis</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Klienci</th>
                  <th className="pb-3 text-right text-sm font-semibold text-foreground">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {diets.map((diet) => (
                  <tr key={diet.id} className="border-b last:border-0">
                    <td className="py-4 text-sm font-medium text-foreground">{diet.name}</td>
                    <td className="py-4 text-sm text-muted-foreground">{diet.short_name}</td>
                    <td className="py-4 text-sm text-muted-foreground">{diet.description}</td>
                    <td className="py-4 text-sm text-muted-foreground">{diet.clients_count}</td>
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
              </tbody>
            </table>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default DietsList;
