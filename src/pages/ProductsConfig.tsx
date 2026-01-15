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
import { getSubProducts, createSubProduct, updateSubProduct, archiveSubProduct, SubProduct as ApiSubProduct } from "@/api/subproducts";
import { getProductVariants, createProductVariant, updateProductVariant, deleteProductVariant, ProductVariant as ApiVariant } from "@/api/productVariants";

// Dialog components
import EditSubProductDialog, { SubProductData } from "@/components/EditSubProductDialog";
import EditVariantDialog from "@/components/EditVariantDialog";

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
interface DisplayVariant {
  id: number;
  subproduct_id: number | null;
  name: string;
  ean: string;
  sku: string;
  content: string;
  unit: string;
  kcal: number | null;
  brands: string;
  categories: string;
  image_url: string;
  status: "active" | "archived";
}

interface DisplaySubProduct {
  id: number;
  product_id: number;
  name: string;
  status: "active" | "archived";
  nutrition_database_id: number | null;
  allergens: string[];
  variants: DisplayVariant[];
  // Nutritional values
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
  subProducts: Set<number>;
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
    subProducts: new Set(),
  });

  // Selected item for management panel
  const [selectedItem, setSelectedItem] = useState<{
    type: "product" | "subProduct" | "variant" | null;
    data: DisplayProduct | DisplaySubProduct | DisplayVariant | null;
    parentProduct?: DisplayProduct;
    parentSubProduct?: DisplaySubProduct;
  }>({ type: null, data: null });

  // Dialogs
  const [addProductDialogOpen, setAddProductDialogOpen] = useState(false);
  const [editProductDialogOpen, setEditProductDialogOpen] = useState(false);
  const [addSubProductDialogOpen, setAddSubProductDialogOpen] = useState(false);
  const [editSubProductDialogOpen, setEditSubProductDialogOpen] = useState(false);
  const [addVariantDialogOpen, setAddVariantDialogOpen] = useState(false);
  const [editVariantDialogOpen, setEditVariantDialogOpen] = useState(false);

  // Form states for Add Product dialog
  const [newProductCategoryId, setNewProductCategoryId] = useState<string>("");
  const [newProductSubcategoryId, setNewProductSubcategoryId] = useState<string>("");
  const [newProductName, setNewProductName] = useState("");
  const [newProductDescription, setNewProductDescription] = useState("");
  const [isSavingProduct, setIsSavingProduct] = useState(false);

  // Form states for Add SubProduct dialog
  const [newSubProductName, setNewSubProductName] = useState("");
  const [isSavingSubProduct, setIsSavingSubProduct] = useState(false);

  // Load all data from database
  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch categories
      const dbCategories = await fetchCategories("all");
      
      // Fetch all subcategories
      const dbSubcategories = await fetchSubcategories();
      
      // Fetch all products
      const dbProducts = await getProducts();
      
      // Fetch all subproducts
      const dbSubProducts = await getSubProducts();
      
      // Fetch all variants
      const dbVariants = await getProductVariants();

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
                subProducts: dbSubProducts
                  .filter(sp => sp.product_id === prod.id)
                  .map(sp => ({
                    id: sp.id,
                    product_id: sp.product_id,
                    name: sp.name,
                    status: sp.status,
                    nutrition_database_id: sp.nutrition_database_id,
                    allergens: sp.allergens || [],
                    variants: dbVariants
                      .filter(v => v.subproduct_id === sp.id)
                      .map(v => ({
                        ...v,
                        status: "active" as const, // Variants don't have status yet
                      })),
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
      
      // Expand first category if exists
      if (displayCategories.length > 0 && expanded.categories.size === 0) {
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
  const totalVariants = categories.reduce(
    (acc, cat) =>
      acc +
      cat.subcategories.reduce(
        (a, sub) =>
          a +
          sub.products.reduce(
            (b, prod) =>
              b + prod.subProducts.reduce((c, sp) => c + sp.variants.length, 0),
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

  // Get nutrition database entry name
  const getNutritionEntryName = (id?: number | null) => {
    if (!id) return null;
    return mockNutritionDatabase.find(e => e.id === id)?.name;
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
      loadData();
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
      loadData();
    } catch (error: any) {
      toast.error("Błąd: " + error.message);
    }
  };

  // Handle adding new subproduct
  const handleAddSubProduct = async () => {
    if (selectedItem.type !== "product" || !selectedItem.data) return;
    if (!newSubProductName.trim()) {
      toast.error("Podaj nazwę subproduktu");
      return;
    }

    const product = selectedItem.data as DisplayProduct;
    setIsSavingSubProduct(true);
    try {
      await createSubProduct({
        product_id: product.id,
        name: newSubProductName.trim(),
        status: "active",
        nutrition_database_id: null,
        allergens: [],
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
      toast.success("Subprodukt został dodany");
      setAddSubProductDialogOpen(false);
      setNewSubProductName("");
      loadData();
    } catch (error: any) {
      toast.error("Błąd: " + error.message);
    } finally {
      setIsSavingSubProduct(false);
    }
  };

  // Handle saving subproduct from edit dialog
  const handleSaveSubProduct = async (data: SubProductData) => {
    await updateSubProduct({
      id: data.id,
      product_id: data.product_id,
      name: data.name,
      status: data.status,
      nutrition_database_id: data.nutrition_database_id,
      allergens: data.allergens,
      energy_kj: data.energy_kj,
      energy_kcal: data.energy_kcal,
      energy_kj_1169: data.energy_kj_1169,
      energy_kcal_1169: data.energy_kcal_1169,
      water: data.water,
      protein_animal: data.protein_animal,
      protein_plant: data.protein_plant,
      fat: data.fat,
      carbohydrates: data.carbohydrates,
      fiber: data.fiber,
      sodium: data.sodium,
      salt: data.salt,
      potassium: data.potassium,
      calcium: data.calcium,
      phosphorus: data.phosphorus,
      magnesium: data.magnesium,
      iron: data.iron,
      vitamin_d: data.vitamin_d,
      vitamin_c: data.vitamin_c,
      cholesterol: data.cholesterol,
    });
    loadData();
  };

  // Handle deleting variant
  const handleDeleteVariant = async (variantId: number) => {
    try {
      await deleteProductVariant(variantId);
      toast.success("Wariant został usunięty");
      setSelectedItem({ type: null, data: null });
      loadData();
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
            Zarządzaj hierarchią produktów: Kategoria → Subkategoria → Produkt → Subprodukt → Wariant EAN
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadData} disabled={isLoading}>
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

                                        {/* SubProducts */}
                                        {expanded.products.has(product.id) && (
                                          <div className="ml-6 space-y-1">
                                            {product.subProducts.map((subProduct) => (
                                              <div key={subProduct.id}>
                                                {/* SubProduct row */}
                                                <div
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
                                                  {subProduct.nutrition_database_id ? (
                                                    <Tooltip>
                                                      <TooltipTrigger>
                                                        <Link2 className="h-4 w-4 text-green-500" />
                                                      </TooltipTrigger>
                                                      <TooltipContent>
                                                        <p>Połączono z bazą IŻŻ: {getNutritionEntryName(subProduct.nutrition_database_id)}</p>
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
                                                          (selectedItem.data as DisplayVariant)?.id === variant.id
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
                product={selectedItem.data as DisplayProduct}
                onAddSubProduct={() => setAddSubProductDialogOpen(true)}
                onEditProduct={() => setEditProductDialogOpen(true)}
                onArchive={async () => {
                  const product = selectedItem.data as DisplayProduct;
                  try {
                    await archiveProduct(product.id);
                    toast.success("Produkt został zarchiwizowany");
                    setSelectedItem({ type: null, data: null });
                    loadData();
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
                onAddVariant={() => setAddVariantDialogOpen(true)}
                onEditSubProduct={() => setEditSubProductDialogOpen(true)}
                nutritionDatabase={mockNutritionDatabase}
                onArchive={async () => {
                  const subProduct = selectedItem.data as DisplaySubProduct;
                  try {
                    await archiveSubProduct(subProduct.id);
                    toast.success("Subprodukt został zarchiwizowany");
                    setSelectedItem({ type: null, data: null });
                    loadData();
                  } catch (error: any) {
                    toast.error("Błąd: " + error.message);
                  }
                }}
              />
            ) : selectedItem.type === "variant" ? (
              <VariantManagementPanel
                variant={selectedItem.data as DisplayVariant}
                parentSubProduct={selectedItem.parentSubProduct!}
                onEditVariant={() => setEditVariantDialogOpen(true)}
                onDeleteVariant={() => handleDeleteVariant((selectedItem.data as DisplayVariant).id)}
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
      <Dialog open={addSubProductDialogOpen} onOpenChange={setAddSubProductDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Dodaj subprodukt</DialogTitle>
            {selectedItem.type === "product" && (
              <p className="text-sm text-muted-foreground">
                Do produktu: {(selectedItem.data as DisplayProduct)?.name}
              </p>
            )}
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nazwa subproduktu *</Label>
              <Input 
                placeholder="np. Ser Gouda" 
                value={newSubProductName}
                onChange={(e) => setNewSubProductName(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSubProductDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleAddSubProduct} disabled={isSavingSubProduct}>
              {isSavingSubProduct ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Zapisz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit SubProduct Dialog */}
      <EditSubProductDialog
        open={editSubProductDialogOpen}
        onOpenChange={setEditSubProductDialogOpen}
        subProduct={selectedItem.type === "subProduct" ? selectedItem.data as SubProductData : null}
        onSave={handleSaveSubProduct}
      />

      {/* Add Variant Dialog */}
      <AddVariantDialog 
        open={addVariantDialogOpen} 
        onOpenChange={setAddVariantDialogOpen}
        parentSubProduct={selectedItem.type === "subProduct" ? selectedItem.data as DisplaySubProduct : null}
        onSave={() => loadData()}
      />

      {/* Edit Variant Dialog */}
      <EditVariantDialog
        open={editVariantDialogOpen}
        onOpenChange={setEditVariantDialogOpen}
        variant={selectedItem.type === "variant" ? {
          id: (selectedItem.data as DisplayVariant).id,
          subproduct_id: (selectedItem.data as DisplayVariant).subproduct_id,
          ean: (selectedItem.data as DisplayVariant).ean,
          name: (selectedItem.data as DisplayVariant).name,
          content: (selectedItem.data as DisplayVariant).content,
          unit: (selectedItem.data as DisplayVariant).unit,
          sku: (selectedItem.data as DisplayVariant).sku,
          kcal: (selectedItem.data as DisplayVariant).kcal,
          brands: (selectedItem.data as DisplayVariant).brands,
          categories: (selectedItem.data as DisplayVariant).categories,
          image_url: (selectedItem.data as DisplayVariant).image_url,
        } : null}
        onSave={() => loadData()}
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

// Product Management Panel Component
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
}) => (
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
        <span className="text-sm">Warianty EAN</span>
        <span className="font-medium">
          {product.subProducts.reduce((acc, sp) => acc + sp.variants.length, 0)}
        </span>
      </div>
    </div>

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
  onArchive,
}: {
  subProduct: DisplaySubProduct;
  parentProduct: DisplayProduct;
  allergensList: AllergenItem[];
  renderAllergenBadge: (id: string) => React.ReactNode;
  onAddVariant: () => void;
  onEditSubProduct: () => void;
  nutritionDatabase: { id: number; name: string }[];
  onArchive: () => void;
}) => {
  const linkedEntry = nutritionDatabase.find(e => e.id === subProduct.nutrition_database_id);
  
  return (
    <div className="p-4 space-y-4">
      <div>
        <Label className="text-xs text-muted-foreground">Subprodukt z: {parentProduct.name}</Label>
        <h3 className="text-lg font-semibold">{subProduct.name}</h3>
      </div>

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
        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
          <span className="text-sm">Warianty EAN</span>
          <span className="font-medium">{subProduct.variants.length}</span>
        </div>
      </div>

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
            </div>
          </div>
        </>
      )}

      {/* Allergens */}
      {subProduct.allergens.length > 0 && (
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

      <Separator />

      <div className="space-y-2">
        <Button variant="outline" className="w-full gap-2" onClick={onAddVariant}>
          <Plus className="h-4 w-4" />
          Dodaj wariant
        </Button>
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
  );
};

// Variant Management Panel Component
const VariantManagementPanel = ({
  variant,
  parentSubProduct,
  onEditVariant,
  onDeleteVariant,
}: {
  variant: DisplayVariant;
  parentSubProduct: DisplaySubProduct;
  onEditVariant: () => void;
  onDeleteVariant: () => void;
}) => (
  <div className="p-4 space-y-4">
    <div>
      <Label className="text-xs text-muted-foreground">Wariant z: {parentSubProduct.name}</Label>
      <h3 className="text-lg font-semibold">{variant.name}</h3>
    </div>

    {variant.image_url && (
      <div className="flex justify-center">
        <img 
          src={variant.image_url} 
          alt={variant.name}
          className="w-24 h-24 object-contain rounded bg-white p-1 border"
        />
      </div>
    )}

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
      {variant.kcal && (
        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
          <span className="text-sm">Kalorie</span>
          <span className="font-medium">{variant.kcal} kcal/100g</span>
        </div>
      )}
      {variant.brands && (
        <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
          <span className="text-sm">Marka</span>
          <span className="font-medium">{variant.brands}</span>
        </div>
      )}
    </div>

    <Separator />

    <div className="space-y-2">
      <Button variant="outline" className="w-full gap-2" onClick={onEditVariant}>
        <Pencil className="h-4 w-4" />
        Edytuj wariant
      </Button>
      <Button 
        variant="outline" 
        className="w-full gap-2 text-red-600 hover:text-red-700"
        onClick={onDeleteVariant}
      >
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
  };
}

// Add Variant Dialog Component
const AddVariantDialog = ({
  open,
  onOpenChange,
  parentSubProduct,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentSubProduct: DisplaySubProduct | null;
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
  const [categories, setCategories] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [productFound, setProductFound] = useState(false);
  const [dataFetched, setDataFetched] = useState(false);
  const [html5QrCode, setHtml5QrCode] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);

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
      setCategories("");
      setProductFound(false);
      setDataFetched(false);
      setIsScannerOpen(false);
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
        if (product.categories) setCategories(product.categories);

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

  const handleEanChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setEan(numericValue);
    if (numericValue.length === 13) fetchProductData(numericValue);
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
        ean: "Kod EAN", variantName: "Nazwa wariantu", content: "Zawartość", unit: "Jednostka", sku: "SKU",
      };
      toast.error(`Uzupełnij wymagane pola: ${missing.map(f => fieldNames[f]).join(", ")}`);
      setDataFetched(true);
      return;
    }

    setIsSaving(true);
    try {
      await createProductVariant({
        subproduct_id: parentSubProduct?.id || null,
        ean, name: variantName, content, unit, sku,
        kcal: calories ? parseFloat(calories) : null,
        brands, categories, image_url: imageUrl,
      });
      toast.success("Wariant został zapisany!");
      onSave?.();
      onOpenChange(false);
    } catch (error: any) {
      if (error.message === "EAN_ALREADY_EXISTS") {
        toast.error("Wariant z tym kodem EAN już istnieje");
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
          <DialogTitle>Dodaj wariant</DialogTitle>
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
            <RequiredLabel>Nazwa wariantu</RequiredLabel>
            <Input placeholder="np. Nutella 400g" value={variantName} onChange={(e) => setVariantName(e.target.value)} className={getFieldClass("variantName")} />
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
            <Input placeholder="np. Ferrero" value={brands} onChange={(e) => setBrands(e.target.value)} />
          </div>

          <div className="space-y-2">
            <RequiredLabel>SKU</RequiredLabel>
            <Input placeholder="SKU" value={sku} onChange={(e) => setSku(e.target.value)} className={`font-mono ${getFieldClass("sku")}`} />
          </div>
        </div>

        {categories && (
          <div className="pt-2 pb-4 border-t">
            <p className="text-xs text-muted-foreground"><span className="font-medium">Kategorie:</span> {categories}</p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>Anuluj</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            {isSaving ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ProductsConfig;
