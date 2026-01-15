import { useState, useRef, useEffect, useCallback } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Database, 
  RotateCcw, 
  Save, 
  Loader2,
  Wheat,
  Milk,
  Egg,
  Fish,
  Nut,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

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

// Mock nutrition database entries
const mockNutritionDatabase = [
  { id: 1, name: "Ser gouda" },
  { id: 2, name: "Ser edamski" },
  { id: 3, name: "Twaróg półtłusty" },
  { id: 4, name: "Szynka wieprzowa gotowana" },
  { id: 5, name: "Kiełbasa podwawelska" },
  { id: 6, name: "Marchew surowa" },
  { id: 7, name: "Pietruszka korzeń" },
];

export interface SubProductData {
  id: number;
  product_id: number;
  name: string;
  status: "active" | "archived";
  nutrition_database_id: number | null;
  allergens: string[];
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

interface EditSubProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subProduct: SubProductData | null;
  onSave: (data: SubProductData) => Promise<void>;
}

export const EditSubProductDialog = ({
  open,
  onOpenChange,
  subProduct,
  onSave,
}: EditSubProductDialogProps) => {
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [name, setName] = useState("");
  const [status, setStatus] = useState<"active" | "archived">("active");
  const [nutritionDatabaseId, setNutritionDatabaseId] = useState<string>("none");
  const [allergens, setAllergens] = useState<string[]>([]);
  
  // Nutritional values state
  const [energyKj, setEnergyKj] = useState("");
  const [energyKcal, setEnergyKcal] = useState("");
  const [energyKj1169, setEnergyKj1169] = useState("");
  const [energyKcal1169, setEnergyKcal1169] = useState("");
  const [water, setWater] = useState("");
  const [proteinAnimal, setProteinAnimal] = useState("");
  const [proteinPlant, setProteinPlant] = useState("");
  const [fat, setFat] = useState("");
  const [carbohydrates, setCarbohydrates] = useState("");
  const [fiber, setFiber] = useState("");
  const [sodium, setSodium] = useState("");
  const [salt, setSalt] = useState("");
  const [potassium, setPotassium] = useState("");
  const [calcium, setCalcium] = useState("");
  const [phosphorus, setPhosphorus] = useState("");
  const [magnesium, setMagnesium] = useState("");
  const [iron, setIron] = useState("");
  const [vitaminD, setVitaminD] = useState("");
  const [vitaminC, setVitaminC] = useState("");
  const [cholesterol, setCholesterol] = useState("");

  // Load data when dialog opens
  useEffect(() => {
    if (open && subProduct) {
      setName(subProduct.name);
      setStatus(subProduct.status);
      setNutritionDatabaseId(subProduct.nutrition_database_id?.toString() || "none");
      setAllergens(subProduct.allergens || []);
      
      setEnergyKj(subProduct.energy_kj?.toString() || "");
      setEnergyKcal(subProduct.energy_kcal?.toString() || "");
      setEnergyKj1169(subProduct.energy_kj_1169?.toString() || "");
      setEnergyKcal1169(subProduct.energy_kcal_1169?.toString() || "");
      setWater(subProduct.water?.toString() || "");
      setProteinAnimal(subProduct.protein_animal?.toString() || "");
      setProteinPlant(subProduct.protein_plant?.toString() || "");
      setFat(subProduct.fat?.toString() || "");
      setCarbohydrates(subProduct.carbohydrates?.toString() || "");
      setFiber(subProduct.fiber?.toString() || "");
      setSodium(subProduct.sodium?.toString() || "");
      setSalt(subProduct.salt?.toString() || "");
      setPotassium(subProduct.potassium?.toString() || "");
      setCalcium(subProduct.calcium?.toString() || "");
      setPhosphorus(subProduct.phosphorus?.toString() || "");
      setMagnesium(subProduct.magnesium?.toString() || "");
      setIron(subProduct.iron?.toString() || "");
      setVitaminD(subProduct.vitamin_d?.toString() || "");
      setVitaminC(subProduct.vitamin_c?.toString() || "");
      setCholesterol(subProduct.cholesterol?.toString() || "");
    }
  }, [open, subProduct]);

  const toggleAllergen = (allergenId: string) => {
    setAllergens(prev => 
      prev.includes(allergenId) 
        ? prev.filter(id => id !== allergenId)
        : [...prev, allergenId]
    );
  };

  const handleCopyFromDatabase = () => {
    // This would copy nutritional values from the selected nutrition database entry
    toast.info("Funkcja kopiowania danych z bazy IŻŻ zostanie wkrótce dodana");
  };

  const handleSave = async () => {
    if (!subProduct) return;
    
    if (!name.trim()) {
      toast.error("Nazwa subproduktu jest wymagana");
      return;
    }

    setIsSaving(true);
    try {
      const data: SubProductData = {
        ...subProduct,
        name: name.trim(),
        status,
        nutrition_database_id: nutritionDatabaseId !== "none" ? parseInt(nutritionDatabaseId) : null,
        allergens,
        energy_kj: energyKj ? parseFloat(energyKj) : null,
        energy_kcal: energyKcal ? parseFloat(energyKcal) : null,
        energy_kj_1169: energyKj1169 ? parseFloat(energyKj1169) : null,
        energy_kcal_1169: energyKcal1169 ? parseFloat(energyKcal1169) : null,
        water: water ? parseFloat(water) : null,
        protein_animal: proteinAnimal ? parseFloat(proteinAnimal) : null,
        protein_plant: proteinPlant ? parseFloat(proteinPlant) : null,
        fat: fat ? parseFloat(fat) : null,
        carbohydrates: carbohydrates ? parseFloat(carbohydrates) : null,
        fiber: fiber ? parseFloat(fiber) : null,
        sodium: sodium ? parseFloat(sodium) : null,
        salt: salt ? parseFloat(salt) : null,
        potassium: potassium ? parseFloat(potassium) : null,
        calcium: calcium ? parseFloat(calcium) : null,
        phosphorus: phosphorus ? parseFloat(phosphorus) : null,
        magnesium: magnesium ? parseFloat(magnesium) : null,
        iron: iron ? parseFloat(iron) : null,
        vitamin_d: vitaminD ? parseFloat(vitaminD) : null,
        vitamin_c: vitaminC ? parseFloat(vitaminC) : null,
        cholesterol: cholesterol ? parseFloat(cholesterol) : null,
      };
      
      await onSave(data);
      toast.success("Subprodukt został zaktualizowany");
      onOpenChange(false);
    } catch (error: any) {
      toast.error("Błąd podczas zapisywania: " + error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edytuj subprodukt</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nazwa subproduktu *</Label>
              <Input 
                placeholder="np. Ser Gouda" 
                value={name}
                onChange={(e) => setName(e.target.value)}
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
          
          <Separator />
          
          {/* Nutrition database link */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Powiąż z bazą Instytutu Żywienia
            </Label>
            <div className="flex gap-2">
              <Select value={nutritionDatabaseId} onValueChange={setNutritionDatabaseId}>
                <SelectTrigger className="flex-1">
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
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2"
                onClick={handleCopyFromDatabase}
                disabled={nutritionDatabaseId === "none"}
              >
                <RotateCcw className="h-4 w-4" />
                Przepisz wartości
              </Button>
            </div>
          </div>
          
          <Separator />
          
          {/* Allergens */}
          <div className="space-y-2">
            <Label>Alergeny</Label>
            <div className="grid grid-cols-3 gap-2">
              {allergensList.map((allergen) => (
                <div key={allergen.id} className="flex items-center gap-2">
                  <Checkbox 
                    id={`edit-allergen-${allergen.id}`} 
                    checked={allergens.includes(allergen.id)}
                    onCheckedChange={() => toggleAllergen(allergen.id)}
                  />
                  <Label 
                    htmlFor={`edit-allergen-${allergen.id}`} 
                    className="flex items-center gap-1 text-sm cursor-pointer"
                  >
                    {allergen.icon}
                    {allergen.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
          
          <Separator />
          
          {/* Nutritional Values */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Wartości odżywcze (na 100g)</Label>
            <p className="text-xs text-muted-foreground">
              Możesz przepisać wartości z bazy Instytutu Żywienia lub wpisać ręcznie
            </p>
            
            {/* Energy */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Wartość energetyczna</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Energia (kJ)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={energyKj}
                    onChange={(e) => setEnergyKj(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Energia (kcal)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={energyKcal}
                    onChange={(e) => setEnergyKcal(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Energy 1169/2011 */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Wartość energetyczna wg rozp. 1169/2011</Label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Energia (kJ)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={energyKj1169}
                    onChange={(e) => setEnergyKj1169(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Energia (kcal)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={energyKcal1169}
                    onChange={(e) => setEnergyKcal1169(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Basic nutrients */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Składniki podstawowe</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Woda (g/100g)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={water}
                    onChange={(e) => setWater(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Białko zwierzęce (g/100g)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={proteinAnimal}
                    onChange={(e) => setProteinAnimal(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Białko roślinne (g/100g)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={proteinPlant}
                    onChange={(e) => setProteinPlant(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tłuszcz (g/100g)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={fat}
                    onChange={(e) => setFat(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Węglowodany przyswajalne (g/100g)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={carbohydrates}
                    onChange={(e) => setCarbohydrates(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Błonnik pokarmowy (g/100g)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={fiber}
                    onChange={(e) => setFiber(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Minerals */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Składniki mineralne</Label>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Sód (mg)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={sodium}
                    onChange={(e) => setSodium(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Sól (g)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={salt}
                    onChange={(e) => setSalt(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Potas (mg)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={potassium}
                    onChange={(e) => setPotassium(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Wapń (mg)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={calcium}
                    onChange={(e) => setCalcium(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Fosfor (mg)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Magnez (mg)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={magnesium}
                    onChange={(e) => setMagnesium(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Żelazo (mg)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={iron}
                    onChange={(e) => setIron(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Vitamins and others */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Witaminy i inne</Label>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Witamina D (mg)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={vitaminD}
                    onChange={(e) => setVitaminD(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Witamina C (mg)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={vitaminC}
                    onChange={(e) => setVitaminC(e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Cholesterol (mg)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    value={cholesterol}
                    onChange={(e) => setCholesterol(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Anuluj
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSubProductDialog;
