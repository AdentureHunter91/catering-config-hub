import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Trash2 } from "lucide-react";

const PermissionConfig = () => {
  return (
    <Layout>
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Uprawnienia", href: "/uprawnienia" },
          { label: "contracts.view" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Konfiguracja uprawnienia</h1>
        <p className="mt-1 text-muted-foreground">Zarządzanie uprawnieniem systemowym</p>
      </div>

      <Card>
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Dane uprawnienia</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa uprawnienia</Label>
              <Input id="name" defaultValue="contracts.view" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                defaultValue="Umożliwia przeglądanie listy kontraktów i ich szczegółów"
                rows={3}
              />
            </div>
          </div>
          <div className="mt-6 flex gap-2">
            <Button className="gap-2">
              <Save className="h-4 w-4" />
              Zapisz zmiany
            </Button>
            <Button variant="outline" className="gap-2 text-destructive hover:text-destructive">
              <Trash2 className="h-4 w-4" />
              Usuń uprawnienie
            </Button>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default PermissionConfig;
