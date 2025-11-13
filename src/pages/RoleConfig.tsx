import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const RoleConfig = () => {
  const availablePermissions = [
    { id: 1, name: "contracts.view", description: "Przeglądanie kontraktów", category: "Kontrakty" },
    { id: 2, name: "contracts.create", description: "Tworzenie kontraktów", category: "Kontrakty" },
    { id: 3, name: "contracts.edit", description: "Edycja kontraktów", category: "Kontrakty" },
    { id: 4, name: "contracts.delete", description: "Usuwanie kontraktów", category: "Kontrakty" },
    { id: 5, name: "kitchens.view", description: "Przeglądanie kuchni", category: "Kuchnie" },
    { id: 6, name: "kitchens.create", description: "Tworzenie kuchni", category: "Kuchnie" },
    { id: 7, name: "kitchens.edit", description: "Edycja kuchni", category: "Kuchnie" },
    { id: 8, name: "kitchens.delete", description: "Usuwanie kuchni", category: "Kuchnie" },
    { id: 9, name: "users.view", description: "Przeglądanie użytkowników", category: "Użytkownicy" },
    { id: 10, name: "users.create", description: "Tworzenie użytkowników", category: "Użytkownicy" },
    { id: 11, name: "users.edit", description: "Edycja użytkowników", category: "Użytkownicy" },
    { id: 12, name: "users.delete", description: "Usuwanie użytkowników", category: "Użytkownicy" },
  ];

  const rolePermissions = [1, 2, 3, 5, 6, 7]; // IDs of permissions assigned to this role

  // Group permissions by category
  const groupedPermissions = availablePermissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = [];
    }
    acc[perm.category].push(perm);
    return acc;
  }, {} as Record<string, typeof availablePermissions>);

  return (
    <Layout>
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Użytkownicy", href: "/uzytkownicy" },
          { label: "Rola: Koordynator" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Konfiguracja roli</h1>
        <p className="mt-1 text-muted-foreground">Zarządzanie nazwą, opisem i uprawnieniami</p>
      </div>

      {/* Section A: Role Data */}
      <Card className="mb-6">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Dane roli</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="role-name">Nazwa roli</Label>
              <Input id="role-name" defaultValue="Koordynator" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role-description">Opis</Label>
              <Textarea
                id="role-description"
                defaultValue="Zarządzanie kontraktami i kuchniami"
                rows={3}
              />
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Zapisz zmiany
            </Button>
            <Button variant="outline" className="gap-2 text-danger hover:text-danger">
              <Trash2 className="h-4 w-4" />
              Usuń rolę
            </Button>
          </div>
        </div>
      </Card>

      {/* Section B: Permissions */}
      <Card>
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Uprawnienia (permissions)</h2>
        </div>
        <div className="p-6">
          <div className="space-y-6">
            {Object.entries(groupedPermissions).map(([category, permissions]) => (
              <div key={category}>
                <h3 className="mb-3 text-sm font-semibold text-foreground">{category}</h3>
                <div className="space-y-2">
                  {permissions.map((permission) => (
                    <div
                      key={permission.id}
                      className="flex items-start gap-3 rounded-lg border p-3 hover:bg-muted/30 transition-colors"
                    >
                      <Checkbox
                        id={`perm-${permission.id}`}
                        defaultChecked={rolePermissions.includes(permission.id)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={`perm-${permission.id}`}
                          className="cursor-pointer font-medium text-sm"
                        >
                          {permission.name}
                        </Label>
                        <p className="text-xs text-muted-foreground">{permission.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Zapisz uprawnienia
            </Button>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default RoleConfig;
