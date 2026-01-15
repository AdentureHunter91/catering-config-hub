import { useState, useRef, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  RefreshCw,
  Copy,
  Info,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// API imports
import { fetchCategories, fetchSubcategories, ProductCategory, ProductSubcategory } from "@/api/productCategories";
import { getProducts, createProduct, updateProduct, archiveProduct, Product as ApiProduct } from "@/api/products";
import { getProductVariants, createProductVariant, updateProductVariant, archiveProductVariant, checkEan, ProductVariant as ApiVariant, EanCheckResult } from "@/api/productVariants";
import { getNutritionDatabaseEntries, getNutritionDatabaseEntry, NutritionDatabaseEntry } from "@/api/nutritionDatabase";
import { NutritionDbCombobox } from "@/components/NutritionDbCombobox";

// Allergen type with icon
interface AllergenItem {
  id: string;
  name: string;
  icon: React.ReactNode;
}

// All available allergens
const allergensList: AllergenItem[] = [
  { id: "gluten", name: "Gluten", icon: <Wheat className="h-4 w-4" /> },
  { id: "lactose", name: "Laktoza", icon: <Milk className="h-4 w-4" /> },
  { id: "eggs", name: "Jaja", icon: <Egg className="h-4 w-4" /> },
  { id: "fish", name: "Ryby", icon: <Fish className="h-4 w-4" /> },
  { id: "nuts", name: "Orzechy", icon: <Nut className="h-4 w-4" /> },
  { id: "soy", name: "Soja", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "celery", name: "Seler", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "mustard", name: "Gorczyca", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "sesame", name: "Sezam", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "sulphites", name: "Siarczyny", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "lupin", name: "Łubin", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "molluscs", name: "Mięczaki", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "crustaceans", name: "Skorupiaki", icon: <AlertTriangle className="h-4 w-4" /> },
  { id: "peanuts", name: "Orzeszki ziemne", icon: <Nut className="h-4 w-4" /> },
];

// Frontend types for hierarchical display
interface DisplaySubProduct {
  id: number;
  product_id: number | null;
  ean: string;
  name: string;
  content: string;
  unit: string;
  sku: string;
  status: "active" | "archived";
  brands: string;
  categories: string;
  image_url: string;
}

interface DisplayProduct {
  id: number;
  subcategory_id: number;
  name: string;
  description: string;
  status: "active" | "archived";
  nutrition_database_id: number | null;
  energy_kj: number | null;
  energy_kcal: number | null;
  energy_kj_1169: number | null;
  energy_kcal_1169: number | null;
  water: number | null;
  protein_animal: number | null;
  protein_plant: number | null;
  fat: number | null;
  saturated_fat: number | null;
  carbohydrates: number | null;
  sugars: number | null;
  fiber: number | null;
  sodium: number | null;
  salt: number | null;
  potassium: number | null;
  calcium: number | null;
  phosphorus: number | null;
  magnesium: number | null;
  iron: number | null;
  zinc: number | null;
  vitamin_a: number | null;
  vitamin_d: number | null;
  vitamin_e: number | null;
  vitamin_c: number | null;
  vitamin_b1: number | null;
  vitamin_b2: number | null;
  vitamin_b6: number | null;
  vitamin_b12: number | null;
  folate: number | null;
  niacin: number | null;
  cholesterol: number | null;
  allergens: string[];
  subProducts: DisplaySubProduct[];
}

interface DisplaySubcategory {
  id: number;
  category_id: number;
  name: string;
  products: DisplayProduct[];
}

interface DisplayCategory {
  id: number;
  name: string;
  subcategories: DisplaySubcategory[];
}

// Nutrition database entry type for UI
interface NutritionDbItem {
  id: number;
  name: string;
}

// Expanded state types
type ExpandedState = {
  categories: Set<number>;
  subcategories: Set<number>;
  products: Set<number>;
};

// Default empty nutritional product data
const emptyNutritionData = {
  nutrition_database_id: null,
  energy_kj: null,
  energy_kcal: null,
  energy_kj_1169: null,
  energy_kcal_1169: null,
  water: null,
  protein_animal: null,
  protein_plant: null,
  fat: null,
  saturated_fat: null,
  carbohydrates: null,
  sugars: null,
  fiber: null,
  sodium: null,
  salt: null,
  potassium: null,
  calcium: null,
  phosphorus: null,
  magnesium: null,
  iron: null,
  zinc: null,
  vitamin_a: null,
  vitamin_d: null,
  vitamin_e: null,
  vitamin_c: null,
  vitamin_b1: null,
  vitamin_b2: null,
  vitamin_b6: null,
  vitamin_b12: null,
  folate: null,
  niacin: null,
  cholesterol: null,
  allergens: [] as string[],
};

const ProductsConfig = () => {
  const [search, setSearch] = useState("");
  const [categories, setCategories] = useState<DisplayCategory[]>([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<ExpandedState>({
    categories: new Set(),
    subcategories: new Set(),
    products: new Set(),
  });

  // Selected item for management panel
  const [selectedItem, setSelectedItem] = useState<{
    type: "product" | "subProduct" | null;
    data: DisplayProduct | DisplaySubProduct | null;
    parentProduct?: DisplayProduct;
  }>({ type: null, data: null });

  // Dialogs
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [addSubProductDialogOpen, setAddSubProductDialogOpen] = useState(false);
  const [editSubProductDialogOpen, setEditSubProductDialogOpen] = useState(false);
  
  // Nutrition database entries
  const [nutritionDatabase, setNutritionDatabase] = useState<NutritionDbItem[]>([]);

  // Load nutrition database (all entries for combobox search)
  useEffect(() => {
    const loadNutritionDb = async () => {
      try {
        const entries = await getNutritionDatabaseEntries("", 2000);
        setNutritionDatabase(entries.map(e => ({ id: e.id, name: e.name_pl })));
      } catch (error) {
        console.log("Nutrition database not available yet");
        setNutritionDatabase([]);
      }
    };
    loadNutritionDb();
  }, []);
  const loadData = useCallback(async (preserveExpansion = false) => {
    setIsLoading(true);
    const prevExpanded = preserveExpansion ? { 
      categories: new Set(expanded.categories), 
      subcategories: new Set(expanded.subcategories), 
      products: new Set(expanded.products) 
    } : null;
    
    try {
      const dbCategories = await fetchCategories("all");
      const dbSubcategories = await fetchSubcategories();
      const dbProducts = await getProducts();
      const dbSubProducts = await getProductVariants();

      // Build hierarchical structure
      const displayCategories: DisplayCategory[] = dbCategories.map(cat => ({
        id: cat.id,
        name: cat.name,
        subcategories: dbSubcategories
          .filter(sub => sub.category_id === cat.id)
          .map(sub => ({
            id: sub.id,
            category_id: sub.category_id,
            name: sub.name,
            products: dbProducts
              .filter(prod => prod.subcategory_id === sub.id)
              .map(prod => ({
                id: prod.id,
                subcategory_id: prod.subcategory_id,
                name: prod.name,
                description: prod.description,
                status: prod.status,
                nutrition_database_id: prod.nutrition_database_id,
                energy_kj: prod.energy_kj,
                energy_kcal: prod.energy_kcal,
                energy_kj_1169: prod.energy_kj_1169,
                energy_kcal_1169: prod.energy_kcal_1169,
                water: prod.water,
                protein_animal: prod.protein_animal,
                protein_plant: prod.protein_plant,
                fat: prod.fat,
                saturated_fat: prod.saturated_fat,
                carbohydrates: prod.carbohydrates,
                sugars: prod.sugars,
                fiber: prod.fiber,
                sodium: prod.sodium,
                salt: prod.salt,
                potassium: prod.potassium,
                calcium: prod.calcium,
                phosphorus: prod.phosphorus,
                magnesium: prod.magnesium,
                iron: prod.iron,
                zinc: prod.zinc,
                vitamin_a: prod.vitamin_a,
                vitamin_d: prod.vitamin_d,
                vitamin_e: prod.vitamin_e,
                vitamin_c: prod.vitamin_c,
                vitamin_b1: prod.vitamin_b1,
                vitamin_b2: prod.vitamin_b2,
                vitamin_b6: prod.vitamin_b6,
                vitamin_b12: prod.vitamin_b12,
                folate: prod.folate,
                niacin: prod.niacin,
                cholesterol: prod.cholesterol,
                allergens: prod.allergens || [],
                subProducts: dbSubProducts
                  .filter(sp => sp.product_id === prod.id)
                  .map(sp => ({
                    id: sp.id,
                    product_id: sp.product_id,
                    ean: sp.ean,
                    name: sp.name,
                    content: sp.content,
                    unit: sp.unit,
                    sku: sp.sku,
                    status: sp.status,
                    brands: sp.brands,
                    categories: sp.categories,
                    image_url: sp.image_url,
                  })),
              })),
          })),
      }));

      setCategories(displayCategories);
      
      if (prevExpanded) {
        setExpanded(prevExpanded);
      } else if (displayCategories.length > 0 && expanded.categories.size === 0) {
        setExpanded(prev => ({
          ...prev,
          categories: new Set([displayCategories[0].id])
        }));
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast.error("Błąd podczas ładowania danych");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Toggle functions
  const toggleCategory = (id: number) => {
    setExpanded((prev) => {
      const newCategories = new Set(prev.categories);
      if (newCategories.has(id)) newCategories.delete(id);
      else newCategories.add(id);
      return { ...prev, categories: newCategories };
    });
  };

  const toggleSubcategory = (id: number) => {
    setExpanded((prev) => {
      const newSubcategories = new Set(prev.subcategories);
      if (newSubcategories.has(id)) newSubcategories.delete(id);
      else newSubcategories.add(id);
      return { ...prev, subcategories: newSubcategories };
    });
  };

  const toggleProduct = (id: number) => {
    setExpanded((prev) => {
      const newProducts = new Set(prev.products);
      if (newProducts.has(id)) newProducts.delete(id);
      else newProducts.add(id);
      return { ...prev, products: newProducts };
    });
  };

  // Filter logic
  const filterCategories = (cats: DisplayCategory[]): DisplayCategory[] => {
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
                      sp.ean.includes(s) ||
                      sp.sku.toLowerCase().includes(s)
                  )
                );
              }),
          }))
          .filter((sub) => sub.products.length > 0 || !search.trim()),
      }))
      .filter((cat) => cat.subcategories.length > 0 || !search.trim());
  };

  const filteredCategories = filterCategories(categories);

  // Count totals
  const totalProducts = categories.reduce(
    (acc, cat) => acc + cat.subcategories.reduce((a, sub) => a + sub.products.filter(p => p.status === "active").length, 0),
    0
  );
  const totalSubProducts = categories.reduce(
    (acc, cat) => acc + cat.subcategories.reduce(
      (a, sub) => a + sub.products.reduce((b, prod) => b + prod.subProducts.filter(sp => sp.status === "active").length, 0),
      0
    ),
    0
  );
  const archivedCount = categories.reduce(
    (acc, cat) => acc + cat.subcategories.reduce(
      (a, sub) => a + sub.products.filter(p => p.status === "archived").length +
        sub.products.reduce((b, prod) => b + prod.subProducts.filter(sp => sp.status === "archived").length, 0),
      0
    ),
    0
  );
  const unlinkedCount = categories.reduce(
    (acc, cat) => acc + cat.subcategories.reduce(
      (a, sub) => a + sub.products.filter(p => !p.nutrition_database_id && p.status === "active").length,
      0
    ),
    0
  );

  // Get subcategories for selected category
  const getSubcategoriesForCategory = (categoryId: string) => {
    const cat = categories.find(c => c.id === parseInt(categoryId));
    return cat?.subcategories || [];
  };

  // Handle archive/restore product with cascade
  const handleArchiveProduct = async (product: DisplayProduct) => {
    try {
      const isArchiving = product.status === "active";
      await archiveProduct(product.id, !isArchiving);
      toast.success(isArchiving 
        ? `Produkt i ${product.subProducts.length} subproduktów zostało zarchiwizowanych` 
        : "Produkt i subprodukty zostały przywrócone"
      );
      setSelectedItem({ type: null, data: null });
      loadData(true);
    } catch (error: any) {
      toast.error("Błąd: " + error.message);
    }
  };

  // Handle archive/restore subproduct
  const handleArchiveSubProduct = async (subProductId: number, restore: boolean = false) => {
    try {
      await archiveProductVariant(subProductId, restore);
      toast.success(restore ? "Subprodukt został przywrócony" : "Subprodukt został zarchiwizowany");
      setSelectedItem({ type: null, data: null });
      loadData(true);
    } catch (error: any) {
      toast.error("Błąd: " + error.message);
    }
  };

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
            Zarządzaj hierarchią produktów: Kategoria → Subkategoria → Produkt → Subprodukt
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => loadData(false)} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Odśwież
          </Button>
          <Button className="gap-2" onClick={() => setAddProductDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Dodaj produkt
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 mb-6 grid-cols-2 lg:grid-cols-4">
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
              <Barcode className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold">{totalSubProducts}</p>
              <p className="text-sm text-muted-foreground">Subprodukty</p>
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
                {isLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">Ładowanie danych...</span>
                  </div>
                ) : filteredCategories.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {categories.length === 0 
                      ? "Brak kategorii. Dodaj kategorie w widoku Kategorie Produktów."
                      : "Brak wyników dla zastosowanych filtrów"
                    }
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
                            {category.subcategories.length} subkat.
                          </Badge>
                        </div>

                        {/* Subcategories */}
                        {expanded.categories.has(category.id) && (
                          <div className="ml-6 space-y-1">
                            {category.subcategories.map((subcategory) => (
                              <div key={subcategory.id}>
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
                                        <div
                                          className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer ${
                                            selectedItem.type === "product" &&
                                            (selectedItem.data as DisplayProduct)?.id === product.id
                                              ? "bg-primary/10 border border-primary"
                                              : ""
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedItem({ type: "product", data: product });
                                          }}
                                        >
                                          {product.subProducts.length > 0 ? (
                                            <button onClick={(e) => { e.stopPropagation(); toggleProduct(product.id); }}>
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
                                          {product.nutrition_database_id ? (
                                            <Link2 className="h-3 w-3 text-green-600" />
                                          ) : (
                                            <Link2Off className="h-3 w-3 text-red-500" />
                                          )}
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
                                              <div
                                                key={subProduct.id}
                                                className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 cursor-pointer ${
                                                  selectedItem.type === "subProduct" &&
                                                  (selectedItem.data as DisplaySubProduct)?.id === subProduct.id
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
                                                <div className="w-4" />
                                                <Barcode className="h-4 w-4 text-orange-500" />
                                                <span className="text-sm">{subProduct.name}</span>
                                                <Badge
                                                  variant={subProduct.status === "active" ? "default" : "secondary"}
                                                  className={`ml-auto text-xs ${subProduct.status === "active" ? "bg-green-600" : "bg-gray-400"}`}
                                                >
                                                  {subProduct.status === "active" ? "Aktywny" : "Archiwum"}
                                                </Badge>
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
                product={selectedItem.data as DisplayProduct}
                allergensList={allergensList}
        nutritionDatabase={nutritionDatabase}
                onAddSubProduct={() => setAddSubProductDialogOpen(true)}
                onEditProduct={() => setEditProductDialogOpen(true)}
                onArchive={() => handleArchiveProduct(selectedItem.data as DisplayProduct)}
              />
            ) : selectedItem.type === "subProduct" ? (
              <SubProductManagementPanel
                subProduct={selectedItem.data as DisplaySubProduct}
                parentProduct={selectedItem.parentProduct!}
                onEditSubProduct={() => setEditSubProductDialogOpen(true)}
                onArchive={() => {
                  const sp = selectedItem.data as DisplaySubProduct;
                  handleArchiveSubProduct(sp.id, sp.status === "archived");
                }}
              />
            ) : null}
          </Card>
        </div>
      </div>

      {/* Add Product Dialog */}
      <AddProductDialog
        open={addProductDialogOpen}
        onOpenChange={setAddProductDialogOpen}
        categories={categories}
        allergensList={allergensList}
        nutritionDatabase={nutritionDatabase}
        onSave={() => loadData(true)}
      />

      {/* Edit Product Dialog */}
      <EditProductDialog
        open={editProductDialogOpen}
        onOpenChange={setEditProductDialogOpen}
        product={selectedItem.type === "product" ? selectedItem.data as DisplayProduct : null}
        allergensList={allergensList}
        nutritionDatabase={nutritionDatabase}
        onSave={() => {
          loadData(true);
          setSelectedItem({ type: null, data: null });
        }}
      />

      {/* Add SubProduct Dialog */}
      <AddSubProductDialog 
        open={addSubProductDialogOpen} 
        onOpenChange={setAddSubProductDialogOpen}
        parentProduct={selectedItem.type === "product" ? selectedItem.data as DisplayProduct : null}
        onSave={() => loadData(true)}
      />

      {/* Edit SubProduct Dialog */}
      <EditSubProductDialog
        open={editSubProductDialogOpen}
        onOpenChange={setEditSubProductDialogOpen}
        subProduct={selectedItem.type === "subProduct" ? selectedItem.data as DisplaySubProduct : null}
        categories={categories}
        onSave={() => loadData(true)}
      />
    </Layout>
  );
};

// Nutritional Input Component
const NutritionInput = ({ 
  label, 
  unit, 
  value, 
  onChange 
}: { 
  label: string; 
  unit: string; 
  value: string; 
  onChange: (v: string) => void;
}) => (
  <div className="space-y-1">
    <Label className="text-xs text-muted-foreground">{label}</Label>
    <div className="flex items-center gap-1">
      <Input 
        type="number" 
        step="0.01"
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="h-8 text-sm"
      />
      <span className="text-xs text-muted-foreground w-10">{unit}</span>
    </div>
  </div>
);

// Add Product Dialog
const AddProductDialog = ({
  open,
  onOpenChange,
  categories,
  allergensList,
  nutritionDatabase,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categories: DisplayCategory[];
  allergensList: AllergenItem[];
  nutritionDatabase: { id: number; name: string }[];
  onSave: () => void;
}) => {
  const [categoryId, setCategoryId] = useState<string>("");
  const [subcategoryId, setSubcategoryId] = useState<string>("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [nutritionDbId, setNutritionDbId] = useState<string>("none"); // Just for UI selection
  const [linkedNutritionDbId, setLinkedNutritionDbId] = useState<string>("none"); // Actually linked ID
  const [isSaving, setIsSaving] = useState(false);

  // Nutritional values state
  const [nutrition, setNutrition] = useState({
    energy_kj: "", energy_kcal: "", energy_kj_1169: "", energy_kcal_1169: "",
    water: "", protein_animal: "", protein_plant: "", fat: "", saturated_fat: "",
    carbohydrates: "", sugars: "", fiber: "", sodium: "", salt: "", potassium: "",
    calcium: "", phosphorus: "", magnesium: "", iron: "", zinc: "",
    vitamin_a: "", vitamin_d: "", vitamin_e: "", vitamin_c: "",
    vitamin_b1: "", vitamin_b2: "", vitamin_b6: "", vitamin_b12: "",
    folate: "", niacin: "", cholesterol: "",
  });

  const getSubcategoriesForCategory = (catId: string) => {
    const cat = categories.find(c => c.id === parseInt(catId));
    return cat?.subcategories || [];
  };

  useEffect(() => {
    if (open) {
      setCategoryId("");
      setSubcategoryId("");
      setName("");
      setDescription("");
      setSelectedAllergens([]);
      setNutritionDbId("none");
      setLinkedNutritionDbId("none");
      setNutrition({
        energy_kj: "", energy_kcal: "", energy_kj_1169: "", energy_kcal_1169: "",
        water: "", protein_animal: "", protein_plant: "", fat: "", saturated_fat: "",
        carbohydrates: "", sugars: "", fiber: "", sodium: "", salt: "", potassium: "",
        calcium: "", phosphorus: "", magnesium: "", iron: "", zinc: "",
        vitamin_a: "", vitamin_d: "", vitamin_e: "", vitamin_c: "",
        vitamin_b1: "", vitamin_b2: "", vitamin_b6: "", vitamin_b12: "",
        folate: "", niacin: "", cholesterol: "",
      });
    }
  }, [open]);

  const toggleAllergen = (id: string) => {
    setSelectedAllergens(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!subcategoryId || !name.trim()) {
      toast.error("Wypełnij wymagane pola (kategoria, subkategoria, nazwa)");
      return;
    }

    setIsSaving(true);
    try {
      const parseNum = (v: string) => v === "" ? null : parseFloat(v);
      
      await createProduct({
        subcategory_id: parseInt(subcategoryId),
        name: name.trim(),
        description: description.trim(),
        status: "active",
        nutrition_database_id: nutritionDbId !== "none" ? parseInt(nutritionDbId) : null,
        energy_kj: parseNum(nutrition.energy_kj),
        energy_kcal: parseNum(nutrition.energy_kcal),
        energy_kj_1169: parseNum(nutrition.energy_kj_1169),
        energy_kcal_1169: parseNum(nutrition.energy_kcal_1169),
        water: parseNum(nutrition.water),
        protein_animal: parseNum(nutrition.protein_animal),
        protein_plant: parseNum(nutrition.protein_plant),
        fat: parseNum(nutrition.fat),
        saturated_fat: parseNum(nutrition.saturated_fat),
        carbohydrates: parseNum(nutrition.carbohydrates),
        sugars: parseNum(nutrition.sugars),
        fiber: parseNum(nutrition.fiber),
        sodium: parseNum(nutrition.sodium),
        salt: parseNum(nutrition.salt),
        potassium: parseNum(nutrition.potassium),
        calcium: parseNum(nutrition.calcium),
        phosphorus: parseNum(nutrition.phosphorus),
        magnesium: parseNum(nutrition.magnesium),
        iron: parseNum(nutrition.iron),
        zinc: parseNum(nutrition.zinc),
        vitamin_a: parseNum(nutrition.vitamin_a),
        vitamin_d: parseNum(nutrition.vitamin_d),
        vitamin_e: parseNum(nutrition.vitamin_e),
        vitamin_c: parseNum(nutrition.vitamin_c),
        vitamin_b1: parseNum(nutrition.vitamin_b1),
        vitamin_b2: parseNum(nutrition.vitamin_b2),
        vitamin_b6: parseNum(nutrition.vitamin_b6),
        vitamin_b12: parseNum(nutrition.vitamin_b12),
        folate: parseNum(nutrition.folate),
        niacin: parseNum(nutrition.niacin),
        cholesterol: parseNum(nutrition.cholesterol),
        allergens: selectedAllergens,
      });
      toast.success("Produkt został dodany");
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Błąd: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateNutrition = (field: string, value: string) => {
    setNutrition(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Dodaj nowy produkt
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Podstawowe</TabsTrigger>
            <TabsTrigger value="allergens">Alergeny</TabsTrigger>
            <TabsTrigger value="nutrition">Wartości odżywcze</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategoria *</Label>
                <Select value={categoryId} onValueChange={(v) => { setCategoryId(v); setSubcategoryId(""); }}>
                  <SelectTrigger><SelectValue placeholder="Wybierz kategorię" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Subkategoria *</Label>
                <Select value={subcategoryId} onValueChange={setSubcategoryId} disabled={!categoryId}>
                  <SelectTrigger><SelectValue placeholder="Wybierz subkategorię" /></SelectTrigger>
                  <SelectContent>
                    {getSubcategoriesForCategory(categoryId).map((sub) => (
                      <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nazwa produktu *</Label>
              <Input placeholder="np. Ser żółty Gouda" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea placeholder="Opis produktu..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            
            <Separator className="my-4" />
            
            {/* Powiązanie z bazą IŻŻ */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-600" />
                <Label className="font-medium">Powiązanie z bazą IŻŻ</Label>
              </div>
              <div className="flex gap-3">
                <NutritionDbCombobox
                  items={nutritionDatabase}
                  value={nutritionDbId}
                  onValueChange={setNutritionDbId}
                  className="flex-1"
                />
                {nutritionDbId !== "none" && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="gap-2 text-green-600 border-green-300 hover:bg-green-50"
                    onClick={async () => {
                      try {
                        const entry = await getNutritionDatabaseEntry(parseInt(nutritionDbId));
                        setNutrition({
                          energy_kj: entry.energy_kj?.toString() ?? "",
                          energy_kcal: entry.energy_kcal?.toString() ?? "",
                          energy_kj_1169: entry.energy_kj_1169?.toString() ?? "",
                          energy_kcal_1169: entry.energy_kcal_1169?.toString() ?? "",
                          water: entry.water?.toString() ?? "",
                          protein_animal: entry.protein_animal?.toString() ?? "",
                          protein_plant: entry.protein_plant?.toString() ?? "",
                          fat: entry.fat?.toString() ?? "",
                          saturated_fat: entry.saturated_fat?.toString() ?? "",
                          carbohydrates: entry.carbohydrates_available?.toString() ?? "",
                          sugars: entry.sugars?.toString() ?? "",
                          fiber: entry.fiber?.toString() ?? "",
                          sodium: entry.sodium?.toString() ?? "",
                          salt: entry.salt?.toString() ?? "",
                          potassium: entry.potassium?.toString() ?? "",
                          calcium: entry.calcium?.toString() ?? "",
                          phosphorus: entry.phosphorus?.toString() ?? "",
                          magnesium: entry.magnesium?.toString() ?? "",
                          iron: entry.iron?.toString() ?? "",
                          zinc: entry.zinc?.toString() ?? "",
                          vitamin_a: entry.vitamin_a?.toString() ?? "",
                          vitamin_d: entry.vitamin_d?.toString() ?? "",
                          vitamin_e: entry.vitamin_e?.toString() ?? "",
                          vitamin_c: entry.vitamin_c?.toString() ?? "",
                          vitamin_b1: entry.vitamin_b1?.toString() ?? "",
                          vitamin_b2: entry.vitamin_b2?.toString() ?? "",
                          vitamin_b6: entry.vitamin_b6?.toString() ?? "",
                          vitamin_b12: entry.vitamin_b12?.toString() ?? "",
                          folate: entry.folate?.toString() ?? "",
                          niacin: entry.niacin?.toString() ?? "",
                          cholesterol: entry.cholesterol?.toString() ?? "",
                        });
                        toast.success("Dane zostały skopiowane z bazy IŻŻ");
                      } catch (error) {
                        toast.error("Nie udało się pobrać danych z bazy IŻŻ");
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    Powiąż dane
                  </Button>
                )}
              </div>
              {nutritionDbId !== "none" && (
                <p className="text-xs text-muted-foreground">
                  Po kliknięciu "Powiąż dane" wartości odżywcze zostaną skopiowane z bazy IŻŻ
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="allergens" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg text-sm text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              <span>Zaznacz wszystkie alergeny występujące w produkcie</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allergensList.map((allergen) => (
                <div
                  key={allergen.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAllergens.includes(allergen.id) 
                      ? 'bg-orange-100 border-orange-400' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleAllergen(allergen.id)}
                >
                  <Checkbox 
                    checked={selectedAllergens.includes(allergen.id)} 
                    onCheckedChange={() => toggleAllergen(allergen.id)}
                  />
                  <div className="flex items-center gap-2">
                    {allergen.icon}
                    <span className="text-sm">{allergen.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <Info className="h-4 w-4" />
              <span>Wartości odżywcze na 100g produktu. Możesz też skopiować dane z bazy IŻŻ w zakładce "Baza IŻŻ".</span>
            </div>
            
            {/* Energy */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Energia</h4>
              <div className="grid grid-cols-4 gap-3">
                <NutritionInput label="Energia" unit="kJ" value={nutrition.energy_kj} onChange={(v) => updateNutrition("energy_kj", v)} />
                <NutritionInput label="Energia" unit="kcal" value={nutrition.energy_kcal} onChange={(v) => updateNutrition("energy_kcal", v)} />
                <NutritionInput label="Energia (1169)" unit="kJ" value={nutrition.energy_kj_1169} onChange={(v) => updateNutrition("energy_kj_1169", v)} />
                <NutritionInput label="Energia (1169)" unit="kcal" value={nutrition.energy_kcal_1169} onChange={(v) => updateNutrition("energy_kcal_1169", v)} />
              </div>
            </div>

            {/* Macronutrients */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Makroskładniki</h4>
              <div className="grid grid-cols-4 gap-3">
                <NutritionInput label="Woda" unit="g" value={nutrition.water} onChange={(v) => updateNutrition("water", v)} />
                <NutritionInput label="Białko zwierzęce" unit="g" value={nutrition.protein_animal} onChange={(v) => updateNutrition("protein_animal", v)} />
                <NutritionInput label="Białko roślinne" unit="g" value={nutrition.protein_plant} onChange={(v) => updateNutrition("protein_plant", v)} />
                <NutritionInput label="Tłuszcz" unit="g" value={nutrition.fat} onChange={(v) => updateNutrition("fat", v)} />
                <NutritionInput label="Tł. nasycony" unit="g" value={nutrition.saturated_fat} onChange={(v) => updateNutrition("saturated_fat", v)} />
                <NutritionInput label="Węglowodany" unit="g" value={nutrition.carbohydrates} onChange={(v) => updateNutrition("carbohydrates", v)} />
                <NutritionInput label="Cukry" unit="g" value={nutrition.sugars} onChange={(v) => updateNutrition("sugars", v)} />
                <NutritionInput label="Błonnik" unit="g" value={nutrition.fiber} onChange={(v) => updateNutrition("fiber", v)} />
              </div>
            </div>

            {/* Minerals */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Minerały</h4>
              <div className="grid grid-cols-4 gap-3">
                <NutritionInput label="Sód" unit="mg" value={nutrition.sodium} onChange={(v) => updateNutrition("sodium", v)} />
                <NutritionInput label="Sól" unit="g" value={nutrition.salt} onChange={(v) => updateNutrition("salt", v)} />
                <NutritionInput label="Potas" unit="mg" value={nutrition.potassium} onChange={(v) => updateNutrition("potassium", v)} />
                <NutritionInput label="Wapń" unit="mg" value={nutrition.calcium} onChange={(v) => updateNutrition("calcium", v)} />
                <NutritionInput label="Fosfor" unit="mg" value={nutrition.phosphorus} onChange={(v) => updateNutrition("phosphorus", v)} />
                <NutritionInput label="Magnez" unit="mg" value={nutrition.magnesium} onChange={(v) => updateNutrition("magnesium", v)} />
                <NutritionInput label="Żelazo" unit="mg" value={nutrition.iron} onChange={(v) => updateNutrition("iron", v)} />
                <NutritionInput label="Cynk" unit="mg" value={nutrition.zinc} onChange={(v) => updateNutrition("zinc", v)} />
              </div>
            </div>

            {/* Vitamins */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Witaminy</h4>
              <div className="grid grid-cols-4 gap-3">
                <NutritionInput label="Witamina A" unit="µg" value={nutrition.vitamin_a} onChange={(v) => updateNutrition("vitamin_a", v)} />
                <NutritionInput label="Witamina D" unit="µg" value={nutrition.vitamin_d} onChange={(v) => updateNutrition("vitamin_d", v)} />
                <NutritionInput label="Witamina E" unit="mg" value={nutrition.vitamin_e} onChange={(v) => updateNutrition("vitamin_e", v)} />
                <NutritionInput label="Witamina C" unit="mg" value={nutrition.vitamin_c} onChange={(v) => updateNutrition("vitamin_c", v)} />
                <NutritionInput label="Witamina B1" unit="mg" value={nutrition.vitamin_b1} onChange={(v) => updateNutrition("vitamin_b1", v)} />
                <NutritionInput label="Witamina B2" unit="mg" value={nutrition.vitamin_b2} onChange={(v) => updateNutrition("vitamin_b2", v)} />
                <NutritionInput label="Witamina B6" unit="mg" value={nutrition.vitamin_b6} onChange={(v) => updateNutrition("vitamin_b6", v)} />
                <NutritionInput label="Witamina B12" unit="µg" value={nutrition.vitamin_b12} onChange={(v) => updateNutrition("vitamin_b12", v)} />
                <NutritionInput label="Kwas foliowy" unit="µg" value={nutrition.folate} onChange={(v) => updateNutrition("folate", v)} />
                <NutritionInput label="Niacyna" unit="mg" value={nutrition.niacin} onChange={(v) => updateNutrition("niacin", v)} />
              </div>
            </div>

            {/* Other */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Inne</h4>
              <div className="grid grid-cols-4 gap-3">
                <NutritionInput label="Cholesterol" unit="mg" value={nutrition.cholesterol} onChange={(v) => updateNutrition("cholesterol", v)} />
              </div>
            </div>
          </TabsContent>

        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Anuluj</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Zapisz produkt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Edit Product Dialog - similar to Add but with prefilled values
const EditProductDialog = ({
  open,
  onOpenChange,
  product,
  allergensList,
  nutritionDatabase,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: DisplayProduct | null;
  allergensList: AllergenItem[];
  nutritionDatabase: { id: number; name: string }[];
  onSave: () => void;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [selectedAllergens, setSelectedAllergens] = useState<string[]>([]);
  const [nutritionDbId, setNutritionDbId] = useState<string>("none");
  const [isSaving, setIsSaving] = useState(false);

  const [nutrition, setNutrition] = useState({
    energy_kj: "", energy_kcal: "", energy_kj_1169: "", energy_kcal_1169: "",
    water: "", protein_animal: "", protein_plant: "", fat: "", saturated_fat: "",
    carbohydrates: "", sugars: "", fiber: "", sodium: "", salt: "", potassium: "",
    calcium: "", phosphorus: "", magnesium: "", iron: "", zinc: "",
    vitamin_a: "", vitamin_d: "", vitamin_e: "", vitamin_c: "",
    vitamin_b1: "", vitamin_b2: "", vitamin_b6: "", vitamin_b12: "",
    folate: "", niacin: "", cholesterol: "",
  });

  useEffect(() => {
    if (open && product) {
      setName(product.name);
      setDescription(product.description);
      setStatus(product.status);
      setSelectedAllergens(product.allergens || []);
      setNutritionDbId(product.nutrition_database_id?.toString() || "none");
      setNutrition({
        energy_kj: product.energy_kj?.toString() || "",
        energy_kcal: product.energy_kcal?.toString() || "",
        energy_kj_1169: product.energy_kj_1169?.toString() || "",
        energy_kcal_1169: product.energy_kcal_1169?.toString() || "",
        water: product.water?.toString() || "",
        protein_animal: product.protein_animal?.toString() || "",
        protein_plant: product.protein_plant?.toString() || "",
        fat: product.fat?.toString() || "",
        saturated_fat: product.saturated_fat?.toString() || "",
        carbohydrates: product.carbohydrates?.toString() || "",
        sugars: product.sugars?.toString() || "",
        fiber: product.fiber?.toString() || "",
        sodium: product.sodium?.toString() || "",
        salt: product.salt?.toString() || "",
        potassium: product.potassium?.toString() || "",
        calcium: product.calcium?.toString() || "",
        phosphorus: product.phosphorus?.toString() || "",
        magnesium: product.magnesium?.toString() || "",
        iron: product.iron?.toString() || "",
        zinc: product.zinc?.toString() || "",
        vitamin_a: product.vitamin_a?.toString() || "",
        vitamin_d: product.vitamin_d?.toString() || "",
        vitamin_e: product.vitamin_e?.toString() || "",
        vitamin_c: product.vitamin_c?.toString() || "",
        vitamin_b1: product.vitamin_b1?.toString() || "",
        vitamin_b2: product.vitamin_b2?.toString() || "",
        vitamin_b6: product.vitamin_b6?.toString() || "",
        vitamin_b12: product.vitamin_b12?.toString() || "",
        folate: product.folate?.toString() || "",
        niacin: product.niacin?.toString() || "",
        cholesterol: product.cholesterol?.toString() || "",
      });
    }
  }, [open, product]);

  const toggleAllergen = (id: string) => {
    setSelectedAllergens(prev => 
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!product || !name.trim()) {
      toast.error("Nazwa produktu jest wymagana");
      return;
    }

    setIsSaving(true);
    try {
      const parseNum = (v: string) => v === "" ? null : parseFloat(v);
      
      await updateProduct({
        id: product.id,
        subcategory_id: product.subcategory_id,
        name: name.trim(),
        description: description.trim(),
        status,
        nutrition_database_id: nutritionDbId !== "none" ? parseInt(nutritionDbId) : null,
        energy_kj: parseNum(nutrition.energy_kj),
        energy_kcal: parseNum(nutrition.energy_kcal),
        energy_kj_1169: parseNum(nutrition.energy_kj_1169),
        energy_kcal_1169: parseNum(nutrition.energy_kcal_1169),
        water: parseNum(nutrition.water),
        protein_animal: parseNum(nutrition.protein_animal),
        protein_plant: parseNum(nutrition.protein_plant),
        fat: parseNum(nutrition.fat),
        saturated_fat: parseNum(nutrition.saturated_fat),
        carbohydrates: parseNum(nutrition.carbohydrates),
        sugars: parseNum(nutrition.sugars),
        fiber: parseNum(nutrition.fiber),
        sodium: parseNum(nutrition.sodium),
        salt: parseNum(nutrition.salt),
        potassium: parseNum(nutrition.potassium),
        calcium: parseNum(nutrition.calcium),
        phosphorus: parseNum(nutrition.phosphorus),
        magnesium: parseNum(nutrition.magnesium),
        iron: parseNum(nutrition.iron),
        zinc: parseNum(nutrition.zinc),
        vitamin_a: parseNum(nutrition.vitamin_a),
        vitamin_d: parseNum(nutrition.vitamin_d),
        vitamin_e: parseNum(nutrition.vitamin_e),
        vitamin_c: parseNum(nutrition.vitamin_c),
        vitamin_b1: parseNum(nutrition.vitamin_b1),
        vitamin_b2: parseNum(nutrition.vitamin_b2),
        vitamin_b6: parseNum(nutrition.vitamin_b6),
        vitamin_b12: parseNum(nutrition.vitamin_b12),
        folate: parseNum(nutrition.folate),
        niacin: parseNum(nutrition.niacin),
        cholesterol: parseNum(nutrition.cholesterol),
        allergens: selectedAllergens,
      });
      toast.success("Produkt został zaktualizowany");
      onSave();
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Błąd: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  const updateNutrition = (field: string, value: string) => {
    setNutrition(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-5 w-5" />
            Edytuj produkt: {product?.name}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Podstawowe</TabsTrigger>
            <TabsTrigger value="allergens">Alergeny</TabsTrigger>
            <TabsTrigger value="nutrition">Wartości odżywcze</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nazwa produktu *</Label>
              <Input placeholder="np. Ser żółty Gouda" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Textarea placeholder="Opis produktu..." value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "active" | "archived")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktywny</SelectItem>
                  <SelectItem value="archived">Zarchiwizowany</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Separator className="my-4" />
            
            {/* Powiązanie z bazą IŻŻ */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Database className="h-4 w-4 text-green-600" />
                <Label className="font-medium">Powiązanie z bazą IŻŻ</Label>
              </div>
              <div className="flex gap-3">
                <NutritionDbCombobox
                  items={nutritionDatabase}
                  value={nutritionDbId}
                  onValueChange={setNutritionDbId}
                  className="flex-1"
                />
                {nutritionDbId !== "none" && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="gap-2 text-green-600 border-green-300 hover:bg-green-50"
                    onClick={async () => {
                      try {
                        const entry = await getNutritionDatabaseEntry(parseInt(nutritionDbId));
                        setNutrition({
                          energy_kj: entry.energy_kj?.toString() ?? "",
                          energy_kcal: entry.energy_kcal?.toString() ?? "",
                          energy_kj_1169: entry.energy_kj_1169?.toString() ?? "",
                          energy_kcal_1169: entry.energy_kcal_1169?.toString() ?? "",
                          water: entry.water?.toString() ?? "",
                          protein_animal: entry.protein_animal?.toString() ?? "",
                          protein_plant: entry.protein_plant?.toString() ?? "",
                          fat: entry.fat?.toString() ?? "",
                          saturated_fat: entry.saturated_fat?.toString() ?? "",
                          carbohydrates: entry.carbohydrates_available?.toString() ?? "",
                          sugars: entry.sugars?.toString() ?? "",
                          fiber: entry.fiber?.toString() ?? "",
                          sodium: entry.sodium?.toString() ?? "",
                          salt: entry.salt?.toString() ?? "",
                          potassium: entry.potassium?.toString() ?? "",
                          calcium: entry.calcium?.toString() ?? "",
                          phosphorus: entry.phosphorus?.toString() ?? "",
                          magnesium: entry.magnesium?.toString() ?? "",
                          iron: entry.iron?.toString() ?? "",
                          zinc: entry.zinc?.toString() ?? "",
                          vitamin_a: entry.vitamin_a?.toString() ?? "",
                          vitamin_d: entry.vitamin_d?.toString() ?? "",
                          vitamin_e: entry.vitamin_e?.toString() ?? "",
                          vitamin_c: entry.vitamin_c?.toString() ?? "",
                          vitamin_b1: entry.vitamin_b1?.toString() ?? "",
                          vitamin_b2: entry.vitamin_b2?.toString() ?? "",
                          vitamin_b6: entry.vitamin_b6?.toString() ?? "",
                          vitamin_b12: entry.vitamin_b12?.toString() ?? "",
                          folate: entry.folate?.toString() ?? "",
                          niacin: entry.niacin?.toString() ?? "",
                          cholesterol: entry.cholesterol?.toString() ?? "",
                        });
                        toast.success("Dane zostały skopiowane z bazy IŻŻ");
                      } catch (error) {
                        toast.error("Nie udało się pobrać danych z bazy IŻŻ");
                      }
                    }}
                  >
                    <Copy className="h-4 w-4" />
                    Powiąż dane
                  </Button>
                )}
              </div>
              {nutritionDbId !== "none" && (
                <p className="text-xs text-muted-foreground">
                  Po kliknięciu "Powiąż dane" wartości odżywcze zostaną skopiowane z bazy IŻŻ
                </p>
              )}
            </div>
          </TabsContent>

          <TabsContent value="allergens" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 p-3 bg-orange-50 rounded-lg text-sm text-orange-700">
              <AlertTriangle className="h-4 w-4" />
              <span>Zaznacz wszystkie alergeny występujące w produkcie</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {allergensList.map((allergen) => (
                <div
                  key={allergen.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedAllergens.includes(allergen.id) 
                      ? 'bg-orange-100 border-orange-400' 
                      : 'hover:bg-muted/50'
                  }`}
                  onClick={() => toggleAllergen(allergen.id)}
                >
                  <Checkbox 
                    checked={selectedAllergens.includes(allergen.id)} 
                    onCheckedChange={() => toggleAllergen(allergen.id)}
                  />
                  <div className="flex items-center gap-2">
                    {allergen.icon}
                    <span className="text-sm">{allergen.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="nutrition" className="space-y-4 mt-4">
            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg text-sm text-blue-700">
              <Info className="h-4 w-4" />
              <span>Wartości odżywcze na 100g produktu</span>
            </div>
            
            {/* Energy */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Energia</h4>
              <div className="grid grid-cols-4 gap-3">
                <NutritionInput label="Energia" unit="kJ" value={nutrition.energy_kj} onChange={(v) => updateNutrition("energy_kj", v)} />
                <NutritionInput label="Energia" unit="kcal" value={nutrition.energy_kcal} onChange={(v) => updateNutrition("energy_kcal", v)} />
                <NutritionInput label="Energia (1169)" unit="kJ" value={nutrition.energy_kj_1169} onChange={(v) => updateNutrition("energy_kj_1169", v)} />
                <NutritionInput label="Energia (1169)" unit="kcal" value={nutrition.energy_kcal_1169} onChange={(v) => updateNutrition("energy_kcal_1169", v)} />
              </div>
            </div>

            {/* Macronutrients */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Makroskładniki</h4>
              <div className="grid grid-cols-4 gap-3">
                <NutritionInput label="Woda" unit="g" value={nutrition.water} onChange={(v) => updateNutrition("water", v)} />
                <NutritionInput label="Białko zwierzęce" unit="g" value={nutrition.protein_animal} onChange={(v) => updateNutrition("protein_animal", v)} />
                <NutritionInput label="Białko roślinne" unit="g" value={nutrition.protein_plant} onChange={(v) => updateNutrition("protein_plant", v)} />
                <NutritionInput label="Tłuszcz" unit="g" value={nutrition.fat} onChange={(v) => updateNutrition("fat", v)} />
                <NutritionInput label="Tł. nasycony" unit="g" value={nutrition.saturated_fat} onChange={(v) => updateNutrition("saturated_fat", v)} />
                <NutritionInput label="Węglowodany" unit="g" value={nutrition.carbohydrates} onChange={(v) => updateNutrition("carbohydrates", v)} />
                <NutritionInput label="Cukry" unit="g" value={nutrition.sugars} onChange={(v) => updateNutrition("sugars", v)} />
                <NutritionInput label="Błonnik" unit="g" value={nutrition.fiber} onChange={(v) => updateNutrition("fiber", v)} />
              </div>
            </div>

            {/* Minerals */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Minerały</h4>
              <div className="grid grid-cols-4 gap-3">
                <NutritionInput label="Sód" unit="mg" value={nutrition.sodium} onChange={(v) => updateNutrition("sodium", v)} />
                <NutritionInput label="Sól" unit="g" value={nutrition.salt} onChange={(v) => updateNutrition("salt", v)} />
                <NutritionInput label="Potas" unit="mg" value={nutrition.potassium} onChange={(v) => updateNutrition("potassium", v)} />
                <NutritionInput label="Wapń" unit="mg" value={nutrition.calcium} onChange={(v) => updateNutrition("calcium", v)} />
                <NutritionInput label="Fosfor" unit="mg" value={nutrition.phosphorus} onChange={(v) => updateNutrition("phosphorus", v)} />
                <NutritionInput label="Magnez" unit="mg" value={nutrition.magnesium} onChange={(v) => updateNutrition("magnesium", v)} />
                <NutritionInput label="Żelazo" unit="mg" value={nutrition.iron} onChange={(v) => updateNutrition("iron", v)} />
                <NutritionInput label="Cynk" unit="mg" value={nutrition.zinc} onChange={(v) => updateNutrition("zinc", v)} />
              </div>
            </div>

            {/* Vitamins */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Witaminy</h4>
              <div className="grid grid-cols-4 gap-3">
                <NutritionInput label="Witamina A" unit="µg" value={nutrition.vitamin_a} onChange={(v) => updateNutrition("vitamin_a", v)} />
                <NutritionInput label="Witamina D" unit="µg" value={nutrition.vitamin_d} onChange={(v) => updateNutrition("vitamin_d", v)} />
                <NutritionInput label="Witamina E" unit="mg" value={nutrition.vitamin_e} onChange={(v) => updateNutrition("vitamin_e", v)} />
                <NutritionInput label="Witamina C" unit="mg" value={nutrition.vitamin_c} onChange={(v) => updateNutrition("vitamin_c", v)} />
                <NutritionInput label="Witamina B1" unit="mg" value={nutrition.vitamin_b1} onChange={(v) => updateNutrition("vitamin_b1", v)} />
                <NutritionInput label="Witamina B2" unit="mg" value={nutrition.vitamin_b2} onChange={(v) => updateNutrition("vitamin_b2", v)} />
                <NutritionInput label="Witamina B6" unit="mg" value={nutrition.vitamin_b6} onChange={(v) => updateNutrition("vitamin_b6", v)} />
                <NutritionInput label="Witamina B12" unit="µg" value={nutrition.vitamin_b12} onChange={(v) => updateNutrition("vitamin_b12", v)} />
                <NutritionInput label="Kwas foliowy" unit="µg" value={nutrition.folate} onChange={(v) => updateNutrition("folate", v)} />
                <NutritionInput label="Niacyna" unit="mg" value={nutrition.niacin} onChange={(v) => updateNutrition("niacin", v)} />
              </div>
            </div>

            {/* Other */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Inne</h4>
              <div className="grid grid-cols-4 gap-3">
                <NutritionInput label="Cholesterol" unit="mg" value={nutrition.cholesterol} onChange={(v) => updateNutrition("cholesterol", v)} />
              </div>
            </div>
          </TabsContent>

        </Tabs>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Anuluj</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Product Management Panel
const ProductManagementPanel = ({
  product,
  allergensList,
  nutritionDatabase,
  onAddSubProduct,
  onEditProduct,
  onArchive,
}: {
  product: DisplayProduct;
  allergensList: AllergenItem[];
  nutritionDatabase: { id: number; name: string }[];
  onAddSubProduct: () => void;
  onEditProduct: () => void;
  onArchive: () => void;
}) => {
  const linkedEntry = nutritionDatabase.find(e => e.id === product.nutrition_database_id);
  
  return (
    <ScrollArea className="h-[600px]">
      <div className="p-4 space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Produkt</Label>
          <h3 className="text-lg font-semibold">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground mt-1">{product.description}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
            <span className="text-sm">Status</span>
            <Badge
              variant={product.status === "active" ? "default" : "secondary"}
              className={product.status === "active" ? "bg-green-600" : "bg-gray-400"}
            >
              {product.status === "active" ? "Aktywny" : "Archiwum"}
            </Badge>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
            <span className="text-sm">Subprodukty</span>
            <span className="font-medium">{product.subProducts.length}</span>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
            <span className="text-sm">Baza IŻŻ</span>
            {linkedEntry ? (
              <Badge variant="outline" className="text-green-600 border-green-300 gap-1">
                <Link2 className="h-3 w-3" />
                {linkedEntry.name}
              </Badge>
            ) : (
              <Badge variant="outline" className="text-red-600 border-red-300 gap-1">
                <Link2Off className="h-3 w-3" />
                Brak
              </Badge>
            )}
          </div>
        </div>

        {/* Nutritional info */}
        {(product.energy_kcal || product.fat || product.carbohydrates) && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Wartości odżywcze (na 100g)</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {product.energy_kcal && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Energia</span>
                    <span className="font-medium">{product.energy_kcal} kcal</span>
                  </div>
                )}
                {product.energy_kj && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Energia</span>
                    <span className="font-medium">{product.energy_kj} kJ</span>
                  </div>
                )}
                {(product.protein_animal || product.protein_plant) && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Białko</span>
                    <span className="font-medium">
                      {(Number(product.protein_animal || 0) + Number(product.protein_plant || 0)).toFixed(1)} g
                    </span>
                  </div>
                )}
                {product.fat && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Tłuszcz</span>
                    <span className="font-medium">{product.fat} g</span>
                  </div>
                )}
                {product.carbohydrates && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Węglowodany</span>
                    <span className="font-medium">{product.carbohydrates} g</span>
                  </div>
                )}
                {product.fiber && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Błonnik</span>
                    <span className="font-medium">{product.fiber} g</span>
                  </div>
                )}
                {product.salt && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Sól</span>
                    <span className="font-medium">{product.salt} g</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Allergens */}
        {product.allergens && product.allergens.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Alergeny</Label>
              <div className="flex flex-wrap gap-1">
                {product.allergens.map(allergenId => {
                  const allergen = allergensList.find(a => a.id === allergenId);
                  if (!allergen) return null;
                  return (
                    <Badge key={allergenId} variant="outline" className="gap-1 text-orange-600 border-orange-300">
                      {allergen.icon}
                      <span className="text-xs">{allergen.name}</span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="space-y-2">
          <Button variant="outline" className="w-full gap-2" onClick={onAddSubProduct}>
            <Plus className="h-4 w-4" />
            Dodaj subprodukt
          </Button>
          <Button variant="outline" className="w-full gap-2" onClick={onEditProduct}>
            <Pencil className="h-4 w-4" />
            Edytuj produkt
          </Button>
          <Button 
            variant="outline" 
            className={`w-full gap-2 ${product.status === "active" ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}`}
            onClick={onArchive}
          >
            {product.status === "active" ? <Archive className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
            {product.status === "active" ? `Archiwizuj (+ ${product.subProducts.length} subprod.)` : "Przywróć (+ subprodukty)"}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

// SubProduct Management Panel - simplified
const SubProductManagementPanel = ({
  subProduct,
  parentProduct,
  onEditSubProduct,
  onArchive,
}: {
  subProduct: DisplaySubProduct;
  parentProduct: DisplayProduct;
  onEditSubProduct: () => void;
  onArchive: () => void;
}) => {
  return (
    <ScrollArea className="h-[600px]">
      <div className="p-4 space-y-4">
        <div>
          <Label className="text-xs text-muted-foreground">Subprodukt z: {parentProduct.name}</Label>
          <h3 className="text-lg font-semibold">{subProduct.name}</h3>
        </div>

        {subProduct.image_url && (
          <div className="flex justify-center">
            <img 
              src={subProduct.image_url} 
              alt={subProduct.name}
              className="w-24 h-24 object-contain rounded bg-white p-1 border"
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
            <span className="text-sm">Status</span>
            <Badge
              variant={subProduct.status === "active" ? "default" : "secondary"}
              className={subProduct.status === "active" ? "bg-green-600" : "bg-gray-400"}
            >
              {subProduct.status === "active" ? "Aktywny" : "Archiwum"}
            </Badge>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
            <span className="text-sm">EAN</span>
            <code className="text-sm bg-background px-2 py-0.5 rounded">{subProduct.ean}</code>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
            <span className="text-sm">SKU</span>
            <code className="text-sm bg-background px-2 py-0.5 rounded">{subProduct.sku}</code>
          </div>
          <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
            <span className="text-sm">Zawartość</span>
            <span className="font-medium">{subProduct.content} {subProduct.unit}</span>
          </div>
          {subProduct.brands && (
            <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
              <span className="text-sm">Marka</span>
              <span className="font-medium">{subProduct.brands}</span>
            </div>
          )}
        </div>

        <Separator />

        <div className="space-y-2">
          <Button variant="outline" className="w-full gap-2" onClick={onEditSubProduct}>
            <Pencil className="h-4 w-4" />
            Edytuj subprodukt
          </Button>
          <Button 
            variant="outline" 
            className={`w-full gap-2 ${subProduct.status === "active" ? "text-orange-600 hover:text-orange-700" : "text-green-600 hover:text-green-700"}`}
            onClick={onArchive}
          >
            {subProduct.status === "active" ? <Archive className="h-4 w-4" /> : <RotateCcw className="h-4 w-4" />}
            {subProduct.status === "active" ? "Archiwizuj" : "Przywróć"}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

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
  };
}

// Add SubProduct Dialog Component
const AddSubProductDialog = ({
  open,
  onOpenChange,
  parentProduct,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentProduct: DisplayProduct | null;
  onSave?: () => void;
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
  const [productCategories, setProductCategories] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [productFound, setProductFound] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [eanDuplicate, setEanDuplicate] = useState<EanCheckResult | null>(null);
  
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

  useEffect(() => {
    if (open && eanInputRef.current) {
      setTimeout(() => eanInputRef.current?.focus(), 100);
    }
    if (open) {
      setEan("");
      setVariantName("");
      setContent("");
      setUnit("g");
      setSku("");
      setCalories("");
      setImageUrl("");
      setBrands("");
      setProductCategories("");
      setProductFound(false);
      setDataFetched(false);
      setIsScannerOpen(false);
      setEanDuplicate(null);
    }
  }, [open]);

  useEffect(() => {
    return () => {
      if (html5QrCode) html5QrCode.stop().catch(() => {});
    };
  }, [html5QrCode]);

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

  useEffect(() => {
    if (variantName && content) {
      setSku(generateSku(variantName, content, unit));
    }
  }, [variantName, content, unit, generateSku]);

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
        const productName = product.product_name_pl || product.product_name_en || product.product_name || "";
        setVariantName(productName);

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

        if (product.nutriments?.["energy-kcal_100g"]) {
          setCalories(product.nutriments["energy-kcal_100g"].toString());
        }

        if (product.image_front_small_url) setImageUrl(product.image_front_small_url);
        if (product.brands) setBrands(product.brands);
        if (product.categories) setProductCategories(product.categories);

        setProductFound(true);
        setDataFetched(true);
        toast.success("Dane produktu pobrane z OpenFoodFacts!");
      } else {
        toast.error("Produkt nie został znaleziony");
        setProductFound(false);
        setDataFetched(true);
      }
    } catch (error) {
      toast.error("Błąd podczas pobierania danych");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEanChange = async (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setEan(numericValue);
    setEanDuplicate(null);
    if (numericValue.length === 13) {
      try {
        const eanCheck = await checkEan(numericValue);
        if (eanCheck.exists) {
          setEanDuplicate(eanCheck);
          toast.error(`Ten kod EAN już istnieje: ${eanCheck.path}`);
          return;
        }
      } catch (error) { /* ignore */ }
      fetchProductData(numericValue);
    }
  };

  const handleEanKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && ean.length >= 8) {
      e.preventDefault();
      fetchProductData(ean);
    }
  };

  const toggleScanner = async () => {
    if (isScannerOpen) {
      if (html5QrCode) await html5QrCode.stop().catch(() => {});
      setIsScannerOpen(false);
    } else {
      setIsScannerOpen(true);
      try {
        const { Html5Qrcode } = await import("html5-qrcode");
        setTimeout(async () => {
          if (!scannerRef.current) return;
          const scannerId = "add-ean-scanner-" + Date.now();
          scannerRef.current.id = scannerId;
          const scanner = new Html5Qrcode(scannerId);
          setHtml5QrCode(scanner);
          try {
            await scanner.start(
              { facingMode: "environment" },
              { fps: 10, qrbox: { width: 250, height: 100 } },
              (decodedText) => {
                const numericValue = decodedText.replace(/\D/g, "");
                setEan(numericValue);
                setIsScannerOpen(false);
                scanner.stop().catch(() => {});
                toast.success("Kod zeskanowany!");
                if (numericValue.length >= 8) setTimeout(() => fetchProductData(numericValue), 100);
              },
              () => {}
            );
          } catch (err) {
            toast.error("Nie można uruchomić kamery");
            setIsScannerOpen(false);
          }
        }, 100);
      } catch (err) {
        toast.error("Błąd ładowania skanera");
        setIsScannerOpen(false);
      }
    }
  };

  const handleSave = async () => {
    const missing = getMissingFields();
    if (missing.length > 0) {
      const fieldNames: Record<string, string> = {
        ean: "Kod EAN", variantName: "Nazwa subproduktu", content: "Zawartość", unit: "Jednostka", sku: "SKU",
      };
      toast.error(`Uzupełnij wymagane pola: ${missing.map(f => fieldNames[f]).join(", ")}`);
      setDataFetched(true);
      return;
    }

    setIsSaving(true);
    try {
      await createProductVariant({
        product_id: parentProduct?.id || null,
        ean, 
        name: variantName, 
        content, 
        unit, 
        sku,
        status: "active",
        brands, 
        categories: productCategories, 
        image_url: imageUrl,
        allergens: [],
        nutrition_database_id: null,
        energy_kj: null,
        energy_kcal: calories ? parseFloat(calories) : null,
        energy_kj_1169: null,
        energy_kcal_1169: null,
        water: null,
        protein_animal: null,
        protein_plant: null,
        fat: null,
        carbohydrates: null,
        fiber: null,
        sodium: null,
        salt: null,
        potassium: null,
        calcium: null,
        phosphorus: null,
        magnesium: null,
        iron: null,
        vitamin_d: null,
        vitamin_c: null,
        cholesterol: null,
      });
      toast.success("Subprodukt został zapisany!");
      onSave?.();
      onOpenChange(false);
    } catch (error: any) {
      if (error.message === "EAN_ALREADY_EXISTS") {
        toast.error("Subprodukt z tym kodem EAN już istnieje");
      } else {
        toast.error("Błąd: " + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <Label className="flex items-center gap-1">
      {children}
      <span className="text-red-500">*</span>
    </Label>
  );

  const getFieldClass = (fieldName: string) => {
    if (dataFetched && missingFields.includes(fieldName)) {
      return "border-red-500 ring-1 ring-red-500";
    }
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value && html5QrCode) html5QrCode.stop().catch(() => {});
      onOpenChange(value);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Dodaj subprodukt</DialogTitle>
          {parentProduct && (
            <p className="text-sm text-muted-foreground">Do produktu: {parentProduct.name}</p>
          )}
          <p className="text-xs text-muted-foreground">
            Pola oznaczone <span className="text-red-500">*</span> są wymagane
          </p>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
              <Button type="button" variant={isScannerOpen ? "default" : "outline"} size="icon" onClick={toggleScanner}>
                <Camera className="h-5 w-5" />
              </Button>
              <Button type="button" variant="secondary" onClick={() => fetchProductData(ean)} disabled={isLoading || ean.length < 8} className="gap-2">
                <Download className="h-4 w-4" />
                Pobierz dane
              </Button>
            </div>
          </div>

          {isScannerOpen && (
            <div className="relative rounded-lg overflow-hidden bg-black">
              <div ref={scannerRef} className="w-full aspect-video" />
              <Button variant="secondary" size="sm" className="absolute top-2 right-2 gap-1" onClick={() => {
                if (html5QrCode) html5QrCode.stop().catch(() => {});
                setIsScannerOpen(false);
              }}>
                <X className="h-4 w-4" /> Zamknij
              </Button>
            </div>
          )}

          {eanDuplicate?.exists && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Ten kod EAN już istnieje w bazie!</p>
                <p className="text-xs mt-1">Ścieżka: {eanDuplicate.path}</p>
              </div>
            </div>
          )}

          <Separator />

          {productFound && imageUrl && (
            <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
              <img src={imageUrl} alt={variantName} className="w-20 h-20 object-contain rounded bg-white p-1" />
              <div className="flex-1">
                <p className="font-medium">{variantName}</p>
                <p className="text-sm text-muted-foreground">{content} {unit} • {calories ? `${calories} kcal/100g` : "Brak kcal"}</p>
                {brands && <p className="text-xs text-muted-foreground mt-1">Marka: {brands}</p>}
                <Badge variant="outline" className="mt-2 text-green-600 border-green-300">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  OpenFoodFacts
                </Badge>
              </div>
            </div>
          )}

          {dataFetched && missingFields.length > 0 && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Uzupełnij podświetlone pola przed zapisaniem</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <RequiredLabel>Nazwa subproduktu</RequiredLabel>
            <Input placeholder="np. Ser Gouda Łowicz 200g" value={variantName} onChange={(e) => setVariantName(e.target.value)} className={getFieldClass("variantName")} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <RequiredLabel>Zawartość</RequiredLabel>
              <Input type="number" placeholder="500" value={content} onChange={(e) => setContent(e.target.value)} className={getFieldClass("content")} />
            </div>
            <div className="space-y-2">
              <RequiredLabel>Jednostka</RequiredLabel>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className={getFieldClass("unit")}><SelectValue /></SelectTrigger>
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
            <Label>Marka (opcjonalne)</Label>
            <Input placeholder="np. Łowicz" value={brands} onChange={(e) => setBrands(e.target.value)} />
          </div>

          <div className="space-y-2">
            <RequiredLabel>SKU</RequiredLabel>
            <Input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} className={`font-mono ${getFieldClass("sku")}`} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Anuluj</Button>
          <Button onClick={handleSave} disabled={isSaving || (eanDuplicate?.exists ?? false)}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Zapisz
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Edit SubProduct Dialog - simplified
const EditSubProductDialog = ({
  open,
  onOpenChange,
  subProduct,
  categories,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subProduct: DisplaySubProduct | null;
  categories: DisplayCategory[];
  onSave?: () => void;
}) => {
  const eanInputRef = useRef<HTMLInputElement>(null);
  const scannerRef = useRef<HTMLDivElement>(null);
  const [ean, setEan] = useState("");
  const [variantName, setVariantName] = useState("");
  const [content, setContent] = useState("");
  const [unit, setUnit] = useState("g");
  const [sku, setSku] = useState("");
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [imageUrl, setImageUrl] = useState("");
  const [brands, setBrands] = useState("");
  const [productCategories, setProductCategories] = useState("");
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [eanDuplicate, setEanDuplicate] = useState<EanCheckResult | null>(null);
  const [dataFetched, setDataFetched] = useState(false);

  const getSubcategoriesForCategory = (categoryId: string) => {
    const cat = categories.find(c => c.id === parseInt(categoryId));
    return cat?.subcategories || [];
  };

  const getProductsForSubcategory = (subcategoryId: string) => {
    for (const cat of categories) {
      const sub = cat.subcategories.find(s => s.id === parseInt(subcategoryId));
      if (sub) return sub.products;
    }
    return [];
  };

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

  useEffect(() => {
    if (open && subProduct) {
      setEan(subProduct.ean || "");
      setVariantName(subProduct.name || "");
      setContent(subProduct.content || "");
      setUnit(subProduct.unit || "g");
      setSku(subProduct.sku || "");
      setStatus(subProduct.status || "active");
      setBrands(subProduct.brands || "");
      setProductCategories(subProduct.categories || "");
      setImageUrl(subProduct.image_url || "");
      setDataFetched(true);
      setEanDuplicate(null);
      
      if (subProduct.product_id) {
        for (const cat of categories) {
          for (const sub of cat.subcategories) {
            const prod = sub.products.find(p => p.id === subProduct.product_id);
            if (prod) {
              setSelectedCategoryId(cat.id.toString());
              setSelectedSubcategoryId(sub.id.toString());
              setSelectedProductId(prod.id.toString());
              break;
            }
          }
        }
      }
    }
  }, [open, subProduct, categories]);

  useEffect(() => {
    return () => {
      if (html5QrCode) html5QrCode.stop().catch(() => {});
    };
  }, [html5QrCode]);

  const fetchProductData = async (eanCode: string) => {
    if (!eanCode || eanCode.length < 8) {
      toast.error("Wprowadź prawidłowy kod EAN (min. 8 znaków)");
      return;
    }

    setIsLoading(true);
    setEanDuplicate(null);

    try {
      const eanCheck = await checkEan(eanCode, subProduct?.id);
      if (eanCheck.exists) {
        setEanDuplicate(eanCheck);
        toast.error(`Ten kod EAN już istnieje: ${eanCheck.path}`);
        setIsLoading(false);
        return;
      }

      const response = await fetch(`https://world.openfoodfacts.org/api/v0/product/${eanCode}.json`);
      const data = await response.json();

      if (data.status === 1 && data.product) {
        const product = data.product;
        const productName = product.product_name_pl || product.product_name_en || product.product_name || "";
        setVariantName(productName);

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

        if (product.image_front_small_url) setImageUrl(product.image_front_small_url);
        if (product.brands) setBrands(product.brands);
        if (product.categories) setProductCategories(product.categories);

        setDataFetched(true);
        toast.success("Dane produktu pobrane z OpenFoodFacts!");
      } else {
        toast.info("Produkt nie został znaleziony w OpenFoodFacts");
        setDataFetched(true);
      }
    } catch (error) {
      toast.error("Błąd podczas pobierania danych");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEanChange = async (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setEan(numericValue);
    setEanDuplicate(null);
    
    if (numericValue.length === 13) {
      try {
        const eanCheck = await checkEan(numericValue, subProduct?.id);
        if (eanCheck.exists) {
          setEanDuplicate(eanCheck);
        }
      } catch (error) {}
    }
  };

  const handleSave = async () => {
    if (!subProduct) return;
    
    const missing = getMissingFields();
    if (missing.length > 0) {
      const fieldNames: Record<string, string> = {
        ean: "Kod EAN", variantName: "Nazwa subproduktu", content: "Zawartość", unit: "Jednostka", sku: "SKU",
      };
      toast.error(`Uzupełnij wymagane pola: ${missing.map(f => fieldNames[f]).join(", ")}`);
      setDataFetched(true);
      return;
    }

    if (eanDuplicate?.exists) {
      toast.error(`Ten kod EAN już istnieje: ${eanDuplicate.path}`);
      return;
    }

    setIsSaving(true);
    try {
      await updateProductVariant({
        id: subProduct.id,
        product_id: selectedProductId ? parseInt(selectedProductId) : subProduct.product_id,
        ean,
        name: variantName,
        content,
        unit,
        sku,
        status,
        brands,
        categories: productCategories,
        image_url: imageUrl,
        allergens: [],
        nutrition_database_id: null,
        energy_kj: null,
        energy_kcal: null,
        energy_kj_1169: null,
        energy_kcal_1169: null,
        water: null,
        protein_animal: null,
        protein_plant: null,
        fat: null,
        carbohydrates: null,
        fiber: null,
        sodium: null,
        salt: null,
        potassium: null,
        calcium: null,
        phosphorus: null,
        magnesium: null,
        iron: null,
        vitamin_d: null,
        vitamin_c: null,
        cholesterol: null,
      });
      toast.success("Subprodukt został zaktualizowany!");
      onSave?.();
      onOpenChange(false);
    } catch (error: any) {
      if (error.message === "EAN_ALREADY_EXISTS") {
        toast.error("Subprodukt z tym kodem EAN już istnieje");
      } else {
        toast.error("Błąd: " + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <Label className="flex items-center gap-1">
      {children}
      <span className="text-red-500">*</span>
    </Label>
  );

  const getFieldClass = (fieldName: string) => {
    if (dataFetched && missingFields.includes(fieldName)) {
      return "border-red-500 ring-1 ring-red-500";
    }
    return "";
  };

  return (
    <Dialog open={open} onOpenChange={(value) => {
      if (!value && html5QrCode) html5QrCode.stop().catch(() => {});
      onOpenChange(value);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edytuj subprodukt</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Pola oznaczone <span className="text-red-500">*</span> są wymagane
          </p>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
                  className={`pr-10 font-mono text-lg ${getFieldClass("ean")} ${eanDuplicate?.exists ? "border-red-500" : ""}`}
                />
                {isLoading && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                  </div>
                )}
              </div>
              <Button type="button" variant="secondary" onClick={() => fetchProductData(ean)} disabled={isLoading || ean.length < 8} className="gap-2">
                <Download className="h-4 w-4" />
                Pobierz dane
              </Button>
            </div>
          </div>

          {eanDuplicate?.exists && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Ten kod EAN już istnieje w bazie!</p>
                <p className="text-xs mt-1">Ścieżka: {eanDuplicate.path}</p>
              </div>
            </div>
          )}

          <Separator />

          {/* Parent product selection */}
          <div className="space-y-2 p-3 bg-muted/30 rounded-lg">
            <Label className="text-sm font-medium">Powiązanie z produktem</Label>
            <div className="grid grid-cols-3 gap-2">
              <Select value={selectedCategoryId} onValueChange={(v) => {
                setSelectedCategoryId(v);
                setSelectedSubcategoryId("");
                setSelectedProductId("");
              }}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Kategoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedSubcategoryId} onValueChange={(v) => {
                setSelectedSubcategoryId(v);
                setSelectedProductId("");
              }} disabled={!selectedCategoryId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Subkategoria" />
                </SelectTrigger>
                <SelectContent>
                  {getSubcategoriesForCategory(selectedCategoryId).map((sub) => (
                    <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedProductId} onValueChange={setSelectedProductId} disabled={!selectedSubcategoryId}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Produkt" />
                </SelectTrigger>
                <SelectContent>
                  {getProductsForSubcategory(selectedSubcategoryId).map((prod) => (
                    <SelectItem key={prod.id} value={prod.id.toString()}>{prod.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <RequiredLabel>Nazwa subproduktu</RequiredLabel>
              <Input placeholder="np. Ser Gouda Łowicz 200g" value={variantName} onChange={(e) => setVariantName(e.target.value)} className={getFieldClass("variantName")} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as "active" | "archived")}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktywny</SelectItem>
                  <SelectItem value="archived">Zarchiwizowany</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <RequiredLabel>Zawartość</RequiredLabel>
              <Input type="number" placeholder="500" value={content} onChange={(e) => setContent(e.target.value)} className={getFieldClass("content")} />
            </div>
            <div className="space-y-2">
              <RequiredLabel>Jednostka</RequiredLabel>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger className={getFieldClass("unit")}><SelectValue /></SelectTrigger>
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
            <Label>Marka (opcjonalne)</Label>
            <Input placeholder="np. Łowicz" value={brands} onChange={(e) => setBrands(e.target.value)} />
          </div>

          <div className="space-y-2">
            <RequiredLabel>SKU</RequiredLabel>
            <Input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} className={`font-mono ${getFieldClass("sku")}`} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Anuluj</Button>
          <Button onClick={handleSave} disabled={isSaving || (eanDuplicate?.exists ?? false)}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductsConfig;
