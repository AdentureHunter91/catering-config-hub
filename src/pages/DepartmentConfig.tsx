import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, Trash2 } from "lucide-react";

const DepartmentConfig = () => {
  return (
    <Layout>
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Oddziały", href: "/oddzialy" },
          { label: "Oddział Internistyczny" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Konfiguracja oddziału</h1>
        <p className="mt-1 text-muted-foreground">Dane globalnego oddziału systemowego</p>
      </div>

      <Card>
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold text-foreground">Dane oddziału</h2>
        </div>
        <div className="p-6">
          <div className="grid gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nazwa</Label>
              <Input id="name" defaultValue="Oddział Internistyczny" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="short-name">Nazwa skrócona</Label>
              <Input id="short-name" defaultValue="Interna" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Textarea
                id="description"
                defaultValue="Oddział chorób wewnętrznych"
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
              Usuń oddział
            </Button>
          </div>
        </div>
      </Card>
    </Layout>
  );
};

export default DepartmentConfig;
