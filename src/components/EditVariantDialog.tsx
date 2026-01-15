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
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Barcode, 
  Camera, 
  Download, 
  ExternalLink, 
  Loader2, 
  Save, 
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { updateProductVariant, ProductVariant } from "@/api/productVariants";

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

interface EditVariantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  variant: ProductVariant | null;
  onSave?: () => void;
}

export const EditVariantDialog = ({
  open,
  onOpenChange,
  variant,
  onSave,
}: EditVariantDialogProps) => {
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

  // Load variant data when dialog opens
  useEffect(() => {
    if (open && variant) {
      setEan(variant.ean || "");
      setVariantName(variant.name || "");
      setContent(variant.content || "");
      setUnit(variant.unit || "g");
      setSku(variant.sku || "");
      setCalories(variant.kcal?.toString() || "");
      setImageUrl(variant.image_url || "");
      setBrands(variant.brands || "");
      setCategories(variant.categories || "");
      setProductFound(false);
      setDataFetched(false);
      setIsScannerOpen(false);
    }
  }, [open, variant]);

  // Cleanup scanner when dialog closes
  useEffect(() => {
    return () => {
      if (html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
    };
  }, [html5QrCode]);

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

        if (product.image_front_small_url) {
          setImageUrl(product.image_front_small_url);
        }

        if (product.brands) {
          setBrands(product.brands);
        }

        if (product.categories) {
          setCategories(product.categories);
        }

        // Update SKU
        if (productName) {
          const newContent = product.quantity?.match(/(\d+(?:[.,]\d+)?)/)?.[1]?.replace(",", ".") || content;
          setSku(generateSku(productName, newContent, unit));
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

  const handleEanChange = (value: string) => {
    const numericValue = value.replace(/\D/g, "");
    setEan(numericValue);

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

  // Camera scanner toggle
  const toggleScanner = async () => {
    if (isScannerOpen) {
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
              (decodedText) => {
                const numericValue = decodedText.replace(/\D/g, "");
                setEan(numericValue);
                setIsScannerOpen(false);
                scanner.stop().catch(() => {});
                toast.success("Kod zeskanowany!");
                
                if (numericValue.length >= 8) {
                  setTimeout(() => fetchProductData(numericValue), 100);
                }
              },
              () => {}
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

  const handleSave = async () => {
    if (!variant) return;
    
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
      setDataFetched(true);
      return;
    }

    setIsSaving(true);
    try {
      await updateProductVariant({
        id: variant.id,
        subproduct_id: variant.subproduct_id,
        ean,
        name: variantName,
        content,
        unit,
        sku,
        kcal: calories ? parseFloat(calories) : null,
        brands,
        categories,
        image_url: imageUrl,
      });
      toast.success("Wariant został zaktualizowany!");
      onSave?.();
      onOpenChange(false);
    } catch (error: any) {
      if (error.message === "EAN_ALREADY_EXISTS") {
        toast.error("Wariant z tym kodem EAN już istnieje w bazie");
      } else {
        toast.error("Błąd podczas zapisywania wariantu: " + error.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const RequiredLabel = ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
    <Label htmlFor={htmlFor} className="flex items-center gap-1">
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
      if (!value && html5QrCode) {
        html5QrCode.stop().catch(() => {});
      }
      onOpenChange(value);
    }}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edytuj wariant</DialogTitle>
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
              Możesz ponownie pobrać dane z OpenFoodFacts aby zaktualizować informacje
            </p>
          </div>

          {/* Camera Scanner */}
          {isScannerOpen && (
            <div className="relative rounded-lg overflow-hidden bg-black">
              <div ref={scannerRef} className="w-full aspect-video" />
              <Button 
                variant="secondary" 
                size="sm" 
                className="absolute top-2 right-2 gap-1"
                onClick={() => {
                  if (html5QrCode) html5QrCode.stop().catch(() => {});
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
          {(productFound || imageUrl) && (
            <div className="flex gap-4 p-4 bg-muted/50 rounded-lg">
              {imageUrl && (
                <img 
                  src={imageUrl} 
                  alt={variantName} 
                  className="w-20 h-20 object-contain rounded bg-white p-1"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1">
                <p className="font-medium">{variantName || "Nazwa produktu"}</p>
                <p className="text-sm text-muted-foreground">
                  {content} {unit} • {calories ? `${calories} kcal/100g` : "Brak danych o kaloriach"}
                </p>
                {brands && (
                  <p className="text-xs text-muted-foreground mt-1">Marka: {brands}</p>
                )}
                {productFound && (
                  <Badge variant="outline" className="mt-2 text-green-600 border-green-300">
                    <ExternalLink className="h-3 w-3 mr-1" />
                    OpenFoodFacts
                  </Badge>
                )}
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
            <RequiredLabel>SKU</RequiredLabel>
            <Input
              placeholder="SKU"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className={`font-mono ${getFieldClass("sku")}`}
            />
          </div>
        </div>

        {/* Categories footer */}
        {categories && (
          <div className="pt-2 pb-4 border-t">
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Kategorie:</span> {categories}
            </p>
          </div>
        )}

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

export default EditVariantDialog;
