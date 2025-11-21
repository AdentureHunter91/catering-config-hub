import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useState, useMemo } from "react";

import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import StatCard from "@/components/StatCard";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Shield, Search, Plus, Edit } from "lucide-react";

import { getPermissions } from "@/api/permissions";

const PermissionsList = () => {
  const {
    data: permissions = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
  });

  const [search, setSearch] = useState("");

  // Dynamic filtering
  const filtered = useMemo(() => {
    const s = search.toLowerCase();

    return permissions.filter((p: any) =>
        p.name.toLowerCase().includes(s) ||
        (p.description || "").toLowerCase().includes(s)
    );
  }, [permissions, search]);

  // Stats
  const totalPermissions = permissions.length;
  const totalAssignments = permissions.reduce(
      (sum: number, p: any) => sum + p.roles_count,
      0
  );

  // Liczba unikalnych ról używających jakiegokolwiek permission
  const totalRoles = new Set(
      permissions.flatMap((p: any) => (p.roles_count > 0 ? ["x"] : []))
  ).size;

  if (isLoading) {
    return (
        <Layout pageKey="config.permissions">
          <Breadcrumb items={[{ label: "Konfiguracja systemu" }, { label: "Uprawnienia" }]} />
          <div className="p-6">Ładowanie...</div>
        </Layout>
    );
  }

  if (error) {
    return (
        <Layout pageKey="config.permissions">
          <Breadcrumb items={[{ label: "Konfiguracja systemu" }, { label: "Uprawnienia" }]} />
          <div className="p-6 text-red-500">Błąd pobierania uprawnień.</div>
        </Layout>
    );
  }

  return (
      <Layout pageKey="config.permissions">
        <Breadcrumb
            items={[{ label: "Konfiguracja systemu" }, { label: "Uprawnienia" }]}
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold">Uprawnienia systemowe</h1>
          <p className="mt-1 text-muted-foreground">
            Zarządzanie uprawnieniami (permissions)
          </p>
        </div>

        {/* Statystyki */}
        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <StatCard
              icon={<Shield className="h-4 w-4" />}
              label="Wszystkie uprawnienia"
              value={totalPermissions}
              subtext="W systemie"
          />

          <StatCard
              icon={<Shield className="h-4 w-4" />}
              label="Role z uprawnieniami"
              value={totalRoles}
              subtext="Korzystające z permissions"
          />

          <StatCard
              icon={<Shield className="h-4 w-4" />}
              label="Przypisania"
              value={totalAssignments}
              subtext="Role × Uprawnienia"
          />
        </div>

        {/* Lista uprawnień */}
        <Card>
          <div className="border-b p-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Lista uprawnień</h2>

            <Link to="/uprawnienia/nowe">
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Dodaj uprawnienie
              </Button>
            </Link>
          </div>

          <div className="p-4">

            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Szukaj uprawnień..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-semibold">Nazwa</th>
                  <th className="pb-3 text-left text-sm font-semibold">Opis</th>
                  <th className="pb-3 text-left text-sm font-semibold">Role</th>
                  <th className="pb-3 text-right text-sm font-semibold">Akcje</th>
                </tr>
                </thead>

                <tbody>
                {filtered.map((perm: any) => (
                    <tr key={perm.id} className="border-b last:border-0">
                      <td className="py-4 font-medium">{perm.name}</td>
                      <td className="py-4 text-muted-foreground">
                        {perm.description}
                      </td>
                      <td className="py-4">{perm.roles_count}</td>
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

                {filtered.length === 0 && (
                    <tr>
                      <td className="py-4 text-center text-muted-foreground" colSpan={4}>
                        Brak wyników
                      </td>
                    </tr>
                )}
                </tbody>
              </table>
            </div>
          </div>
        </Card>
      </Layout>
  );
};

export default PermissionsList;
