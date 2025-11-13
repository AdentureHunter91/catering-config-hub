import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Shield, Plus, Search, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import StatCard from "@/components/StatCard";

const UsersList = () => {
  const users = [
    {
      id: 1,
      email: "anna.nowak@example.com",
      firstName: "Anna",
      lastName: "Nowak",
      roles: ["Admin", "Koordynator"],
      isActive: true,
    },
    {
      id: 2,
      email: "jan.kowalski@example.com",
      firstName: "Jan",
      lastName: "Kowalski",
      roles: ["Koordynator"],
      isActive: true,
    },
    {
      id: 3,
      email: "maria.wisniewska@example.com",
      firstName: "Maria",
      lastName: "Wiśniewska",
      roles: ["User"],
      isActive: false,
    },
  ];

  const roles = [
    { id: 1, name: "Admin", description: "Pełny dostęp do systemu", userCount: 1 },
    { id: 2, name: "Koordynator", description: "Zarządzanie kontraktami i kuchniami", userCount: 2 },
    { id: 3, name: "User", description: "Podstawowy dostęp", userCount: 5 },
  ];

  return (
    <Layout>
      <Breadcrumb
        items={[{ label: "Konfiguracja systemu" }, { label: "Użytkownicy i role" }]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Użytkownicy i role</h1>
        <p className="mt-1 text-muted-foreground">
          Zarządzanie użytkownikami, rolami i uprawnieniami
        </p>
      </div>

      {/* Quick Stats */}
      <div className="mb-6 grid gap-6 md:grid-cols-3">
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Wszyscy użytkownicy"
          value={users.length}
        />
        <StatCard
          icon={<Users className="h-4 w-4" />}
          label="Aktywni użytkownicy"
          value={users.filter(u => u.isActive).length}
        />
        <StatCard
          icon={<Shield className="h-4 w-4" />}
          label="Role systemowe"
          value={roles.length}
        />
      </div>

      {/* Users List */}
      <Card className="mb-6">
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Lista użytkowników</h2>
          <div className="flex gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Szukaj użytkownika..."
                className="pl-9 w-[250px]"
              />
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj użytkownika
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Użytkownik
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Role
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Status
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {user.firstName} {user.lastName}
                  </td>
                  <td className="px-6 py-4 text-foreground">{user.email}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-2">
                      {user.roles.map((role, i) => (
                        <Badge key={i} variant="secondary">
                          {role}
                        </Badge>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {user.isActive ? (
                      <Badge className="bg-success text-success-foreground">Aktywny</Badge>
                    ) : (
                      <Badge variant="secondary">Nieaktywny</Badge>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link to={`/uzytkownicy/${user.id}`}>
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

      {/* Roles List */}
      <Card>
        <div className="border-b p-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Role systemowe</h2>
          <div className="flex gap-2">
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Dodaj rolę
            </Button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Nazwa roli
                </th>
                <th className="px-6 py-3 text-left text-sm font-medium text-foreground">
                  Opis
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Liczba użytkowników
                </th>
                <th className="px-6 py-3 text-center text-sm font-medium text-foreground">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {roles.map((role) => (
                <tr
                  key={role.id}
                  className="hover:bg-muted/30 transition-colors"
                >
                  <td className="px-6 py-4 font-medium text-foreground">
                    {role.name}
                  </td>
                  <td className="px-6 py-4 text-foreground">{role.description}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge variant="secondary">{role.userCount}</Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link to={`/role/${role.id}`}>
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

export default UsersList;
