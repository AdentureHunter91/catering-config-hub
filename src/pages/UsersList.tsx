import { useQuery } from "@tanstack/react-query";
import { getUsers } from "@/api/users";
import { getRoles } from "@/api/roles";

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
  const {
    data: users = [],
    isLoading: loadingUsers,
    error: usersError,
  } = useQuery({
    queryKey: ["users"],
    queryFn: getUsers,
  });

  const {
    data: roles = [],
    isLoading: loadingRoles,
    error: rolesError,
  } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles,
  });

  if (loadingUsers || loadingRoles) {
    return (
        <Layout pageKey="config.users">
          <div className="p-6">Ładowanie danych...</div>
        </Layout>
    );
  }

  if (usersError || rolesError) {
    return (
        <Layout pageKey="config.users">
          <div className="p-6 text-red-500">
            Błąd pobierania danych użytkowników lub ról.
          </div>
        </Layout>
    );
  }

  return (
      <Layout pageKey="config.users">
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
              value={users.filter((u) => u.isActive).length}
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
                <Input placeholder="Szukaj użytkownika..." className="pl-9 w-[250px]" />
              </div>
              <Link to="/uzytkownicy/nowy">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Dodaj użytkownika
                </Button>
              </Link>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Użytkownik</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Email</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Role</th>
                <th className="px-6 py-3 text-center text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-center text-sm font-medium">Akcje</th>
              </tr>
              </thead>
              <tbody className="divide-y">
              {users.map((user: any) => (
                  <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-6 py-4">{user.email}</td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {user.roles.map((role: string, i: number) => (
                            <Badge key={i} variant="secondary">
                              {role}
                            </Badge>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {user.isActive ? (
                          <Badge className="bg-success text-success-foreground">
                            Aktywny
                          </Badge>
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
            <h2 className="text-lg font-semibold">Role systemowe</h2>
            <Link to="/role/nowa">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Dodaj rolę
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Nazwa</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Opis</th>
                <th className="px-6 py-3 text-center text-sm font-medium">Użytkownicy</th>
                <th className="px-6 py-3 text-center text-sm font-medium">Akcje</th>
              </tr>
              </thead>
              <tbody className="divide-y">
              {roles.map((role: any) => (
                  <tr key={role.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-medium">{role.name}</td>
                    <td className="px-6 py-4">{role.description}</td>
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
