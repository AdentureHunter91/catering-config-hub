import { useState, useEffect } from "react";
import DietLayout from "@/components/DietLayout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  FileSpreadsheet,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Database,
  Loader2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import * as XLSX from "xlsx";
import {
  getNutritionDatabaseStats,
  getNutritionDatabaseHistory,
  uploadNutritionDatabase,
  NutritionDatabaseStats,
  NutritionDatabaseUploadHistory,
} from "@/api/nutritionDatabase";

const NutritionDatabaseUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [stats, setStats] = useState<NutritionDatabaseStats | null>(null);
  const [history, setHistory] = useState<NutritionDatabaseUploadHistory[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Load stats and history on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoadingStats(true);
      const [statsData, historyData] = await Promise.all([
        getNutritionDatabaseStats(),
        getNutritionDatabaseHistory(10),
      ]);
      setStats(statsData);
      setHistory(historyData);
    } catch (error: any) {
      console.error("Error loading data:", error);
      // If tables don't exist yet, show empty state
      setStats({ records_count: 0, last_upload: null });
      setHistory([]);
    } finally {
      setIsLoadingStats(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    
    try {
      // Read the XLSX file
      const arrayBuffer = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      
      // Find the "BAZA DANYCH" sheet
      const sheetName = workbook.SheetNames.find(
        (name) => name.toUpperCase().includes("BAZA DANYCH") || name.toUpperCase().includes("BAZA_DANYCH")
      ) || workbook.SheetNames[0];
      
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to array of arrays
      const rawData: (string | number | null)[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: null,
      });
      
      // Skip header rows (first few rows are headers based on the parsed structure)
      // Row 1: Main headers
      // Row 2: Subheaders 
      // Row 3: More subheaders
      // Row 4: Units
      // Actual data starts from row 5 (index 4 or later)
      
      // Find the first row with actual data (starts with a number in column 0)
      let startRow = 0;
      for (let i = 0; i < Math.min(10, rawData.length); i++) {
        const firstCell = rawData[i][0];
        if (typeof firstCell === "number" && firstCell > 0) {
          startRow = i;
          break;
        }
      }
      
      // Parse records
      const records: Record<string, string | number | null>[] = [];
      
      for (let i = startRow; i < rawData.length; i++) {
        const row = rawData[i];
        
        // Skip empty rows or rows without a code
        if (!row || !row[1] || row[1] === "") continue;
        
        // Skip if first column is not a valid number (header row)
        const firstCell = row[0];
        if (typeof firstCell !== "number") continue;
        
        // Parse the row
        const record: Record<string, string | number | null> = {
          code: row[1]?.toString() || null,
          name_pl: row[2]?.toString() || null,
          name_en: row[3]?.toString() || null,
          waste_percent: row[5],
          energy_kj: row[6],
          energy_kcal: row[7],
          energy_kj_1169: row[8],
          energy_kcal_1169: row[9],
          water: row[10],
          protein_total: row[11],
          protein_animal: row[12],
          protein_plant: row[13],
          protein_1169: row[14],
          fat: row[15],
          carbohydrates_total: row[16],
          carbohydrates_available: row[17],
          ash: row[18],
          sodium: row[19],
          salt: row[20],
          potassium: row[21],
          calcium: row[22],
          phosphorus: row[23],
          magnesium: row[24],
          iron: row[25],
          zinc: row[26],
          copper: row[27],
          manganese: row[28],
          iodine: row[29],
          vitamin_a: row[30],
          retinol: row[31],
          beta_carotene: row[32],
          vitamin_d: row[33],
          vitamin_e: row[34],
          vitamin_b1: row[35],
          vitamin_b2: row[36],
          niacin: row[37],
          vitamin_b6: row[38],
          folate: row[39],
          vitamin_b12: row[40],
          vitamin_c: row[41],
          // Saturated fat - sum is around index 53 in the "ogółem" column for saturated acids
          saturated_fat: row[53],
          // Cholesterol is at index 66
          cholesterol: row[66],
          // Sugars - not directly available in this format, leaving null
          sugars: null,
          // Fiber is at index 89 (Błonnik pokarmowy)
          fiber: row[89],
        };
        
        // Only add if we have at least a name
        if (record.name_pl) {
          records.push(record);
        }
      }
      
      if (records.length === 0) {
        toast.error("Nie znaleziono danych w pliku. Upewnij się, że plik zawiera arkusz 'BAZA DANYCH'.");
        setIsUploading(false);
        return;
      }
      
      // Upload to server
      const result = await uploadNutritionDatabase({
        file_name: selectedFile.name,
        uploaded_by: "Admin", // TODO: Get from auth context
        records,
      });
      
      toast.success(`Zaimportowano ${result.inserted} produktów do bazy IŻŻ`);
      setUploadSuccess(true);
      setSelectedFile(null);
      
      // Reset file input
      const fileInput = document.getElementById("file-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
      
      // Reload data
      loadData();
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Błąd podczas importu: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("pl-PL", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <DietLayout pageKey="config.products">
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Produkty" },
          { label: "Baza Instytutu Żywienia" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">
          Baza danych Instytutu Żywienia
        </h1>
        <p className="mt-1 text-muted-foreground">
          Wgraj bazę produktów z Instytutu Żywności i Żywienia w formacie XLSX
        </p>
      </div>

      {/* Current database info */}
      <div className="grid gap-4 mb-6 grid-cols-1 lg:grid-cols-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100">
              <Database className="h-5 w-5 text-green-600" />
            </div>
            <div>
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <>
                  <p className="text-2xl font-bold">{stats?.records_count || 0}</p>
                  <p className="text-sm text-muted-foreground">Produktów w bazie</p>
                </>
              )}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : stats?.last_upload ? (
                <>
                  <p className="text-lg font-bold">{formatDate(stats.last_upload.uploaded_at)}</p>
                  <p className="text-sm text-muted-foreground">Ostatnia aktualizacja</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-muted-foreground">Brak</p>
                  <p className="text-sm text-muted-foreground">Ostatnia aktualizacja</p>
                </>
              )}
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              {isLoadingStats ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : stats?.last_upload ? (
                <>
                  <p className="text-lg font-bold">{stats.last_upload.uploaded_by}</p>
                  <p className="text-sm text-muted-foreground">Ostatnio wgrał/a</p>
                </>
              ) : (
                <>
                  <p className="text-lg font-bold text-muted-foreground">-</p>
                  <p className="text-sm text-muted-foreground">Ostatnio wgrał/a</p>
                </>
              )}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upload section */}
        <Card className="p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Wgraj nową bazę
          </h2>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <div className="space-y-2">
                <Label
                  htmlFor="file-upload"
                  className="cursor-pointer text-primary hover:underline"
                >
                  Wybierz plik XLSX
                </Label>
                <Input
                  id="file-upload"
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <p className="text-sm text-muted-foreground">
                  lub przeciągnij i upuść tutaj
                </p>
              </div>
            </div>

            {selectedFile && (
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <FileSpreadsheet className="h-8 w-8 text-green-600" />
                <div className="flex-1">
                  <p className="font-medium">{selectedFile.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedFile(null)}
                >
                  Usuń
                </Button>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex items-center gap-2 p-3 bg-green-50 text-green-700 rounded-lg">
                <CheckCircle className="h-5 w-5" />
                <span>Plik został pomyślnie wgrany i przetworzony!</span>
              </div>
            )}

            <Button
              className="w-full gap-2"
              disabled={!selectedFile || isUploading}
              onClick={handleUpload}
            >
              {isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Przetwarzanie...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Wgraj bazę
                </>
              )}
            </Button>

            <div className="text-sm text-muted-foreground space-y-1">
              <p className="font-medium">Wymagania:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>Format pliku: XLSX lub XLS</li>
                <li>Arkusz o nazwie "BAZA DANYCH"</li>
                <li>Struktura zgodna z formatem IŻŻ</li>
                <li>Maksymalny rozmiar: 50 MB</li>
              </ul>
            </div>

            <div className="text-sm text-muted-foreground bg-blue-50 p-3 rounded-lg">
              <p className="font-medium text-blue-700 mb-1">Mapowanie kolumn:</p>
              <p className="text-blue-600 text-xs">
                Nazwy polskie → angielskie: Woda → water, Białko zwierzęce → protein_animal, 
                Tłuszcz → fat, Węglowodany → carbohydrates, Błonnik → fiber, Sód → sodium, 
                Wapń → calcium, Żelazo → iron, Witamina A → vitamin_a, itd.
              </p>
            </div>
          </div>
        </Card>

        {/* Upload history */}
        <Card>
          <div className="border-b p-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Historia wgrań
            </h2>
          </div>

          {isLoadingStats ? (
            <div className="p-8 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            </div>
          ) : history.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <FileSpreadsheet className="h-12 w-12 mx-auto mb-2 opacity-30" />
              <p>Brak historii wgrań</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plik</TableHead>
                  <TableHead>Użytkownik</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((upload) => (
                  <TableRow key={upload.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="h-4 w-4 text-green-600" />
                        <span className="font-medium text-sm truncate max-w-[150px]">
                          {upload.file_name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{upload.uploaded_by}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(upload.uploaded_at)}
                    </TableCell>
                    <TableCell>
                      {upload.status === "success" ? (
                        <Badge className="bg-green-600 gap-1">
                          <CheckCircle className="h-3 w-3" />
                          {upload.records_count} rek.
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <AlertCircle className="h-3 w-3" />
                          Błąd
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </DietLayout>
  );
};

export default NutritionDatabaseUpload;
