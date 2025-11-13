import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Save, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

const UserConfig = () => {
  const availableRoles = [
    { id: 1, name: "Admin", description: "Pełny dostęp do systemu" },
    { id: 2, name: "Koordynator", description: "Zarządzanie kontraktami i kuchniami" },
    { id: 3, name: "User", description: "Podstawowy dostęp" },
    { id: 4, name: "Moderator", description: "Moderacja treści" },
  ];

  const userRoles = [1, 2]; // IDs of roles assigned to this user

  return (
    <Layout>
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Użytkownicy", href: "/uzytkownicy" },
          { label: "Anna Nowak" },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Konfiguracja użytkownika</h1>
          <p className="mt-1 text-muted-foreground">Zarządzanie danymi i uprawnieniami</p>
        </div>
        <Badge className="bg-success text-success-foreground text-base px-4 py-2">
          Status: Aktywny
        </Badge>
      </div>

      {/* Section A: User Data */}
      <Card className="mb-6">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Dane użytkownika</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" defaultValue="anna.nowak@example.com" />
            </div>
            <div className="space-y-2 flex items-center gap-3 pt-8">
              <Switch id="is-active" defaultChecked />
              <Label htmlFor="is-active" className="cursor-pointer">
                Konto aktywne
              </Label>
            </div>
            <div className="space-y-2">
              <Label htmlFor="first-name">Imię</Label>
              <Input id="first-name" defaultValue="Anna" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Nazwisko</Label>
              <Input id="last-name" defaultValue="Nowak" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Nowe hasło (opcjonalne)</Label>
              <Input id="password" type="password" placeholder="Zostaw puste, aby nie zmieniać" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password-confirm">Potwierdź hasło</Label>
              <Input id="password-confirm" type="password" />
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Zapisz zmiany
            </Button>
            <Button variant="outline" className="gap-2 text-danger hover:text-danger">
              <Trash2 className="h-4 w-4" />
              Usuń użytkownika
            </Button>
          </div>
        </div>
      </Card>

      {/* Section B: User Roles */}
      <Card>
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Przypisane role</h2>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {availableRoles.map((role) => (
              <div
                key={role.id}
                className="flex items-start gap-3 rounded-lg border p-4 hover:bg-muted/30 transition-colors"
              >
                <Checkbox
                  id={`role-${role.id}`}
                  defaultChecked={userRoles.includes(role.id)}
                />
                <div className="flex-1">
                  <Label htmlFor={`role-${role.id}`} className="cursor-pointer font-medium">
                    {role.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{role.description}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Zapisz role
            </Button>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default UserConfig;
