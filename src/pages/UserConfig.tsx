import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

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

import { getUser, createUser, updateUser, setUserRoles } from "@/api/users";
import { getRoles } from "@/api/roles";

const UserConfig = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const isNew = id === "nowy";

  // Load roles
  const {
    data: allRoles = [],
    isLoading: loadingRoles
  } = useQuery({
    queryKey: ["roles"],
    queryFn: getRoles
  });

  // Load user if editing
  const {
    data: userData,
    isLoading: loadingUser,
    error: userError
  } = useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(Number(id)),
    enabled: !isNew
  });

  // Form state
  const [form, setForm] = useState({
    email: "",
    firstName: "",
    lastName: "",
    isActive: true,
    password: "",
    passwordConfirm: "",
    roles: [] as number[]
  });

  // Populate form after loading user
  useEffect(() => {
    if (!isNew && userData) {
      setForm({
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isActive: userData.isActive,
        password: "",
        passwordConfirm: "",
        roles: userData.roles.map((r: any) => r.id)
      });
    }
  }, [isNew, userData]);

  if (userError) {
    return (
        <Layout pageKey="config.users">
          <div className="p-6 text-red-500">Nie znaleziono użytkownika.</div>
        </Layout>
    );
  }

  if (loadingUser || loadingRoles) {
    return (
        <Layout pageKey="config.users">
          <div className="p-6">Ładowanie...</div>
        </Layout>
    );
  }

  const toggleRole = (roleId: number) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(roleId)
          ? prev.roles.filter((id) => id !== roleId)
          : [...prev.roles, roleId],
    }));
  };

  const saveHandler = async () => {
    if (!isNew) {
      await updateUser({
        id: Number(id),
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        isActive: form.isActive,
        password: form.password || undefined
      });

      await setUserRoles(Number(id), form.roles);
      navigate("/uzytkownicy");
      return;
    }

    const newId = await createUser({
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      isActive: form.isActive,
      password: form.password
    });

    await setUserRoles(newId, form.roles);
    navigate(`/uzytkownicy`);
  };

  return (
      <Layout pageKey="config.users">
        <Breadcrumb
            items={[
              { label: "Konfiguracja systemu" },
              { label: "Użytkownicy", href: "/uzytkownicy" },
              { label: isNew ? "Nowy użytkownik" : form.firstName + " " + form.lastName },
            ]}
        />

        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold">
            {isNew ? "Nowy użytkownik" : "Konfiguracja użytkownika"}
          </h1>

          {!isNew && (
              <Badge className={form.isActive ? "bg-success" : "bg-secondary"}>
                Status: {form.isActive ? "Aktywny" : "Nieaktywny"}
              </Badge>
          )}
        </div>

        {/* Dane użytkownika */}
        <Card className="mb-6">
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Dane użytkownika</h2>
          </div>
          <div className="p-6">
            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Email</Label>
                <Input
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="space-y-2 flex items-center gap-3 pt-8">
                <Switch
                    checked={form.isActive}
                    onCheckedChange={(val) => setForm({ ...form, isActive: val })}
                />
                <Label className="cursor-pointer">Konto aktywne</Label>
              </div>

              <div className="space-y-2">
                <Label>Imię</Label>
                <Input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Nazwisko</Label>
                <Input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Hasło</Label>
                <Input
                    type="password"
                    placeholder={isNew ? "" : "Zostaw puste, aby nie zmieniać"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Potwierdź hasło</Label>
                <Input
                    type="password"
                    value={form.passwordConfirm}
                    onChange={(e) => setForm({ ...form, passwordConfirm: e.target.value })}
                />
              </div>
            </div>

            <div className="mt-6 flex gap-2">
              <Button className="gap-2" onClick={saveHandler}>
                <Save className="h-4 w-4" />
                Zapisz
              </Button>

              {!isNew && (
                  <Button variant="outline" className="gap-2 text-danger">
                    <Trash2 className="h-4 w-4" />
                    Usuń
                  </Button>
              )}
            </div>
          </div>
        </Card>

        {/* Role */}
        <Card>
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold">Przypisane role</h2>
          </div>

          <div className="p-6 space-y-4">
            {allRoles.map((role: any) => (
                <div key={role.id} className="flex items-start gap-3 border rounded-lg p-4">
                  <Checkbox
                      checked={form.roles.includes(role.id)}
                      onCheckedChange={() => toggleRole(role.id)}
                  />
                  <div>
                    <Label className="font-medium">{role.name}</Label>
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                  </div>
                </div>
            ))}

            <Button className="mt-4" onClick={saveHandler}>
              <Save className="h-4 w-4" />
              Zapisz role
            </Button>
          </div>
        </Card>
      </Layout>
  );
};

export default UserConfig;
