import { useState, useRef, useEffect, useCallback } from "react";
import Layout from "@/components/Layout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

// API imports
import { fetchCategories, fetchSubcategories, ProductCategory, ProductSubcategory } from "@/api/productCategories";
import { getProducts, createProduct, updateProduct, archiveProduct, Product as ApiProduct } from "@/api/products";
import { getProductVariants, createProductVariant, updateProductVariant, archiveProductVariant, checkEan, ProductVariant as ApiVariant, EanCheckResult } from "@/api/productVariants";

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

// Frontend types for hierarchical display - Simplified: Category > Subcategory > Product > Subproduct (variant)
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
  allergens: string[];
  nutrition_database_id: number | null;
  energy_kj: number | null;
  energy_kcal: number | null;
  energy_kj_1169: number | null;
  energy_kcal_1169: number | null;
  water: number | null;
  protein_animal: number | null;
  protein_plant: number | null;
  fat: number | null;
  carbohydrates: number | null;
  fiber: number | null;
  sodium: number | null;
  salt: number | null;
  potassium: number | null;
  calcium: number | null;
  phosphorus: number | null;
  magnesium: number | null;
  iron: number | null;
  vitamin_d: number | null;
  vitamin_c: number | null;
  cholesterol: number | null;
}

interface DisplayProduct {
  id: number;
  subcategory_id: number;
  name: string;
  description: string;
  status: "active" | "archived";
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

// Mock nutrition database entries (will be replaced with real API later)
const mockNutritionDatabase = [
  { id: 1, name: "Ser gouda" },
  { id: 2, name: "Ser edamski" },
  { id: 3, name: "Twaróg półtłusty" },
  { id: 4, name: "Szynka wieprzowa gotowana" },
  { id: 5, name: "Kiełbasa podwawelska" },
  { id: 6, name: "Marchew surowa" },
  { id: 7, name: "Pietruszka korzeń" },
];

// Expanded state types
type ExpandedState = {
  categories: Set<number>;
  subcategories: Set<number>;
  products: Set<number>;
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

  // Form states for Add Product dialog
  const [newProductCategoryId, setNewProductCategoryId] = useState<string>("");
  const [newProductSubcategoryId, setNewProductSubcategoryId] = useState<string>("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Load all data from database - preserves expansion state
  const loadData = useCallback(async (preserveExpansion = false) => {
    setIsLoading(true);
    const prevExpanded = preserveExpansion ? { ...expanded, categories: new Set(expanded.categories), subcategories: new Set(expanded.subcategories), products: new Set(expanded.products) } : null;
    
    try {
      // Fetch categories
      const dbCategories = await fetchCategories("all");
      
      // Fetch all subcategories
      const dbSubcategories = await fetchSubcategories();
      
      // Fetch all products
      const dbProducts = await getProducts();
      
      // Fetch all subproducts (variants)
      const dbSubProducts = await getProductVariants();

      // Build hierarchical structure: Category > Subcategory > Product > Subproduct
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
                    allergens: sp.allergens || [],
                    nutrition_database_id: sp.nutrition_database_id,
                    energy_kj: sp.energy_kj,
                    energy_kcal: sp.energy_kcal,
                    energy_kj_1169: sp.energy_kj_1169,
                    energy_kcal_1169: sp.energy_kcal_1169,
                    water: sp.water,
                    protein_animal: sp.protein_animal,
                    protein_plant: sp.protein_plant,
                    fat: sp.fat,
                    carbohydrates: sp.carbohydrates,
                    fiber: sp.fiber,
                    sodium: sp.sodium,
                    salt: sp.salt,
                    potassium: sp.potassium,
                    calcium: sp.calcium,
                    phosphorus: sp.phosphorus,
                    magnesium: sp.magnesium,
                    iron: sp.iron,
                    vitamin_d: sp.vitamin_d,
                    vitamin_c: sp.vitamin_c,
                    cholesterol: sp.cholesterol,
                  })),
              })),
          })),
      }));

      setCategories(displayCategories);
      
      // Preserve expansion state or expand first category
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

  // Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

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

  // Filter logic for search and archived
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
      .filter(
        (cat) =>
          cat.subcategories.length > 0 || !search.trim()
      );
  };

  const filteredCategories = filterCategories(categories);

  // Count totals
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

  const unlinkedCount = categories.reduce(
    (acc, cat) =>
      acc +
      cat.subcategories.reduce(
        (a, sub) =>
          a + sub.products.reduce(
            (b, prod) => b + prod.subProducts.filter(sp => !sp.nutrition_database_id && sp.status === "active").length,
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

  // Get subcategories for selected category
  const getSubcategoriesForCategory = (categoryId: string) => {
    const cat = categories.find(c => c.id === parseInt(categoryId));
    return cat?.subcategories || [];
  };

  // Handle adding new product
  const handleAddProduct = async () => {
    if (!newProductSubcategoryId || !newProductName.trim()) {
      toast.error("Wypełnij wszystkie wymagane pola");
      return;
    }

    setIsSavingProduct(true);
    try {
      await createProduct({
        subcategory_id: parseInt(newProductSubcategoryId),
        name: newProductName.trim(),
        description: newProductDescription.trim(),
        status: "active",
      });
      toast.success("Produkt został dodany");
      setAddProductDialogOpen(false);
      setNewProductCategoryId("");
      setNewProductSubcategoryId("");
      setNewProductName("");
      setNewProductDescription("");
      loadData(true);
    } catch (error: any) {
      toast.error("Błąd: " + error.message);
    } finally {
      setIsSavingProduct(false);
    }
  };

  // Handle editing product
  const handleEditProduct = async (name: string, description: string, status: "active" | "archived") => {
    if (selectedItem.type !== "product" || !selectedItem.data) return;
    
    const product = selectedItem.data as DisplayProduct;
    try {
      await updateProduct({
        id: product.id,
        subcategory_id: product.subcategory_id,
        name,
        description,
        status,
      });
      toast.success("Produkt został zaktualizowany");
      setEditProductDialogOpen(false);
      loadData(true);
    } catch (error: any) {
      toast.error("Błąd: " + error.message);
    }
  };

  // Handle archiving subproduct
  const handleArchiveSubProduct = async (subProductId: number) => {
    try {
      await archiveProductVariant(subProductId);
      toast.success("Subprodukt został zarchiwizowany");
      setSelectedItem({ type: null, data: null });
      loadData(true);
    } catch (error: any) {
      toast.error("Błąd: " + error.message);
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
                                            (selectedItem.data as DisplayProduct)?.id === product.id
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

                                        {/* SubProducts (variants) */}
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
                                                {subProduct.nutrition_database_id ? (
                                                  <Tooltip>
                                                    <TooltipTrigger>
                                                      <Link2 className="h-3 w-3 text-green-600" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>Powiązany z bazą IŻŻ</TooltipContent>
                                                  </Tooltip>
                                                ) : (
                                                  <Tooltip>
                                                    <TooltipTrigger>
                                                      <Link2Off className="h-3 w-3 text-red-500" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>Brak powiązania z bazą IŻŻ</TooltipContent>
                                                  </Tooltip>
                                                )}
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
                onAddSubProduct={() => setAddSubProductDialogOpen(true)}
                onEditProduct={() => setEditProductDialogOpen(true)}
                onArchive={async () => {
                  const product = selectedItem.data as DisplayProduct;
                      try {
                        await archiveProduct(product.id);
                        toast.success("Produkt został zarchiwizowany");
                        setSelectedItem({ type: null, data: null });
                        loadData(true);
                      } catch (error: any) {
                        toast.error("Błąd: " + error.message);
                      }
                }}
              />
            ) : selectedItem.type === "subProduct" ? (
              <SubProductManagementPanel
                subProduct={selectedItem.data as DisplaySubProduct}
                parentProduct={selectedItem.parentProduct!}
                allergensList={allergensList}
                renderAllergenBadge={renderAllergenBadge}
                onEditSubProduct={() => setEditSubProductDialogOpen(true)}
                nutritionDatabase={mockNutritionDatabase}
                onArchive={() => handleArchiveSubProduct((selectedItem.data as DisplaySubProduct).id)}
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
              <Label>Kategoria *</Label>
              <Select value={newProductCategoryId} onValueChange={(v) => {
                setNewProductCategoryId(v);
                setNewProductSubcategoryId("");
              }}>
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
              <Label>Subkategoria *</Label>
              <Select 
                value={newProductSubcategoryId} 
                onValueChange={setNewProductSubcategoryId}
                disabled={!newProductCategoryId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Wybierz subkategorię" />
                </SelectTrigger>
                <SelectContent>
                  {getSubcategoriesForCategory(newProductCategoryId).map((sub) => (
                    <SelectItem key={sub.id} value={sub.id.toString()}>
                      {sub.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Nazwa produktu *</Label>
              <Input 
                placeholder="np. Ser żółty" 
                value={newProductName}
                onChange={(e) => setNewProductName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Input 
                placeholder="Krótki opis produktu" 
                value={newProductDescription}
                onChange={(e) => setNewProductDescription(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddProductDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleAddProduct} disabled={isSavingProduct}>
              {isSavingProduct ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Zapisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Product Dialog */}
      <EditProductDialog
        open={editProductDialogOpen}
        onOpenChange={setEditProductDialogOpen}
        product={selectedItem.type === "product" ? selectedItem.data as DisplayProduct : null}
        onSave={handleEditProduct}
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

// Edit Product Dialog Component
const EditProductDialog = ({
  open,
  onOpenChange,
  product,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: DisplayProduct | null;
  onSave: (name: string, description: string, status: "active" | "archived") => Promise<void>;
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (open && product) {
      setName(product.name);
      setDescription(product.description);
      setStatus(product.status);
    }
  }, [open, product]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onSave(name, description, status);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edytuj produkt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Nazwa produktu *</Label>
            <Input 
              placeholder="np. Ser żółty" 
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Opis</Label>
            <Input 
              placeholder="Krótki opis produktu" 
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "active" | "archived")}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Product Management Panel Component - with nutritional info from subproducts
const ProductManagementPanel = ({
  product,
  onAddSubProduct,
  onEditProduct,
  onArchive,
}: {
  product: DisplayProduct;
  onAddSubProduct: () => void;
  onEditProduct: () => void;
  onArchive: () => void;
}) => {
  // Get nutritional values from first active subproduct (representative)
  const activeSubProducts = product.subProducts.filter(sp => sp.status === "active");
  const representativeSubProduct = activeSubProducts[0];
  
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
        </div>

        {/* Nutritional info from subproducts */}
        {representativeSubProduct && (representativeSubProduct.energy_kcal || representativeSubProduct.fat || representativeSubProduct.carbohydrates) && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Wartości odżywcze (na 100g) - z subproduktu: {representativeSubProduct.name}</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {representativeSubProduct.energy_kcal && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Energia</span>
                    <span className="font-medium">{representativeSubProduct.energy_kcal} kcal</span>
                  </div>
                )}
                {representativeSubProduct.energy_kj && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Energia</span>
                    <span className="font-medium">{representativeSubProduct.energy_kj} kJ</span>
                  </div>
                )}
                {(representativeSubProduct.protein_animal || representativeSubProduct.protein_plant) && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Białko</span>
                    <span className="font-medium">
                      {((representativeSubProduct.protein_animal || 0) + (representativeSubProduct.protein_plant || 0)).toFixed(1)} g
                    </span>
                  </div>
                )}
                {representativeSubProduct.fat && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Tłuszcz</span>
                    <span className="font-medium">{representativeSubProduct.fat} g</span>
                  </div>
                )}
                {representativeSubProduct.carbohydrates && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Węglowodany</span>
                    <span className="font-medium">{representativeSubProduct.carbohydrates} g</span>
                  </div>
                )}
                {representativeSubProduct.fiber && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Błonnik</span>
                    <span className="font-medium">{representativeSubProduct.fiber} g</span>
                  </div>
                )}
                {representativeSubProduct.salt && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Sól</span>
                    <span className="font-medium">{representativeSubProduct.salt} g</span>
                  </div>
                )}
                {representativeSubProduct.water && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Woda</span>
                    <span className="font-medium">{representativeSubProduct.water} g</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* Allergens from all subproducts */}
        {activeSubProducts.some(sp => sp.allergens && sp.allergens.length > 0) && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Alergeny (ze wszystkich subproduktów)</Label>
              <div className="flex flex-wrap gap-1">
                {[...new Set(activeSubProducts.flatMap(sp => sp.allergens || []))].map(allergenId => {
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
            className="w-full gap-2 text-orange-600 hover:text-orange-700"
            onClick={onArchive}
          >
            <Archive className="h-4 w-4" />
            {product.status === "active" ? "Archiwizuj" : "Przywróć"}
          </Button>
        </div>
      </div>
    </ScrollArea>
  );
};

// SubProduct Management Panel Component
const SubProductManagementPanel = ({
  subProduct,
  parentProduct,
  allergensList,
  renderAllergenBadge,
  onEditSubProduct,
  nutritionDatabase,
  onArchive,
}: {
  subProduct: DisplaySubProduct;
  parentProduct: DisplayProduct;
  allergensList: AllergenItem[];
  renderAllergenBadge: (id: string) => React.ReactNode;
  onEditSubProduct: () => void;
  nutritionDatabase: { id: number; name: string }[];
  onArchive: () => void;
}) => {
  const linkedEntry = nutritionDatabase.find(e => e.id === subProduct.nutrition_database_id);
  
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
                Brak powiązania
              </Badge>
            )}
          </div>
        </div>

        {/* Allergens */}
        {subProduct.allergens && subProduct.allergens.length > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Alergeny</Label>
              <div className="flex flex-wrap gap-1">
                {subProduct.allergens.map(renderAllergenBadge)}
              </div>
            </div>
          </>
        )}

        {/* Nutritional info */}
        {(subProduct.energy_kcal || subProduct.fat || subProduct.carbohydrates) && (
          <>
            <Separator />
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Wartości odżywcze (na 100g)</Label>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {subProduct.energy_kcal && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Energia</span>
                    <span className="font-medium">{subProduct.energy_kcal} kcal</span>
                  </div>
                )}
                {(subProduct.protein_animal || subProduct.protein_plant) && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Białko</span>
                    <span className="font-medium">
                      {((subProduct.protein_animal || 0) + (subProduct.protein_plant || 0)).toFixed(1)} g
                    </span>
                  </div>
                )}
                {subProduct.fat && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Tłuszcz</span>
                    <span className="font-medium">{subProduct.fat} g</span>
                  </div>
                )}
                {subProduct.carbohydrates && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Węglowodany</span>
                    <span className="font-medium">{subProduct.carbohydrates} g</span>
                  </div>
                )}
                {subProduct.fiber && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Błonnik</span>
                    <span className="font-medium">{subProduct.fiber} g</span>
                  </div>
                )}
                {subProduct.salt && (
                  <div className="flex justify-between p-1.5 bg-muted/30 rounded">
                    <span>Sól</span>
                    <span className="font-medium">{subProduct.salt} g</span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        <Separator />

        <div className="space-y-2">
          <Button variant="outline" className="w-full gap-2" onClick={onEditSubProduct}>
            <Pencil className="h-4 w-4" />
            Edytuj subprodukt
          </Button>
          <Button 
            variant="outline" 
            className="w-full gap-2 text-orange-600 hover:text-orange-700"
            onClick={onArchive}
          >
            <Archive className="h-4 w-4" />
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

// Add SubProduct Dialog Component - with EAN scanning
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

  // Auto-focus and reset
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

  // Cleanup scanner
  useEffect(() => {
    return () => {
      if (html5QrCode) html5QrCode.stop().catch(() => {});
    };
  }, [html5QrCode]);

  // Generate SKU
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

  // Fetch from OpenFoodFacts
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

          {/* EAN duplicate warning */}
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
            <Label>Kalorie (kcal/100g)</Label>
            <Input type="number" placeholder="0" value={calories} onChange={(e) => setCalories(e.target.value)} />
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

        {productCategories && (
          <div className="pt-2 pb-4 border-t">
            <p className="text-xs text-muted-foreground"><span className="font-medium">Kategorie:</span> {productCategories}</p>
          </div>
        )}

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

// Edit SubProduct Dialog Component - simplified like AddSubProductDialog with parent product change
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
  const [calories, setCalories] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [brands, setBrands] = useState("");
  const [productCategories, setProductCategories] = useState("");
  
  // Parent product selection
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string>("");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [productFound, setProductFound] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [eanDuplicate, setEanDuplicate] = useState<EanCheckResult | null>(null);

  // Get subcategories for selected category
  const getSubcategoriesForCategory = (categoryId: string) => {
    const cat = categories.find(c => c.id === parseInt(categoryId));
    return cat?.subcategories || [];
  };

  // Get products for selected subcategory
  const getProductsForSubcategory = (subcategoryId: string) => {
    for (const cat of categories) {
      const sub = cat.subcategories.find(s => s.id === parseInt(subcategoryId));
      if (sub) return sub.products;
    }
    return [];
  };

  // Track missing fields
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

  // Load data when dialog opens
  useEffect(() => {
    if (open && subProduct) {
      setEan(subProduct.ean || "");
      setVariantName(subProduct.name || "");
      setContent(subProduct.content || "");
      setUnit(subProduct.unit || "g");
      setSku(subProduct.sku || "");
      setStatus(subProduct.status || "active");
      setCalories(subProduct.energy_kcal?.toString() || "");
      setBrands(subProduct.brands || "");
      setProductCategories(subProduct.categories || "");
      setImageUrl(subProduct.image_url || "");
      setDataFetched(true);
      setEanDuplicate(null);
      
      // Find parent product and set selection
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

  // Cleanup scanner
  useEffect(() => {
    return () => {
      if (html5QrCode) html5QrCode.stop().catch(() => {});
    };
  }, [html5QrCode]);

  // Generate SKU
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

  // Fetch from OpenFoodFacts
  const fetchProductData = async (eanCode: string) => {
    if (!eanCode || eanCode.length < 8) {
      toast.error("Wprowadź prawidłowy kod EAN (min. 8 znaków)");
      return;
    }

    setIsLoading(true);
    setProductFound(false);
    setEanDuplicate(null);

    try {
      // First check if EAN exists in database
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
      // Check for duplicate EAN
      try {
        const eanCheck = await checkEan(numericValue, subProduct?.id);
        if (eanCheck.exists) {
          setEanDuplicate(eanCheck);
        }
      } catch (error) {
        // Ignore error for EAN check
      }
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
          const scannerId = "edit-ean-scanner-" + Date.now();
          scannerRef.current.id = scannerId;
          const scanner = new Html5Qrcode(scannerId);
          setHtml5QrCode(scanner);
          try {
            await scanner.start(
              { facingMode: "environment" },
              { fps: 10, qrbox: { width: 250, height: 100 } },
              async (decodedText) => {
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
        allergens: subProduct.allergens || [],
        nutrition_database_id: subProduct.nutrition_database_id,
        energy_kj: subProduct.energy_kj,
        energy_kcal: calories ? parseFloat(calories) : subProduct.energy_kcal,
        energy_kj_1169: subProduct.energy_kj_1169,
        energy_kcal_1169: subProduct.energy_kcal_1169,
        water: subProduct.water,
        protein_animal: subProduct.protein_animal,
        protein_plant: subProduct.protein_plant,
        fat: subProduct.fat,
        carbohydrates: subProduct.carbohydrates,
        fiber: subProduct.fiber,
        sodium: subProduct.sodium,
        salt: subProduct.salt,
        potassium: subProduct.potassium,
        calcium: subProduct.calcium,
        phosphorus: subProduct.phosphorus,
        magnesium: subProduct.magnesium,
        iron: subProduct.iron,
        vitamin_d: subProduct.vitamin_d,
        vitamin_c: subProduct.vitamin_c,
        cholesterol: subProduct.cholesterol,
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
          {/* EAN input with scanner */}
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
                  className={`pr-10 font-mono text-lg ${getFieldClass("ean")} ${eanDuplicate?.exists ? "border-red-500" : ""}`}
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

          {/* EAN duplicate warning */}
          {eanDuplicate?.exists && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Ten kod EAN już istnieje w bazie!</p>
                <p className="text-xs mt-1">Ścieżka: {eanDuplicate.path}</p>
              </div>
            </div>
          )}

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
            <Label>Kalorie (kcal/100g)</Label>
            <Input type="number" placeholder="0" value={calories} onChange={(e) => setCalories(e.target.value)} />
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

        {productCategories && (
          <div className="pt-2 pb-4 border-t">
            <p className="text-xs text-muted-foreground"><span className="font-medium">Kategorie:</span> {productCategories}</p>
          </div>
        )}

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
