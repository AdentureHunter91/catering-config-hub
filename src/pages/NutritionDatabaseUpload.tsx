import { useState } from "react";
import Layout from "@/components/Layout";
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
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Mock upload history
const mockUploadHistory = [
  {
    id: 1,
    fileName: "baza_zywnosci_2024_v3.xlsx",
    uploadedBy: "Anna Kowalska",
    uploadedAt: "2024-01-15 14:32",
    recordsCount: 2847,
    status: "success" as const,
  },
  {
    id: 2,
    fileName: "baza_zywnosci_2024_v2.xlsx",
    uploadedBy: "Jan Nowak",
    uploadedAt: "2024-01-10 09:15",
    recordsCount: 2821,
    status: "success" as const,
  },
  {
    id: 3,
    fileName: "baza_zywnosci_2024_v1.xlsx",
    uploadedBy: "Anna Kowalska",
    uploadedAt: "2024-01-05 11:45",
    recordsCount: 2800,
    status: "success" as const,
  },
  {
    id: 4,
    fileName: "baza_test.xlsx",
    uploadedBy: "Jan Nowak",
    uploadedAt: "2024-01-03 16:20",
    recordsCount: 0,
    status: "error" as const,
    error: "Nieprawidłowy format pliku",
  },
];

const NutritionDatabaseUpload = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadSuccess(false);
    }
  };

  const handleUpload = () => {
    if (!selectedFile) return;
    setIsUploading(true);
    // Mock upload
    setTimeout(() => {
      setIsUploading(false);
      setUploadSuccess(true);
      setSelectedFile(null);
    }, 2000);
  };

  const currentDbInfo = mockUploadHistory[0];

  return (
    <Layout pageKey="config.products">
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
              <p className="text-2xl font-bold">{currentDbInfo.recordsCount}</p>
              <p className="text-sm text-muted-foreground">Produktów w bazie</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-bold">{currentDbInfo.uploadedAt}</p>
              <p className="text-sm text-muted-foreground">Ostatnia aktualizacja</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-100">
              <User className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-lg font-bold">{currentDbInfo.uploadedBy}</p>
              <p className="text-sm text-muted-foreground">Ostatnio wgrał/a</p>
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
                  <span className="animate-spin">⏳</span>
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
                <li>Kolumny: Nazwa produktu, Kalorie, Białko, Węglowodany, Tłuszcze, Błonnik, Sód</li>
                <li>Maksymalny rozmiar: 50 MB</li>
              </ul>
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
              {mockUploadHistory.map((upload) => (
                <TableRow key={upload.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileSpreadsheet className="h-4 w-4 text-green-600" />
                      <span className="font-medium text-sm">{upload.fileName}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{upload.uploadedBy}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {upload.uploadedAt}
                  </TableCell>
                  <TableCell>
                    {upload.status === "success" ? (
                      <Badge className="bg-green-600 gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {upload.recordsCount} rekordów
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
        </Card>
      </div>
    </Layout>
  );
};

export default NutritionDatabaseUpload;
