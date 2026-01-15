import { useState, useRef, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Search,
  Plus,
  ChevronRight,
  ChevronDown,
  Package,
  Layers,
  FolderOpen,
  Folder,
  Settings,
  Pencil,
  Trash2,
  Archive,
  RotateCcw,
  AlertTriangle,
  Wheat,
  Milk,
  Egg,
  Fish,
  Nut,
  X,
  Save,
  Barcode,
  Database,
  Link2,
  Link2Off,
  Eye,
  EyeOff,
  Camera,
  Loader2,
  ExternalLink,
  Download,
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

// Types
interface Allergen {
  id: string;
  name: string;
  icon: React.ReactNode;
}

interface NutritionalValues {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sodium: number;
}

interface NutritionDatabaseEntry {
  id: number;
  name: string;
  nutritionalValues: NutritionalValues;
}

interface ProductVariant {
  id: number;
  name: string;
  ean: string;
  sku: string;
  content: string;
  unit: string;
  status: "active" | "archived";
}

interface SubProduct {
  id: number;
  productId: number;
  name: string;
  variants: ProductVariant[];
  nutritionalValues: NutritionalValues;
  allergens: string[];
  status: "active" | "archived";
  nutritionDatabaseId?: number; // Reference to nutrition database
}

interface Product {
  id: number;
  subcategoryId: number;
  name: string;
  description: string;
  subProducts: SubProduct[];
  status: "active" | "archived";
}

interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
  products: Product[];
}

interface Category {
  id: number;
  name: string;
  subcategories: Subcategory[];
}

// Mock allergens
const allergensList: Allergen[] = [
  { id: "gluten", name: "Gluten", icon: <Wheat className="h-4 w-4" /> },
  { id: "lactose", name: "Laktoza", icon: <Milk className="h-4 w-4" /> },
  { id: "eggs", name: "Jaja", icon: <Egg className="h-4 w-4" /> },
  { id: "fish", name: "Ryby", icon: <Fish className="h-4 w-4" /> },
  { id: "nuts", name: "Orzechy", icon: <Nut className="h-4 w-4" /> },
  { id: "soy", name: "Soja", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "celery", name: "Seler", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "mustard", name: "Gorczyca", icon: <AlertTriangle className="h-4 w-4" /> },
];

// Mock nutrition database entries
const mockNutritionDatabase: NutritionDatabaseEntry[] = [
  { id: 1, name: "Ser gouda", nutritionalValues: { calories: 356, protein: 25, carbs: 2, fat: 27, fiber: 0, sodium: 819 } },
  { id: 2, name: "Ser edamski", nutritionalValues: { calories: 357, protein: 25, carbs: 1.4, fat: 28, fiber: 0, sodium: 965 } },
  { id: 3, name: "Twaróg półtłusty", nutritionalValues: { calories: 98, protein: 18, carbs: 3, fat: 2, fiber: 0, sodium: 450 } },
  { id: 4, name: "Szynka wieprzowa gotowana", nutritionalValues: { calories: 145, protein: 21, carbs: 2, fat: 6, fiber: 0, sodium: 1200 } },
  { id: 5, name: "Kiełbasa podwawelska", nutritionalValues: { calories: 290, protein: 16, carbs: 1, fat: 25, fiber: 0, sodium: 980 } },
  { id: 6, name: "Marchew surowa", nutritionalValues: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sodium: 69 } },
  { id: 7, name: "Pietruszka korzeń", nutritionalValues: { calories: 36, protein: 2.5, carbs: 6, fat: 0.6, fiber: 3, sodium: 56 } },
];

