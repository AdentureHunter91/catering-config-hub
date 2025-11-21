import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";

import {
  getRole,
  createRole,
  updateRole,
  deleteRole,
  setRolePermissions,
} from "@/api/roles";
import { getPermissions } from "@/api/permissions";

const RoleConfig = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNew = id === "nowa";

  // Pobierz listę permissions
  const {
    data: allPermissions = [],
    isLoading: loadingPerms,
  } = useQuery({
    queryKey: ["permissions"],
    queryFn: getPermissions,
  });

  // Pobierz dane roli (jeśli edycja)
  const {
    data: roleData,
    isLoading: loadingRole,
    error: roleError,
  } = useQuery({
    queryKey: ["role", id],
    queryFn: () => getRole(Number(id)),
    enabled: !isNew,
  });

  const [form, setForm] = useState({
    name: "",
    description: "",
    permissions: [] as number[],
  });

  // Uzupełnij dane, gdy backend zwróci rolę
  useEffect(() => {
    if (!isNew && roleData) {
      setForm({
        name: roleData.name,
        description: roleData.description ?? "",
        permissions: roleData.permissions,
      });
    }
  }, [isNew, roleData]);

  if (roleError) {
    return (
        <Layout pageKey="config.roles">
          <div className="p-6 text-red-600">Nie znaleziono roli.</div>
        </Layout>
    );
  }

  if (loadingPerms || loadingRole) {
    return (
        <Layout pageKey="config.roles">
          <div className="p-6">Ładowanie...</div>
        </Layout>
    );
  }

  const togglePermission = (pid: number) => {
    setForm((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(pid)
          ? prev.permissions.filter((p) => p !== pid)
          : [...prev.permissions, pid],
    }));
  };

  const saveHandler = async () => {
    if (isNew) {
      const created = await createRole({
        name: form.name,
        description: form.description,
      });

      const newRoleId = created?.id ?? created;

      await setRolePermissions(newRoleId, form.permissions);

      navigate("/uzytkownicy");
      return;
    }

    // update
    await updateRole({
      id: Number(id),
      name: form.name,
      description: form.description,
    });

    await setRolePermissions(Number(id), form.permissions);

    navigate("/uzytkownicy");
  };

  const deleteHandler = async () => {
    if (!isNew && confirm("Czy na pewno usunąć tę rolę?")) {
      await deleteRole(Number(id));
      navigate("/uzytkownicy");
    }
  };

  // pogrupuj permissions
  const grouped = allPermissions.reduce((acc: any, perm: any) => {
    if (!acc[perm.category]) acc[perm.category] = [];
    acc[perm.category].push(perm);
    return acc;
  }, {});

  return (
      <Layout pageKey="config.roles">
        <Breadcrumb
            items={[
              { label: "Konfiguracja systemu" },
              { label: "Użytkownicy", href: "/uzytkownicy" },
              { label: isNew ? "Nowa rola" : `Rola: ${form.name}` },
            ]}
        />

        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {isNew ? "Nowa rola" : "Konfiguracja roli"}
          </h1>
          <p className="text-muted-foreground">
            Zarządzanie nazwą, opisem i uprawnieniami
          </p>
        </div>

        {/* Dane roli */}
        <Card className="mb-6">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Dane roli</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <Label>Nazwa roli</Label>
              <Input
                  value={form.name}
                  onChange={(e) =>
                      setForm({ ...form, name: e.target.value })
                  }
              />
            </div>

            <div>
              <Label>Opis</Label>
              <Textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                      setForm({ ...form, description: e.target.value })
                  }
              />
            </div>

            <div className="flex gap-2">
              <Button className="gap-2" onClick={saveHandler}>
                <Save className="h-4 w-4" /> Zapisz zmiany
              </Button>

              {!isNew && (
                  <Button
                      variant="outline"
                      className="gap-2 text-danger"
                      onClick={deleteHandler}
                  >
                    <Trash2 className="h-4 w-4" /> Usuń rolę
                  </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Uprawnienia */}
        <Card>
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Uprawnienia</h2>
          </div>

          <div className="p-6 space-y-6">
            {Object.entries(grouped).map(([category, items]: any) => (
                <div key={category}>
                  <h3 className="mb-3 text-sm font-semibold">{category}</h3>

                  <div className="space-y-2">
                    {items.map((perm: any) => (
                        <div
                            key={perm.id}
                            className="flex items-start gap-3 border rounded-lg p-3 hover:bg-muted/30"
                        >
                          <Checkbox
                              checked={form.permissions.includes(perm.id)}
                              onCheckedChange={() => togglePermission(perm.id)}
                          />

                          <div className="flex-1">
                            <Label className="font-medium">{perm.name}</Label>
                            <p className="text-xs text-muted-foreground">
                              {perm.description}
                            </p>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>
            ))}

            <Button className="mt-4 gap-2" onClick={saveHandler}>
              <Save className="h-4 w-4" />
              Zapisz uprawnienia
            </Button>
          </div>
        </Card>
      </Layout>
  );
};

export default RoleConfig;
