import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Search, Plus, Edit } from "lucide-react";
import { Link } from "react-router-dom";

const PermissionsList = () => {
  const permissions = [
    { id: 1, name: "contracts.view", description: "Przeglądanie kontraktów", roles_count: 3 },
    { id: 2, name: "contracts.create", description: "Tworzenie kontraktów", roles_count: 2 },
    { id: 3, name: "contracts.edit", description: "Edycja kontraktów", roles_count: 2 },
    { id: 4, name: "contracts.delete", description: "Usuwanie kontraktów", roles_count: 1 },
    { id: 5, name: "kitchens.view", description: "Przeglądanie kuchni", roles_count: 3 },
    { id: 6, name: "kitchens.edit", description: "Edycja kuchni", roles_count: 2 },
    { id: 7, name: "users.manage", description: "Zarządzanie użytkownikami", roles_count: 1 },
  ];

  return (
    <Layout>
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Uprawnienia" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Uprawnienia systemowe</h1>
        <p className="mt-1 text-muted-foreground">Zarządzanie uprawnieniami (permissions)</p>
      </div>

      {/* Statistics */}
      <div className="mb-6 grid gap-4 md:grid-cols-3">
        <StatCard
          icon={<Shield className="h-4 w-4" />}
          label="Wszystkie uprawnienia"
          value={7}
          subtext="W systemie"
        />
        <StatCard
          icon={<Shield className="h-4 w-4" />}
          label="Role"
          value={4}
          subtext="Używających uprawnień"
        />
        <StatCard
          icon={<Shield className="h-4 w-4" />}
          label="Przypisania"
          value={14}
          subtext="Role × Uprawnienia"
        />
      </div>

      {/* Main Card */}
      <Card>
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-foreground">Lista uprawnień</h2>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj uprawnienie
            </Button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-4 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Szukaj uprawnień..." className="pl-10" />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Nazwa</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Opis</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Role</th>
                  <th className="pb-3 text-right text-sm font-semibold text-foreground">Akcje</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((perm) => (
                  <tr key={perm.id} className="border-b last:border-0">
                    <td className="py-4 text-sm font-medium text-foreground">{perm.name}</td>
                    <td className="py-4 text-sm text-muted-foreground">{perm.description}</td>
                    <td className="py-4 text-sm text-muted-foreground">{perm.roles_count}</td>
                    <td className="py-4 text-right">
                      <Link to={`/uprawnienia/${perm.id}`}>
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

export default PermissionsList;