// Mock data with full hierarchy
const mockCategories: Category[] = [
  {
    id: 1,
    name: "Produkty spożywcze",
    subcategories: [
      {
        id: 1,
        categoryId: 1,
        name: "Sery",
        products: [
          {
            id: 1,
            subcategoryId: 1,
            name: "Ser żółty",
            description: "Ser żółty twardy lub półtwardy",
            status: "active",
            subProducts: [
              {
                id: 1,
                productId: 1,
                name: "Ser Gouda",
                status: "active",
                nutritionalValues: { calories: 356, protein: 25, carbs: 2, fat: 27, fiber: 0, sodium: 819 },
                allergens: ["lactose"],
                nutritionDatabaseId: 1,
                variants: [
                  { id: 1, name: "Gouda 500g", ean: "5901234567890", sku: "SER-GOUDA-500G", content: "500", unit: "g", status: "active" },
                  { id: 2, name: "Gouda 1kg", ean: "5901234567891", sku: "SER-GOUDA-1KG", content: "1000", unit: "g", status: "active" },
                ],
              },
              {
                id: 2,
                productId: 1,
                name: "Ser Edamski",
                status: "active",
                nutritionalValues: { calories: 357, protein: 25, carbs: 1.4, fat: 28, fiber: 0, sodium: 965 },
                allergens: ["lactose"],
                nutritionDatabaseId: 2,
                variants: [
                  { id: 3, name: "Edamski 500g", ean: "5901234567892", sku: "SER-EDAM-500G", content: "500", unit: "g", status: "active" },
                ],
              },
            ],
          },
          {
            id: 2,
            subcategoryId: 1,
            name: "Ser biały",
            description: "Ser twarogowy i inne sery białe",
            status: "active",
            subProducts: [
              {
                id: 3,
                productId: 2,
                name: "Twaróg półtłusty",
                status: "active",
                nutritionalValues: { calories: 98, protein: 18, carbs: 3, fat: 2, fiber: 0, sodium: 450 },
                allergens: ["lactose"],
                nutritionDatabaseId: 3,
                variants: [
                  { id: 4, name: "Twaróg 250g", ean: "5901234567893", sku: "SER-TWAROG-250G", content: "250", unit: "g", status: "active" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 2,
        categoryId: 1,
        name: "Wędliny",
        products: [
          {
            id: 3,
            subcategoryId: 2,
            name: "Szynka",
            description: "Produkty z szynki wieprzowej",
            status: "active",
            subProducts: [
              {
                id: 4,
                productId: 3,
                name: "Szynka wiejska",
                status: "active",
                nutritionalValues: { calories: 145, protein: 21, carbs: 2, fat: 6, fiber: 0, sodium: 1200 },
                allergens: [],
                nutritionDatabaseId: 4,
                variants: [
                  { id: 5, name: "Szynka wiejska 1kg", ean: "5901234567894", sku: "WEDL-SZYNKA-1KG", content: "1000", unit: "g", status: "active" },
                ],
              },
            ],
          },
          {
            id: 4,
            subcategoryId: 2,
            name: "Kiełbasa",
            description: "Różne rodzaje kiełbas",
            status: "archived",
            subProducts: [
              {
                id: 5,
                productId: 4,
                name: "Kiełbasa podwawelska",
                status: "active",
                nutritionalValues: { calories: 290, protein: 16, carbs: 1, fat: 25, fiber: 0, sodium: 980 },
                allergens: ["gluten", "mustard"],
                // No nutritionDatabaseId - not linked
                variants: [
                  { id: 6, name: "Podwawelska 500g", ean: "5901234567895", sku: "WEDL-PODWAW-500G", content: "500", unit: "g", status: "active" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 3,
        categoryId: 1,
        name: "Warzywa",
        products: [
          {
            id: 5,
            subcategoryId: 3,
            name: "Warzywa korzeniowe",
            description: "Marchew, pietruszka, seler",
            status: "active",
            subProducts: [
              {
                id: 6,
                productId: 5,
                name: "Marchew",
                status: "active",
                nutritionalValues: { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8, sodium: 69 },
                allergens: [],
                nutritionDatabaseId: 6,
                variants: [
                  { id: 7, name: "Marchew 1kg", ean: "5901234567896", sku: "WARZY-MARCH-1KG", content: "1000", unit: "g", status: "active" },
                  { id: 8, name: "Marchew 5kg", ean: "5901234567897", sku: "WARZY-MARCH-5KG", content: "5000", unit: "g", status: "active" },
                ],
              },
              {
                id: 7,
                productId: 5,
                name: "Pietruszka korzeń",
                status: "archived",
                nutritionalValues: { calories: 36, protein: 2.5, carbs: 6, fat: 0.6, fiber: 3, sodium: 56 },
                allergens: ["celery"],
                // No nutritionDatabaseId - not linked
                variants: [
                  { id: 9, name: "Pietruszka 1kg", ean: "5901234567898", sku: "WARZY-PIETR-1KG", content: "1000", unit: "g", status: "active" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Chemia",
    subcategories: [
      {
        id: 4,
        categoryId: 2,
        name: "Środki czystości",
        products: [
          {
            id: 6,
            subcategoryId: 4,
            name: "Płyny do mycia",
            description: "Płyny do mycia naczyń i powierzchni",
            status: "active",
            subProducts: [
              {
                id: 8,
                productId: 6,
                name: "Płyn do naczyń cytrynowy",
                status: "active",
                nutritionalValues: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 },
                allergens: [],
                variants: [
                  { id: 10, name: "Płyn cytrynowy 1L", ean: "5901234567899", sku: "CHEM-PLYN-1L", content: "1000", unit: "ml", status: "active" },
                ],
              },
            ],
          },
        ],
      },
      {
        id: 5,
        categoryId: 2,
        name: "Rękawiczki",
        products: [
          {
            id: 7,
            subcategoryId: 5,
            name: "Rękawiczki jednorazowe",
            description: "Rękawiczki nitrylowe i lateksowe",
            status: "active",
            subProducts: [
              {
                id: 9,
                productId: 7,
                name: "Rękawiczki nitrylowe M",
                status: "active",
                nutritionalValues: { calories: 0, protein: 0, carbs: 0, fat: 0, fiber: 0, sodium: 0 },
                allergens: [],
                variants: [
                  { id: 11, name: "Nitrylowe M 100szt", ean: "5901234567900", sku: "CHEM-REKAW-M-100", content: "100", unit: "szt", status: "active" },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 3,
    name: "Opakowania",
    subcategories: [],
  },
];

// Expanded state types
type ExpandedState = {
  categories: Set<number>;
  subcategories: Set<number>;
  products: Set<number>;
  subProducts: Set<number>;
};

const ProductsConfig = () => {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [showArchived, setShowArchived] = useState(false);
  const [expanded, setExpanded] = useState<ExpandedState>({
    categories: new Set([1]),
    subcategories: new Set(),
    products: new Set(),
    subProducts: new Set(),
  });

  // Selected item for management panel
  const [selectedItem, setSelectedItem] = useState<{
    type: "product" | "subProduct" | "variant" | null;
    data: Product | SubProduct | ProductVariant | null;
    parentProduct?: Product;
    parentSubProduct?: SubProduct;
  }>({ type: null, data: null });

  // Dialogs
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [addSubProductDialogOpen, setAddSubProductDialogOpen] = useState(false);
  const [editSubProductDialogOpen, setEditSubProductDialogOpen] = useState(false);
  const [addVariantDialogOpen, setAddVariantDialogOpen] = useState(false);
  const [editVariantDialogOpen, setEditVariantDialogOpen] = useState(false);

  // Form states for dialogs
  const [selectedNutritionEntry, setSelectedNutritionEntry] = useState<string>("");

  // Toggle expansion functions
  const toggleCategory = (id: number) => {
    setExpanded((prev) => {
      const newCategories = new Set(prev.categories);
      if (newCategories.has(id)) {
        newCategories.delete(id);
      } else {
        newCategories.add(id);
      }
      return { ...prev, categories: newCategories };
    });
  };

  const toggleSubcategory = (id: number) => {
    setExpanded((prev) => {
      const newSubcategories = new Set(prev.subcategories);
      if (newSubcategories.has(id)) {
        newSubcategories.delete(id);
      } else {
        newSubcategories.add(id);
      }
      return { ...prev, subcategories: newSubcategories };
    });
  };

  const toggleProduct = (id: number) => {
    setExpanded((prev) => {
      const newProducts = new Set(prev.products);
      if (newProducts.has(id)) {
        newProducts.delete(id);
      } else {
        newProducts.add(id);
      }
      return { ...prev, products: newProducts };
    });
  };

  const toggleSubProduct = (id: number) => {
    setExpanded((prev) => {
      const newSubProducts = new Set(prev.subProducts);
      if (newSubProducts.has(id)) {
        newSubProducts.delete(id);
      } else {
        newSubProducts.add(id);
      }
      return { ...prev, subProducts: newSubProducts };
    });
  };

  // Filter logic for search and archived
  const filterCategories = (cats: Category[]): Category[] => {
    return cats
      .map((cat) => ({
        ...cat,
        subcategories: cat.subcategories
          .map((sub) => ({
            ...sub,
            products: sub.products
              .filter((prod) => showArchived || prod.status === "active")
              .map((prod) => ({
                ...prod,
                subProducts: prod.subProducts.filter(
                  (sp) => showArchived || sp.status === "active"
                ),
              }))
              .filter((prod) => {
                if (!search.trim()) return true;
                const s = search.toLowerCase();
                return (
                  prod.name.toLowerCase().includes(s) ||
                  prod.subProducts.some(
                    (sp) =>
                      sp.name.toLowerCase().includes(s) ||
                      sp.variants.some(
                        (v) =>
                          v.name.toLowerCase().includes(s) ||
                          v.ean.includes(s) ||
                          v.sku.toLowerCase().includes(s)
                      )
                  )
                );
              }),
          }))
          .filter((sub) => sub.products.length > 0 || (!search.trim() && sub.name.toLowerCase().includes(search.toLowerCase()))),
      }))
      .filter(
        (cat) =>
          cat.subcategories.length > 0 || (!search.trim() && cat.name.toLowerCase().includes(search.toLowerCase()))
      );
  };

  const filteredCategories = filterCategories(categories);

  // Count totals (active only for stats)
  const totalProducts = categories.reduce(
    (acc, cat) =>
      acc +
      cat.subcategories.reduce((a, sub) => a + sub.products.filter(p => p.status === "active").length, 0),
    0
  );
  const totalSubProducts = categories.reduce(
    (acc, cat) =>
      acc +
      cat.subcategories.reduce(
        (a, sub) =>
          a + sub.products.reduce((b, prod) => b + prod.subProducts.filter(sp => sp.status === "active").length, 0),
        0
      ),
    0
  );
  const totalVariants = categories.reduce(
    (acc, cat) =>
      acc +
      cat.subcategories.reduce(
        (a, sub) =>
          a +
          sub.products.reduce(
            (b, prod) =>
              b + prod.subProducts.reduce((c, sp) => c + sp.variants.filter(v => v.status === "active").length, 0),
            0
          ),
        0
      ),
    0
  );

  const archivedCount = categories.reduce(
    (acc, cat) =>
      acc +
      cat.subcategories.reduce(
        (a, sub) =>
          a + sub.products.filter(p => p.status === "archived").length +
          sub.products.reduce((b, prod) => b + prod.subProducts.filter(sp => sp.status === "archived").length, 0),
        0
      ),
    0
  );

  // Count products without nutrition database link
  const unlinkedCount = categories.reduce(
    (acc, cat) =>
      acc +
      cat.subcategories.reduce(
        (a, sub) =>
          a + sub.products.reduce(
            (b, prod) => b + prod.subProducts.filter(sp => !sp.nutritionDatabaseId && sp.status === "active").length,
            0
          ),
        0
      ),
    0
  );

  // Render allergen badge
  const renderAllergenBadge = (allergenId: string) => {
    const allergen = allergensList.find((a) => a.id === allergenId);
    if (!allergen) return null;
    return (
      <Badge key={allergenId} variant="outline" className="gap-1 text-orange-600 border-orange-300">
        {allergen.icon}
        <span className="text-xs">{allergen.name}</span>
      </Badge>
    );
  };

  // Get nutrition database entry name
  const getNutritionEntryName = (id?: number) => {
    if (!id) return null;
    return mockNutritionDatabase.find(e => e.id === id)?.name;
  };

  // Copy values from nutrition database
  const handleCopyFromDatabase = (entryId: string) => {
    const entry = mockNutritionDatabase.find(e => e.id === parseInt(entryId));
    if (entry) {
      // Mock - in real app would update form fields
      console.log("Copying nutrition values from:", entry);
    }
  };

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
          <h1 className="text-3xl font-bold text-foreground">
            Konfiguracja produktów
          </h1>
          <p className="mt-1 text-muted-foreground">
            Zarządzaj hierarchią produktów: Kategoria → Subkategoria → Produkt → Subprodukt → Wariant EAN
          </p>
        </div>
        <Button className="gap-2" onClick={() => setAddProductDialogOpen(true)}>
          <Plus className="h-4 w-4" />
          Dodaj produkt
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 mb-6 grid-cols-2 lg:grid-cols-5">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Folder className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{categories.length}</p>
              <p className="text-sm text-muted-foreground">Kategorie</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <Package className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalProducts}</p>
              <p className="text-sm text-muted-foreground">Produkty</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Layers className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSubProducts}</p>
              <p className="text-sm text-muted-foreground">Subprodukty</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-orange-100">
              <Barcode className="h-5 w-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalVariants}</p>
              <p className="text-sm text-muted-foreground">Warianty EAN</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100">
              <Link2Off className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{unlinkedCount}</p>
              <p className="text-sm text-muted-foreground">Bez bazy IŻŻ</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* LEFT: Hierarchical tree */}
        <div className="lg:col-span-2">
          <Card>
            <div className="border-b p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Szukaj produktu, subproduktu, EAN, SKU..."
                    className="pl-10"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="show-archived"
                    checked={showArchived}
                    onCheckedChange={setShowArchived}
                  />
                  <Label htmlFor="show-archived" className="text-sm flex items-center gap-1 cursor-pointer">
                    {showArchived ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    Archiwalne ({archivedCount})
                  </Label>
                </div>
              </div>
            </div>

            <ScrollArea className="h-[600px]">
              <div className="p-4">
                {filteredCategories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Brak wyników dla zastosowanych filtrów
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredCategories.map((category) => (
                      <div key={category.id}>
                        {/* Category row */}
                        <div
                          className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                          onClick={() => toggleCategory(category.id)}
                        >
                          {expanded.categories.has(category.id) ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          )}
                          {expanded.categories.has(category.id) ? (
                            <FolderOpen className="h-4 w-4 text-blue-600" />
                          ) : (
                            <Folder className="h-4 w-4 text-blue-600" />
                          )}
                          <span className="font-semibold">{category.name}</span>
                          <Badge variant="secondary" className="ml-auto">
                            {category.subcategories.length} sub.
                          </Badge>
                        </div>

                        {/* Subcategories */}
                        {expanded.categories.has(category.id) && (
                          <div className="ml-6 space-y-1">
                            {category.subcategories.map((subcategory) => (
                              <div key={subcategory.id}>
                                {/* Subcategory row */}
                                <div
                                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                                  onClick={() => toggleSubcategory(subcategory.id)}
                                >
                                  {subcategory.products.length > 0 ? (
                                    expanded.subcategories.has(subcategory.id) ? (
                                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                    ) : (
                                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                    )
                                  ) : (
                                    <div className="w-4" />
                                  )}
                                  <FolderOpen className="h-4 w-4 text-purple-500" />
                                  <span className="font-medium">{subcategory.name}</span>
                                  <Badge variant="outline" className="ml-auto">
                                    {subcategory.products.length} prod.
                                  </Badge>
                                </div>

                                {/* Products */}
                                {expanded.subcategories.has(subcategory.id) && (
                                  <div className="ml-6 space-y-1">
                                    {subcategory.products.map((product) => (
                                      <div key={product.id}>
                                        {/* Product row */}
                                        <div
                                          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer ${
                                            selectedItem.type === "product" &&
                                            (selectedItem.data as Product)?.id === product.id
                                              ? "bg-primary/10 border border-primary"
                                              : ""
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedItem({
                                              type: "product",
                                              data: product,
                                            });
                                          }}
                                        >
                                          {product.subProducts.length > 0 ? (
                                            <button
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                toggleProduct(product.id);
                                              }}
                                            >
                                              {expanded.products.has(product.id) ? (
                                                <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                              ) : (
                                                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                              )}
                                            </button>
                                          ) : (
                                            <div className="w-4" />
                                          )}
                                          <Package className="h-4 w-4 text-green-600" />
                                          <span>{product.name}</span>
                                          <Badge
                                            variant={product.status === "active" ? "default" : "secondary"}
                                            className={`ml-2 ${product.status === "active" ? "bg-green-600" : "bg-gray-400"}`}
                                          >
                                            {product.status === "active" ? "Aktywny" : "Archiwum"}
                                          </Badge>
                                          <Badge variant="outline" className="ml-auto">
                                            {product.subProducts.length} subprod.
                                          </Badge>
                                        </div>

                                        {/* SubProducts */}
                                        {expanded.products.has(product.id) && (
                                          <div className="ml-6 space-y-1">
                                            {product.subProducts.map((subProduct) => (
                                              <div key={subProduct.id}>
                                                {/* SubProduct row */}
                                                <div
                                                  className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer ${
                                                    selectedItem.type === "subProduct" &&
                                                    (selectedItem.data as SubProduct)?.id === subProduct.id
                                                      ? "bg-primary/10 border border-primary"
                                                      : ""
                                                  }`}
                                                  onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedItem({
                                                      type: "subProduct",
                                                      data: subProduct,
                                                      parentProduct: product,
                                                    });
                                                  }}
                                                >
                                                  {subProduct.variants.length > 0 ? (
                                                    <button
                                                      onClick={(e) => {
                                                        e.stopPropagation();
                                                        toggleSubProduct(subProduct.id);
                                                      }}
                                                    >
                                                      {expanded.subProducts.has(subProduct.id) ? (
                                                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                                                      ) : (
                                                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                                      )}
                                                    </button>
                                                  ) : (
                                                    <div className="w-4" />
                                                  )}
                                                  <Layers className="h-4 w-4 text-orange-500" />
                                                  <span>{subProduct.name}</span>
                                                  
                                                  {/* Nutrition database link indicator */}
                                                  {subProduct.nutritionDatabaseId ? (
                                                    <Tooltip>
                                                      <TooltipTrigger>
                                                        <Link2 className="h-4 w-4 text-green-500" />
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                        <p>Połączono z bazą IŻŻ: {getNutritionEntryName(subProduct.nutritionDatabaseId)}</p>
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  ) : (
                                                    <Tooltip>
                                                      <TooltipTrigger>
                                                        <Link2Off className="h-4 w-4 text-red-500" />
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                        <p>Brak powiązania z bazą Instytutu Żywienia</p>
                                                      </TooltipContent>
                                                    </Tooltip>
                                                  )}

                                                  {subProduct.allergens.length > 0 && (
                                                    <AlertTriangle className="h-4 w-4 text-orange-500 ml-1" />
                                                  )}
                                                  
                                                  {subProduct.status === "archived" && (
                                                    <Badge variant="secondary" className="bg-gray-400 ml-1">
                                                      Archiwum
                                                    </Badge>
                                                  )}
                                                  
                                                  <Badge variant="outline" className="ml-auto">
                                                    {subProduct.variants.length} EAN
                                                  </Badge>
                                                </div>

                                                {/* Variants */}
                                                {expanded.subProducts.has(subProduct.id) && (
                                                  <div className="ml-6 space-y-1">
                                                    {subProduct.variants.map((variant) => (
                                                      <div
                                                        key={variant.id}
                                                        className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer ${
                                                          selectedItem.type === "variant" &&
                                                          (selectedItem.data as ProductVariant)?.id === variant.id
                                                            ? "bg-primary/10 border border-primary"
                                                            : ""
                                                        }`}
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          setSelectedItem({
                                                            type: "variant",
                                                            data: variant,
                                                            parentProduct: product,
                                                            parentSubProduct: subProduct,
                                                          });
                                                        }}
                                                      >
                                                        <div className="w-4" />
                                                        <Barcode className="h-4 w-4 text-gray-500" />
                                                        <span className="text-sm">{variant.name}</span>
                                                        <span className="text-xs text-muted-foreground ml-2">
                                                          {variant.content} {variant.unit}
                                                        </span>
                                                        <code className="text-xs bg-muted px-2 py-0.5 rounded ml-auto">
                                                          {variant.ean}
                                                        </code>
                                                      </div>
                                                    ))}
                                                  </div>
                                                )}
                                              </div>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </ScrollArea>
          </Card>
        </div>

        {/* RIGHT: Management Panel */}
        <div className="lg:col-span-1">
          <Card>
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">Panel zarządzania</h2>
            </div>

            {!selectedItem.data ? (
              <div className="p-6 text-center text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4 opacity-30" />
                <p>Wybierz element z drzewa, aby zobaczyć szczegóły i opcje zarządzania</p>
              </div>
            ) : selectedItem.type === "product" ? (
              <ProductManagementPanel
                product={selectedItem.data as Product}
                onAddSubProduct={() => setAddSubProductDialogOpen(true)}
                onEditProduct={() => setEditProductDialogOpen(true)}
              />
            ) : selectedItem.type === "subProduct" ? (
              <SubProductManagementPanel
                subProduct={selectedItem.data as SubProduct}
                parentProduct={selectedItem.parentProduct!}
                allergensList={allergensList}
                renderAllergenBadge={renderAllergenBadge}
                onAddVariant={() => setAddVariantDialogOpen(true)}
                onEditSubProduct={() => setEditSubProductDialogOpen(true)}
                nutritionDatabase={mockNutritionDatabase}
              />
            ) : selectedItem.type === "variant" ? (
              <VariantManagementPanel
                variant={selectedItem.data as ProductVariant}
                parentSubProduct={selectedItem.parentSubProduct!}
                onEditVariant={() => setEditVariantDialogOpen(true)}
              />
            ) : null}
          </Card>
        </div>
      </div>

      {/* Add Product Dialog */}
      <Dialog open={addProductDialogOpen} onOpenChange={setAddProductDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dodaj nowy produkt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kategoria</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz kategorię" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Subkategoria</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz subkategorię" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Sery</SelectItem>
                  <SelectItem value="2">Wędliny</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nazwa produktu</Label>
              <Input placeholder="np. Ser żółty" />
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Input placeholder="Krótki opis produktu" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddProductDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={() => setAddProductDialogOpen(false)}>
              <Save className="h-4 w-4 mr-2" />
              Zapisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <Dialog open={editProductDialogOpen} onOpenChange={setEditProductDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edytuj produkt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nazwa produktu</Label>
              <Input 
                placeholder="np. Ser żółty" 
                defaultValue={selectedItem.type === "product" ? (selectedItem.data as Product)?.name : ""} 
              />
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Input 
                placeholder="Krótki opis produktu" 
                defaultValue={selectedItem.type === "product" ? (selectedItem.data as Product)?.description : ""} 
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select defaultValue={selectedItem.type === "product" ? (selectedItem.data as Product)?.status : "active"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktywny</SelectItem>
                  <SelectItem value="archived">Zarchiwizowany</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditProductDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={() => setEditProductDialogOpen(false)}>
              <Save className="h-4 w-4 mr-2" />
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add SubProduct Dialog */}
      <Dialog open={addSubProductDialogOpen} onOpenChange={setAddSubProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dodaj subprodukt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nazwa subproduktu</Label>
              <Input placeholder="np. Ser Gouda" />
            </div>
            
            <Separator />
            
            {/* Nutrition database link */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Powiąż z bazą Instytutu Żywienia
              </Label>
              <Select value={selectedNutritionEntry} onValueChange={setSelectedNutritionEntry}>
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz produkt z bazy IŻŻ..." />
                </SelectTrigger>
                <SelectContent>
                  {mockNutritionDatabase.map((entry) => (
                    <SelectItem key={entry.id} value={entry.id.toString()}>
                      {entry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedNutritionEntry && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-2"
                  onClick={() => handleCopyFromDatabase(selectedNutritionEntry)}
                >
                  <RotateCcw className="h-4 w-4" />
                  Przepisz wartości z bazy
                </Button>
              )}
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Alergeny</Label>
              <div className="grid grid-cols-2 gap-2">
                {allergensList.map((allergen) => (
                  <div key={allergen.id} className="flex items-center gap-2">
                    <Checkbox id={`add-${allergen.id}`} />
                    <Label htmlFor={`add-${allergen.id}`} className="flex items-center gap-1 text-sm cursor-pointer">
                      {allergen.icon}
                      {allergen.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Wartości odżywcze (na 100g)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Możesz przepisać wartości z bazy Instytutu Żywienia lub wpisać ręcznie
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Kalorie (kcal)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Białko (g)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Węglowodany (g)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tłuszcze (g)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Błonnik (g)</Label>
                  <Input type="number" placeholder="0" />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Sód (mg)</Label>
                  <Input type="number" placeholder="0" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSubProductDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={() => setAddSubProductDialogOpen(false)}>
              <Save className="h-4 w-4 mr-2" />
              Zapisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit SubProduct Dialog */}
      <Dialog open={editSubProductDialogOpen} onOpenChange={setEditSubProductDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edytuj subprodukt</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nazwa subproduktu</Label>
              <Input 
                placeholder="np. Ser Gouda" 
                defaultValue={selectedItem.type === "subProduct" ? (selectedItem.data as SubProduct)?.name : ""}
              />
            </div>
            
            <Separator />
            
            {/* Nutrition database link */}
            <div className="space-y-3">
              <Label className="flex items-center gap-2">
                <Database className="h-4 w-4" />
                Powiąż z bazą Instytutu Żywienia
              </Label>
              <Select 
                value={selectedItem.type === "subProduct" ? (selectedItem.data as SubProduct)?.nutritionDatabaseId?.toString() || "none" : "none"}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz produkt z bazy IŻŻ..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">-- Brak powiązania --</SelectItem>
                  {mockNutritionDatabase.map((entry) => (
                    <SelectItem key={entry.id} value={entry.id.toString()}>
                      {entry.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Przepisz wartości z bazy
              </Button>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Alergeny</Label>
              <div className="grid grid-cols-2 gap-2">
                {allergensList.map((allergen) => {
                  const isChecked = selectedItem.type === "subProduct" 
                    ? (selectedItem.data as SubProduct)?.allergens.includes(allergen.id) 
                    : false;
                  return (
                    <div key={allergen.id} className="flex items-center gap-2">
                      <Checkbox id={`edit-${allergen.id}`} defaultChecked={isChecked} />
                      <Label htmlFor={`edit-${allergen.id}`} className="flex items-center gap-1 text-sm cursor-pointer">
                        {allergen.icon}
                        {allergen.name}
                      </Label>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label>Wartości odżywcze (na 100g)</Label>
              <p className="text-xs text-muted-foreground mb-2">
                Możesz przepisać wartości z bazy Instytutu Żywienia lub wpisać ręcznie
              </p>
              {selectedItem.type === "subProduct" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs text-muted-foreground">Kalorie (kcal)</Label>
                    <Input type="number" defaultValue={(selectedItem.data as SubProduct)?.nutritionalValues.calories} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Białko (g)</Label>
                    <Input type="number" defaultValue={(selectedItem.data as SubProduct)?.nutritionalValues.protein} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Węglowodany (g)</Label>
                    <Input type="number" defaultValue={(selectedItem.data as SubProduct)?.nutritionalValues.carbs} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Tłuszcze (g)</Label>
                    <Input type="number" defaultValue={(selectedItem.data as SubProduct)?.nutritionalValues.fat} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Błonnik (g)</Label>
                    <Input type="number" defaultValue={(selectedItem.data as SubProduct)?.nutritionalValues.fiber} />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Sód (mg)</Label>
                    <Input type="number" defaultValue={(selectedItem.data as SubProduct)?.nutritionalValues.sodium} />
                  </div>
                </div>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Status</Label>
              <Select defaultValue={selectedItem.type === "subProduct" ? (selectedItem.data as SubProduct)?.status : "active"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktywny</SelectItem>
                  <SelectItem value="archived">Zarchiwizowany</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditSubProductDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={() => setEditSubProductDialogOpen(false)}>
              <Save className="h-4 w-4 mr-2" />
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Variant Dialog */}
      <AddVariantDialog 
        open={addVariantDialogOpen} 
        onOpenChange={setAddVariantDialogOpen}
        parentSubProduct={selectedItem.type === "subProduct" ? selectedItem.data as SubProduct : null}
      />

      {/* Edit Variant Dialog */}
      <Dialog open={editVariantDialogOpen} onOpenChange={setEditVariantDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edytuj wariant EAN</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nazwa wariantu</Label>
              <Input 
                placeholder="np. Gouda 500g" 
                defaultValue={selectedItem.type === "variant" ? (selectedItem.data as ProductVariant)?.name : ""}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Zawartość</Label>
                <Input 
                  type="number" 
                  defaultValue={selectedItem.type === "variant" ? (selectedItem.data as ProductVariant)?.content : ""}
                />
              </div>
              <div className="space-y-2">
                <Label>Jednostka</Label>
                <Select defaultValue={selectedItem.type === "variant" ? (selectedItem.data as ProductVariant)?.unit : ""}>
                  <SelectTrigger>
                    <SelectValue placeholder="Wybierz" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="g">g</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                    <SelectItem value="ml">ml</SelectItem>
                    <SelectItem value="l">l</SelectItem>
                    <SelectItem value="szt">szt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kod EAN / GTIN</Label>
              <Input 
                placeholder="5901234567890" 
                defaultValue={selectedItem.type === "variant" ? (selectedItem.data as ProductVariant)?.ean : ""}
              />
            </div>
            <div className="space-y-2">
              <Label>SKU</Label>
              <Input 
                placeholder="SER-GOUDA-500G" 
                defaultValue={selectedItem.type === "variant" ? (selectedItem.data as ProductVariant)?.sku : ""}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select defaultValue={selectedItem.type === "variant" ? (selectedItem.data as ProductVariant)?.status : "active"}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktywny</SelectItem>
                  <SelectItem value="archived">Zarchiwizowany</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditVariantDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={() => setEditVariantDialogOpen(false)}>
              <Save className="h-4 w-4 mr-2" />
              Zapisz zmiany
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

// Product Management Panel Component
const ProductManagementPanel = ({
  product,
  onAddSubProduct,
  onEditProduct,
}: {
  product: Product;
  onAddSubProduct: () => void;
  onEditProduct: () => void;
}) => (
  <div className="p-4 space-y-4">
    <div>
      <Label className="text-xs text-muted-foreground">Produkt</Label>
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-sm text-muted-foreground">{product.description}</p>
    </div>

    <div className="flex items-center gap-2">
      <Badge
        variant={product.status === "active" ? "default" : "secondary"}
        className={product.status === "active" ? "bg-green-600" : "bg-gray-400"}
      >
        {product.status === "active" ? "Aktywny" : "Archiwum"}
      </Badge>
      <span className="text-sm text-muted-foreground">
        {product.subProducts.length} subproduktów
      </span>
    </div>

    <Separator />

    <div className="space-y-2">
      <Button className="w-full gap-2" onClick={onAddSubProduct}>
        <Plus className="h-4 w-4" />
        Dodaj subprodukt
      </Button>
      <Button variant="outline" className="w-full gap-2" onClick={onEditProduct}>
        <Pencil className="h-4 w-4" />
        Edytuj produkt
      </Button>
      <Button variant="outline" className="w-full gap-2 text-orange-600 hover:text-orange-700">
        <Archive className="h-4 w-4" />
        {product.status === "active" ? "Archiwizuj" : "Przywróć"}
      </Button>
    </div>
  </div>
);

// SubProduct Management Panel Component
const SubProductManagementPanel = ({
  subProduct,
  parentProduct,
  allergensList,
  renderAllergenBadge,
  onAddVariant,
  onEditSubProduct,
  nutritionDatabase,
}: {
  subProduct: SubProduct;
  parentProduct: Product;
  allergensList: Allergen[];
  renderAllergenBadge: (id: string) => React.ReactNode;
  onAddVariant: () => void;
  onEditSubProduct: () => void;
  nutritionDatabase: NutritionDatabaseEntry[];
}) => {
  const linkedEntry = nutritionDatabase.find(e => e.id === subProduct.nutritionDatabaseId);
  
  return (
    <div className="p-4 space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Subprodukt z: {parentProduct.name}</Label>
        <h3 className="text-lg font-semibold">{subProduct.name}</h3>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        <Badge
          variant={subProduct.status === "active" ? "default" : "secondary"}
          className={subProduct.status === "active" ? "bg-green-600" : "bg-gray-400"}
        >
          {subProduct.status === "active" ? "Aktywny" : "Archiwum"}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {subProduct.variants.length} wariantów
        </span>
      </div>

      {/* Nutrition database link status */}
      <div className="p-3 rounded-lg bg-muted/50">
        <Label className="text-xs text-muted-foreground mb-2 block">Baza Instytutu Żywienia</Label>
        {linkedEntry ? (
          <div className="flex items-center gap-2">
            <Link2 className="h-4 w-4 text-green-500" />
            <span className="text-sm font-medium text-green-700">{linkedEntry.name}</span>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Link2Off className="h-4 w-4 text-red-500" />
            <span className="text-sm text-red-600">Brak powiązania</span>
          </div>
        )}
      </div>

      <Separator />

      {/* Allergens */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Alergeny</Label>
        {subProduct.allergens.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {subProduct.allergens.map((a) => renderAllergenBadge(a))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Brak alergenów</p>
        )}
      </div>

      <Separator />

      {/* Nutritional Values */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">
          Wartości odżywcze (na 100g)
        </Label>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between p-2 bg-muted/50 rounded">
            <span>Kalorie</span>
            <span className="font-medium">{subProduct.nutritionalValues.calories} kcal</span>
          </div>
          <div className="flex justify-between p-2 bg-muted/50 rounded">
            <span>Białko</span>
            <span className="font-medium">{subProduct.nutritionalValues.protein} g</span>
          </div>
          <div className="flex justify-between p-2 bg-muted/50 rounded">
            <span>Węglowodany</span>
            <span className="font-medium">{subProduct.nutritionalValues.carbs} g</span>
          </div>
          <div className="flex justify-between p-2 bg-muted/50 rounded">
            <span>Tłuszcze</span>
            <span className="font-medium">{subProduct.nutritionalValues.fat} g</span>
          </div>
          <div className="flex justify-between p-2 bg-muted/50 rounded">
            <span>Błonnik</span>
            <span className="font-medium">{subProduct.nutritionalValues.fiber} g</span>
          </div>
          <div className="flex justify-between p-2 bg-muted/50 rounded">
            <span>Sód</span>
            <span className="font-medium">{subProduct.nutritionalValues.sodium} mg</span>
          </div>
        </div>
      </div>

      <Separator />

      <div className="space-y-2">
        <Button className="w-full gap-2" onClick={onAddVariant}>
          <Plus className="h-4 w-4" />
          Dodaj wariant
        </Button>
        <Button variant="outline" className="w-full gap-2" onClick={onEditSubProduct}>
          <Pencil className="h-4 w-4" />
          Edytuj subprodukt
        </Button>
        <Button variant="outline" className="w-full gap-2 text-orange-600 hover:text-orange-700">
          <Archive className="h-4 w-4" />
          {subProduct.status === "active" ? "Archiwizuj" : "Przywróć"}
        </Button>
      </div>
    </div>
  );
};

// Variant Management Panel Component
const VariantManagementPanel = ({
  variant,
  parentSubProduct,
  onEditVariant,
}: {
  variant: ProductVariant;
  parentSubProduct: SubProduct;
  onEditVariant: () => void;
}) => (
  <div className="p-4 space-y-4">
    <div>
      <Label className="text-xs text-muted-foreground">Wariant z: {parentSubProduct.name}</Label>
      <h3 className="text-lg font-semibold">{variant.name}</h3>
    </div>

    <div className="space-y-2">
      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
        <span className="text-sm">Zawartość</span>
        <span className="font-medium">
          {variant.content} {variant.unit}
        </span>
      </div>
      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
        <span className="text-sm">SKU</span>
        <code className="text-sm bg-background px-2 py-0.5 rounded">{variant.sku}</code>
      </div>
      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
        <span className="text-sm">EAN / GTIN</span>
        <code className="text-sm bg-background px-2 py-0.5 rounded">{variant.ean}</code>
      </div>
      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
        <span className="text-sm">Status</span>
        <Badge
          variant={variant.status === "active" ? "default" : "secondary"}
          className={variant.status === "active" ? "bg-green-600" : "bg-gray-400"}
        >
          {variant.status === "active" ? "Aktywny" : "Archiwum"}
        </Badge>
      </div>
    </div>

    <Separator />

    <div className="space-y-2">
      <Button variant="outline" className="w-full gap-2" onClick={onEditVariant}>
        <Pencil className="h-4 w-4" />
        Edytuj wariant
      </Button>
      <Button variant="outline" className="w-full gap-2 text-red-600 hover:text-red-700">
        <Trash2 className="h-4 w-4" />
        Usuń wariant
      </Button>
    </div>
  </div>
);

// OpenFoodFacts API response type
interface OpenFoodFactsProduct {
  product_name?: string;
  product_name_pl?: string;
  product_name_en?: string;
  image_front_small_url?: string;
  quantity?: string;
  categories?: string;
  brands?: string;
  nutriments?: {
    "energy-kcal_100g"?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sodium_100g?: number;
  };
}

// Add Variant Dialog Component with EAN scanning and OpenFoodFacts API
const AddVariantDialog = ({
  open,
  onOpenChange,
  parentSubProduct,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentSubProduct: SubProduct | null;
}) => {
  const eanInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const [ean, setEan] = useState("");
  const [variantName, setVariantName] = useState("");
  const [content, setContent] = useState("");
  const [unit, setUnit] = useState("g");
  const [sku, setSku] = useState("");
  const [calories, setCalories] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [brands, setBrands] = useState("");
  const [categories, setCategories] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [productFound, setProductFound] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState<any>(null);

  // Track which fields are missing after API fetch
  const getMissingFields = useCallback(() => {
    const missing: string[] = [];
    if (!ean) missing.push("ean");
    if (!variantName) missing.push("variantName");
    if (!content) missing.push("content");
    if (!unit) missing.push("unit");
    if (!sku) missing.push("sku");
    return missing;
  }, [ean, variantName, content, unit, sku]);

  const missingFields = dataFetched ? getMissingFields() : [];

  // Auto-focus EAN input when dialog opens
  useEffect(() => {
    if (open && eanInputRef.current) {
      setTimeout(() => {
        eanInputRef.current?.focus();
      }, 100);
    }
    // Reset form when dialog opens
    if (open) {
      setEan("");
      setVariantName("");
      setContent("");
      setUnit("g");
      setSku("");
      setCalories("");
      setImageUrl("");
      setBrands("");
      setCategories("");
      setProductFound(false);
      setDataFetched(false);
      setIsScannerOpen(false);
    }
  }, [open]);

  // Cleanup scanner when dialog closes
  useEffect(() => {
    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [html5QrCode]);

  // Generate SKU from product name and content
  const generateSku = useCallback((name: string, contentVal: string, unitVal: string) => {
    if (!name) return "";
    const cleanName = name
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^A-Z0-9]/g, "-")
      .replace(/-+/g, "-")
      .substring(0, 15);
    return `${cleanName}-${contentVal}${unitVal}`.toUpperCase();
  }, []);

  // Update SKU when name or content changes
  useEffect(() => {
    if (variantName && content) {
      setSku(generateSku(variantName, content, unit));
    }
  }, [variantName, content, unit, generateSku]);

  // Fetch product data from OpenFoodFacts API
  const fetchProductData = async (eanCode: string) => {
    if (!eanCode || eanCode.length < 8) {
      toast.error("Wprowadź prawidłowy kod EAN (min. 8 znaków)");
      return;
    }

    setIsLoading(true);
    setProductFound(false);
    setDataFetched(false);

    try {
      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${eanCode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product: OpenFoodFactsProduct = data.product;
        
        // Set product name (prefer Polish, then English, then generic)
        const productName = product.product_name_pl || product.product_name_en || product.product_name || "";
        setVariantName(productName);

        // Parse quantity
        if (product.quantity) {
          const quantityMatch = product.quantity.match(/(\d+(?:[.,]\d+)?)\s*(\w+)/);
          if (quantityMatch) {
            setContent(quantityMatch[1].replace(",", "."));
            const parsedUnit = quantityMatch[2].toLowerCase();
            if (["g", "kg", "ml", "l", "szt"].includes(parsedUnit)) {
              setUnit(parsedUnit);
            }
          }
        }

        // Set calories
        if (product.nutriments?.["energy-kcal_100g"]) {
          setCalories(product.nutriments["energy-kcal_100g"].toString());
        }

        // Set image
        if (product.image_front_small_url) {
          setImageUrl(product.image_front_small_url);
        }

        // Set brands
        if (product.brands) {
          setBrands(product.brands);
        }

        // Set categories
        if (product.categories) {
          setCategories(product.categories);
        }

        setProductFound(true);
        setDataFetched(true);
        toast.success("Dane produktu pobrane z OpenFoodFacts!");
      } else {
        toast.error("Produkt nie został znaleziony w bazie OpenFoodFacts");
        setProductFound(false);
        setDataFetched(true);
      }
    } catch (error) {
      console.error("Error fetching product data:", error);
      toast.error("Błąd podczas pobierania danych produktu");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle EAN input - fetch on Enter or when 13 chars
  const handleEanChange = (value: string) => {
    // Only allow numbers
    const numericValue = value.replace(/\D/g, "");
    setEan(numericValue);

    // Auto-fetch when EAN is complete (typically 13 digits for EAN-13)
    if (numericValue.length === 13) {
      fetchProductData(numericValue);
    }
  };

  const handleEanKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && ean.length >= 8) {
      e.preventDefault();
      fetchProductData(ean);
    }
  };

  // Camera scanner toggle using html5-qrcode
  const toggleScanner = async () => {
    if (isScannerOpen) {
      // Stop scanner
      if (html5QrCode) {
        try {
          await html5QrCode.stop();
        } catch (err) {
          console.error("Error stopping scanner:", err);
        }
      }
      setIsScannerOpen(false);
    } else {
      setIsScannerOpen(true);
      
      // Dynamically import html5-qrcode
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        
        setTimeout(async () => {
          if (!scannerRef.current) return;
          
          const scannerId = "ean-scanner-" + Date.now();
          scannerRef.current.id = scannerId;
          
          const scanner = new Html5Qrcode(scannerId);
          setHtml5QrCode(scanner);
          
          try {
            await scanner.start(
              { facingMode: "environment" },
              {
                fps: 10,
                qrbox: { width: 250, height: 100 },
              },
              (decodedText) => {
                // Successfully scanned
                const numericValue = decodedText.replace(/\D/g, "");
                setEan(numericValue);
                setIsScannerOpen(false);
                scanner.stop().catch(() => {});
                toast.success("Kod zeskanowany!");
                
                // Auto-fetch if valid EAN
                if (numericValue.length >= 8) {
                  setTimeout(() => fetchProductData(numericValue), 100);
                }
              },
              () => {
                // Ignore scan errors (continuous scanning)
              }
            );
          } catch (err) {
            console.error("Error starting scanner:", err);
            toast.error("Nie można uruchomić kamery. Sprawdź uprawnienia.");
            setIsScannerOpen(false);
          }
        }, 100);
      } catch (err) {
        console.error("Error loading scanner library:", err);
        toast.error("Błąd ładowania biblioteki skanera");
        setIsScannerOpen(false);
      }
    }
  };

  const handleSave = () => {
    const missing = getMissingFields();
    if (missing.length > 0) {
      const fieldNames: Record<string, string> = {
        ean: "Kod EAN",
        variantName: "Nazwa wariantu",
        content: "Zawartość",
        unit: "Jednostka",
        sku: "SKU",
      };
      toast.error(`Uzupełnij wymagane pola: ${missing.map(f => fieldNames[f]).join(", ")}`);
      setDataFetched(true); // Show highlighting
      return;
    }
    // Here you would save the variant
    toast.success("Wariant został dodany!");
    onOpenChange(false);
  };

  // Helper for required field label
  const RequiredLabel = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <Label htmlFor={htmlFor} className="flex items-center gap-1">
      {children}
      <span className="text-red-500">*</span>
    </Label>
  );

  // Helper for field highlighting
  const getFieldClass = (fieldName: string) => {
    if (dataFetched && missingFields.includes(fieldName)) {
      return "border-red-500 ring-1 ring-red-500";
    }
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value && html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
      onOpenChange(value);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj wariant</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Pola oznaczone <span className="text-red-500">*</span> są wymagane
          </p>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* EAN Input Section */}
          <div className="space-y-2">
            <RequiredLabel>
              <Barcode className="h-4 w-4" />
              Kod EAN / GTIN
            </RequiredLabel>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  ref={eanInputRef}
                  placeholder="Zeskanuj lub wpisz kod EAN..."
                  value={ean}
                  onChange={(e) => handleEanChange(e.target.value)}
                  onKeyDown={handleEanKeyDown}
                  className={`pr-10 font-mono text-lg ${getFieldClass("ean")}`}
                  autoFocus
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant={isScannerOpen ? "default" : "outline"}
                size="icon"
                onClick={toggleScanner}
                title="Skanuj kamerą telefonu"
              >
                <Camera className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => fetchProductData(ean)}
                disabled={isLoading || ean.length < 8}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Pobierz dane
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Użyj zewnętrznego skanera kodów kreskowych lub kliknij ikonę kamery aby skanować telefonem
            </p>
          </div>

          {/* Camera Scanner */}
          {isScannerOpen && (
            <div className="relative rounded-lg overflow-hidden bg-black">
              <div 
                ref={scannerRef}
                className="w-full aspect-video"
              />
              <Button 
                variant="secondary" 
                size="sm" 
                className="absolute top-2 right-2 gap-1"
                onClick={() => {
                  if (html5QrCode) {
                    html5QrCode.stop().catch(() => {});
                  }
                  setIsScannerOpen(false);
                }}
              >
                <X className="h-4 w-4" />
                Zamknij
              </Button>
            </div>
          )}

          <Separator />

          {/* Product Info Preview */}
          {productFound && imageUrl && (
            <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
              <img 
                src={imageUrl} 
                alt={variantName} 
                className="w-20 h-20 object-contain rounded bg-white p-1"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="flex-1">
                <p className="font-medium">{variantName || "Nazwa produktu"}</p>
                <p className="text-sm text-muted-foreground">
                  {content} {unit} • {calories ? `${calories} kcal/100g` : "Brak danych o kaloriach"}
                </p>
                {brands && (
                  <p className="text-xs text-muted-foreground mt-1">Marka: {brands}</p>
                )}
                <Badge variant="outline" className="mt-2 text-green-600 border-green-300">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  OpenFoodFacts
                </Badge>
              </div>
            </div>
          )}

          {/* Missing fields warning */}
          {dataFetched && missingFields.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Niektóre wymagane pola nie zostały uzupełnione</p>
                <p className="text-xs mt-1">Uzupełnij podświetlone pola przed zapisaniem.</p>
              </div>
            </div>
          )}

          {/* Form Fields */}
          <div className="space-y-2">
            <RequiredLabel>Nazwa wariantu</RequiredLabel>
            <Input
              placeholder="np. Nutella 400g"
              value={variantName}
              onChange={(e) => setVariantName(e.target.value)}
              className={getFieldClass("variantName")}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <RequiredLabel>Zawartość</RequiredLabel>
              <Input
                type="number"
                placeholder="500"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={getFieldClass("content")}
              />
            </div>
            <div className="space-y-2">
              <RequiredLabel>Jednostka</RequiredLabel>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className={getFieldClass("unit")}>
                  <SelectValue placeholder="Wybierz" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="g">g</SelectItem>
                  <SelectItem value="kg">kg</SelectItem>
                  <SelectItem value="ml">ml</SelectItem>
                  <SelectItem value="l">l</SelectItem>
                  <SelectItem value="szt">szt</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Kalorie (kcal/100g)</Label>
            <Input
              type="number"
              placeholder="0"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Marka (opcjonalne)</Label>
            <Input
              placeholder="np. Ferrero"
              value={brands}
              onChange={(e) => setBrands(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <RequiredLabel>SKU (generowany automatycznie)</RequiredLabel>
            <Input
              placeholder="SKU zostanie wygenerowany"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className={`font-mono ${getFieldClass("sku")}`}
            />
          </div>
        </div>

        {/* Categories footer (informational) */}
        {categories && (
          <div className="pt-2 pb-4 border-t">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Kategorie:</span> {categories}
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Zapisz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductsConfig;
