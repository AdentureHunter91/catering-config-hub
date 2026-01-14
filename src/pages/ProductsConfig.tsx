import { useState } from "react";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, Plus, Settings } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// Mock data
interface Product {
  id: number;
  name: string;
  variant: string;
  content: string;
  sku: string;
  ean: string;
  category: string;
  subcategory: string;
  status: "active" | "inactive";
}

const mockProducts: Product[] = [
  {
    id: 1,
    name: "Ser żółty",
    variant: "Gouda",
    content: "1 kg",
    sku: "SER-GOUDA-1KG",
    ean: "5901234567890",
    category: "Produkty spożywcze",
    subcategory: "Sery",
    status: "active",
  },
  {
    id: 2,
    name: "Ser żółty",
    variant: "Edamski",
    content: "500 g",
    sku: "SER-EDAM-500G",
    ean: "5901234567891",
    category: "Produkty spożywcze",
    subcategory: "Sery",
    status: "active",
  },
  {
    id: 3,
    name: "Szynka",
    variant: "Wiejska",
    content: "1 kg",
    sku: "WEDL-SZYNKA-1KG",
    ean: "5901234567892",
    category: "Produkty spożywcze",
    subcategory: "Wędliny",
    status: "active",
  },
  {
    id: 4,
    name: "Kiełbasa",
    variant: "Podwawelska",
    content: "500 g",
    sku: "WEDL-KIELB-500G",
    ean: "5901234567893",
    category: "Produkty spożywcze",
    subcategory: "Wędliny",
    status: "inactive",
  },
  {
    id: 5,
    name: "Marchew",
    variant: "Świeża",
    content: "1 kg",
    sku: "WARZY-MARCH-1KG",
    ean: "5901234567894",
    category: "Produkty spożywcze",
    subcategory: "Warzywa",
    status: "active",
  },
  {
    id: 6,
    name: "Płyn do mycia naczyń",
    variant: "Cytrynowy",
    content: "1 L",
    sku: "CHEM-PLYN-1L",
    ean: "5901234567895",
    category: "Chemia",
    subcategory: "Środki czystości",
    status: "active",
  },
  {
    id: 7,
    name: "Rękawiczki nitrylowe",
    variant: "Rozmiar M",
    content: "100 szt",
    sku: "CHEM-REKAW-M-100",
    ean: "5901234567896",
    category: "Chemia",
    subcategory: "Rękawiczki",
    status: "active",
  },
];

const categories = ["Produkty spożywcze", "Chemia", "Opakowania"];
const subcategoriesMap: Record<string, string[]> = {
  "Produkty spożywcze": ["Sery", "Wędliny", "Warzywa"],
  Chemia: ["Środki czystości", "Rękawiczki"],
  Opakowania: [],
};

const ProductsConfig = () => {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [subcategoryFilter, setSubcategoryFilter] = useState("all");
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const filteredProducts = mockProducts
    .filter((p) => {
      const s = search.toLowerCase();
      return (
        p.name.toLowerCase().includes(s) ||
        p.variant.toLowerCase().includes(s) ||
        p.sku.toLowerCase().includes(s) ||
        p.ean.includes(s)
      );
    })
    .filter((p) => {
      if (categoryFilter === "all") return true;
      return p.category === categoryFilter;
    })
    .filter((p) => {
      if (subcategoryFilter === "all") return true;
      return p.subcategory === subcategoryFilter;
    });

  const availableSubcategories =
    categoryFilter !== "all" ? subcategoriesMap[categoryFilter] || [] : [];

  return (
    <Layout pageKey="config.products">
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Konfiguracja produktów" },
        ]}
      />

      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Konfiguracja produktów</h1>
          <p className="mt-1 text-muted-foreground">
            Zarządzaj produktami, wariantami i kodami EAN
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Dodaj produkt
        </Button>
      </div>

      <Card>
        <div className="border-b p-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="relative flex-1 min-w-[250px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Szukaj produktu / EAN / SKU..."
                className="pl-10"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            {/* Category filter */}
            <Select
              value={categoryFilter}
              onValueChange={(val) => {
                setCategoryFilter(val);
                setSubcategoryFilter("all");
              }}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Kategoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie kategorie</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Subcategory filter */}
            <Select
              value={subcategoryFilter}
              onValueChange={setSubcategoryFilter}
              disabled={categoryFilter === "all" || availableSubcategories.length === 0}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Subkategoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Wszystkie subkategorie</SelectItem>
                {availableSubcategories.map((sub) => (
                  <SelectItem key={sub} value={sub}>
                    {sub}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-medium">Produkt</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Podprodukt / Wariant</th>
                <th className="px-6 py-3 text-left text-sm font-medium">Zawartość</th>
                <th className="px-6 py-3 text-left text-sm font-medium">SKU</th>
                <th className="px-6 py-3 text-left text-sm font-medium">EAN / GTIN</th>
                <th className="px-6 py-3 text-center text-sm font-medium">Status</th>
                <th className="px-6 py-3 text-center text-sm font-medium">Akcje</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div>
                      <span className="font-medium">{product.name}</span>
                      <div className="text-xs text-muted-foreground">
                        {product.category} / {product.subcategory}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">{product.variant}</td>
                  <td className="px-6 py-4">{product.content}</td>
                  <td className="px-6 py-4 font-mono text-sm">{product.sku}</td>
                  <td className="px-6 py-4 font-mono text-sm">{product.ean}</td>
                  <td className="px-6 py-4 text-center">
                    <Badge
                      variant={product.status === "active" ? "default" : "secondary"}
                      className={product.status === "active" ? "bg-green-600" : ""}
                    >
                      {product.status === "active" ? "Aktywny" : "Nieaktywny"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button variant="ghost" size="sm" className="gap-2" disabled>
                      <Settings className="h-4 w-4" />
                      Zarządzaj
                    </Button>
                  </td>
                </tr>
              ))}

              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    Brak wyników dla zastosowanych filtrów
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Add Product Dialog - Placeholder */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj produkt</DialogTitle>
          </DialogHeader>
          <div className="py-8 text-center text-muted-foreground">
            <p className="text-lg font-medium mb-2">🚧 W przygotowaniu</p>
            <p className="text-sm">
              Formularz dodawania produktów będzie dostępny wkrótce.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default ProductsConfig;
