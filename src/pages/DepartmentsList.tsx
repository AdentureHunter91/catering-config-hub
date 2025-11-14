import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Building2, Search, Plus, Edit } from "lucide-react";
import { Link } from "react-router-dom";

const DepartmentsList = () => {
  const departments = [
    { id: 1, name: "Oddział Internistyczny", short_name: "Interna", description: "Oddział chorób wewnętrznych", clients_count: 5 },
    { id: 2, name: "Oddział Chirurgiczny", short_name: "Chirurgia", description: "Oddział zabiegowy", clients_count: 4 },
    { id: 3, name: "Oddział Kardiologiczny", short_name: "Kardiologia", description: "Choroby serca", clients_count: 3 },
  ];

  return (
    <Layout>
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Oddziały systemowe" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Oddziały systemowe</h1>
        <p className="mt-1 text-muted-foreground">Globalne zarządzanie oddziałami szpitalnymi</p>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Wszystkie oddziały"
          value={3}
          subtext="W systemie"
        />
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Używane"
          value={3}
          subtext="Przypisane do klientów"
        />
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          label="Klienci"
          value={12}
          subtext="Całkowita liczba przypisań"
        />
      </div>

      {/* Main Card */}
      <Card>
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Lista oddziałów</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj oddział
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Szukaj oddziałów..." className="pl-10" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Nazwa</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Nazwa skrócona</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Opis</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Klienci</th>
                  <th className="pb-3 text-right text-sm font-semibold text-foreground">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {departments.map((dept) => (
                  <tr key={dept.id} className="border-b last:border-0">
                    <td className="py-4 text-sm font-medium text-foreground">{dept.name}</td>
                    <td className="py-4 text-sm text-muted-foreground">{dept.short_name}</td>
                    <td className="py-4 text-sm text-muted-foreground">{dept.description}</td>
                    <td className="py-4 text-sm text-muted-foreground">{dept.clients_count}</td>
                    <td className="py-4 text-right">
                      <Link to={`/oddzialy/${dept.id}`}>
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

export default DepartmentsList;
