import { useEffect, useState } from "react";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Edit } from "lucide-react";
import { Link } from "react-router-dom";

import { getDepartments, Department } from "@/api/departments";

const DepartmentsList = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    getDepartments().then(setDepartments).catch(console.error);
  }, []);

  const filtered = departments.filter((d) => {
    const s = search.toLowerCase();
    return (
        d.name.toLowerCase().includes(s) ||
        d.short_name.toLowerCase().includes(s) ||
        (d.description || "").toLowerCase().includes(s)
    );
  });

  return (
      <Layout pageKey="config.departments_list">
        <Breadcrumb
            items={[
              { label: "Konfiguracja systemu" },
              { label: "Oddziały systemowe" },
            ]}
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold text-foreground">Oddziały systemowe</h1>
          <p className="mt-1 text-muted-foreground">
            Globalne zarządzanie oddziałami szpitalnymi
          </p>
        </div>

        {/* Main Card */}
        <Card>
          <div className="border-b p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-foreground">Lista oddziałów</h2>

              <Link to="/oddzialy/nowy">
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Dodaj oddział
                </Button>
              </Link>
            </div>
          </div>

          <div className="p-4">
            {/* Search */}
            <div className="mb-4 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder="Szukaj oddziałów..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            {/* List */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                <tr className="border-b">
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Nazwa</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Skrót</th>
                  <th className="pb-3 text-left text-sm font-semibold text-foreground">Opis</th>
                  <th className="pb-3 text-right text-sm font-semibold text-foreground">Akcje</th>
                </tr>
                </thead>
                <tbody>
                {filtered.map((dept) => (
                    <tr key={dept.id} className="border-b last:border-0">
                      <td className="py-4 text-sm font-medium text-foreground">
                        {dept.name}
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {dept.short_name}
                      </td>
                      <td className="py-4 text-sm text-muted-foreground">
                        {dept.description || ""}
                      </td>
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

                {filtered.length === 0 && (
                    <tr>
                      <td
                          className="py-6 text-center text-muted-foreground"
                          colSpan={4}
                      >
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

export default DepartmentsList;
