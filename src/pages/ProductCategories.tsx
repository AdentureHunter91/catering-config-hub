import { useState, useEffect, useCallback } from "react";
import DietLayout from "@/components/DietLayout";
import Breadcrumb from "@/components/Breadcrumb";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Plus,
  MoreHorizontal,
  ChevronUp,
  ChevronDown,
  Pencil,
  Archive,
  RotateCcw,
  FolderInput,
  Check,
  X,
  Loader2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import {
  fetchCategories,
  fetchSubcategories,
  createCategory,
  createSubcategory,
  updateCategory,
  updateSubcategory,
  archiveCategory,
  archiveSubcategory,
  reorderSubcategory,
  moveSubcategory,
  type ProductCategory,
  type ProductSubcategory,
} from "@/api/productCategories";

type FilterStatus = "active" | "all" | "archived";

interface Category {
  id: number;
  name: string;
  status: "active" | "archived";
  subcategoryCount: number;
}

interface Subcategory {
  id: number;
  categoryId: number;
  name: string;
  status: "active" | "archived";
  productCount: number;
  sortOrder: number;
}

const ProductCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [categorySearch, setCategorySearch] = useState("");
  const [subcategorySearch, setSubcategorySearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<FilterStatus>("active");
  
  // Inline editing
  const [editingCategoryId, setEditingCategoryId] = useState<number | null>(null);
  const [editingCategoryName, setEditingCategoryName] = useState("");
  const [editingSubcategoryId, setEditingSubcategoryId] = useState<number | null>(null);
  const [editingSubcategoryName, setEditingSubcategoryName] = useState("");
  
  // Dialogs
  const [addCategoryDialogOpen, setAddCategoryDialogOpen] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [addSubcategoryDialogOpen, setAddSubcategoryDialogOpen] = useState(false);
  const [newSubcategoryName, setNewSubcategoryName] = useState("");
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [subcategoryToMove, setSubcategoryToMove] = useState<Subcategory | null>(null);
  const [targetCategoryId, setTargetCategoryId] = useState<string>("");
  const [archiveConfirmOpen, setArchiveConfirmOpen] = useState(false);
  const [itemToArchive, setItemToArchive] = useState<{ type: "category" | "subcategory"; id: number } | null>(null);

  // Load categories from API
  const loadCategories = useCallback(async () => {
    try {
      const data = await fetchCategories(categoryFilter);
      setCategories(data.map(c => ({
        id: c.id,
        name: c.name,
        status: c.status,
        subcategoryCount: c.subcategory_count,
      })));
    } catch (error) {
      console.error("Error loading categories:", error);
      toast.error("Błąd podczas wczytywania kategorii");
    }
  }, [categoryFilter]);

  // Load subcategories from API
  const loadSubcategories = useCallback(async () => {
    if (!selectedCategoryId) {
      setSubcategories([]);
      return;
    }
    try {
      const data = await fetchSubcategories(selectedCategoryId);
      setSubcategories(data.map(s => ({
        id: s.id,
        categoryId: s.category_id,
        name: s.name,
        status: s.status,
        productCount: s.product_count,
        sortOrder: s.sort_order,
      })));
    } catch (error) {
      console.error("Error loading subcategories:", error);
      toast.error("Błąd podczas wczytywania subkategorii");
    }
  }, [selectedCategoryId]);

  // Initial load
  useEffect(() => {
    setLoading(true);
    loadCategories().finally(() => setLoading(false));
  }, [loadCategories]);

  // Load subcategories when category changes
  useEffect(() => {
    loadSubcategories();
  }, [loadSubcategories]);

  // Filter categories
  const filteredCategories = categories
    .filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));

  // Get subcategories for selected category
  const currentSubcategories = subcategories
    .filter((s) => s.name.toLowerCase().includes(subcategorySearch.toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Handlers
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setSaving(true);
    try {
      await createCategory(newCategoryName.trim());
      toast.success("Kategoria została dodana");
      setNewCategoryName("");
      setAddCategoryDialogOpen(false);
      await loadCategories();
    } catch (error: any) {
      toast.error(error.message || "Błąd podczas dodawania kategorii");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubcategoryName.trim() || !selectedCategoryId) return;
    setSaving(true);
    try {
      await createSubcategory(selectedCategoryId, newSubcategoryName.trim());
      toast.success("Subkategoria została dodana");
      setNewSubcategoryName("");
      setAddSubcategoryDialogOpen(false);
      await Promise.all([loadCategories(), loadSubcategories()]);
    } catch (error: any) {
      toast.error(error.message || "Błąd podczas dodawania subkategorii");
    } finally {
      setSaving(false);
    }
  };

  const startEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
  };

  const saveEditCategory = async () => {
    if (!editingCategoryName.trim() || !editingCategoryId) return;
    setSaving(true);
    try {
      await updateCategory(editingCategoryId, { name: editingCategoryName.trim() });
      toast.success("Nazwa kategorii została zaktualizowana");
      setEditingCategoryId(null);
      setEditingCategoryName("");
      await loadCategories();
    } catch (error: any) {
      toast.error(error.message || "Błąd podczas aktualizacji kategorii");
    } finally {
      setSaving(false);
    }
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const startEditSubcategory = (sub: Subcategory) => {
    setEditingSubcategoryId(sub.id);
    setEditingSubcategoryName(sub.name);
  };

  const saveEditSubcategory = async () => {
    if (!editingSubcategoryName.trim() || !editingSubcategoryId) return;
    setSaving(true);
    try {
      await updateSubcategory(editingSubcategoryId, { name: editingSubcategoryName.trim() });
      toast.success("Nazwa subkategorii została zaktualizowana");
      setEditingSubcategoryId(null);
      setEditingSubcategoryName("");
      await loadSubcategories();
    } catch (error: any) {
      toast.error(error.message || "Błąd podczas aktualizacji subkategorii");
    } finally {
      setSaving(false);
    }
  };

  const cancelEditSubcategory = () => {
    setEditingSubcategoryId(null);
    setEditingSubcategoryName("");
  };

  const confirmArchive = async () => {
    if (!itemToArchive) return;
    setSaving(true);
    try {
      if (itemToArchive.type === "category") {
        await archiveCategory(itemToArchive.id);
        toast.success("Kategoria została zarchiwizowana");
        if (selectedCategoryId === itemToArchive.id) {
          setSelectedCategoryId(null);
        }
        await loadCategories();
      } else {
        await archiveSubcategory(itemToArchive.id);
        toast.success("Subkategoria została zarchiwizowana");
        await Promise.all([loadCategories(), loadSubcategories()]);
      }
    } catch (error: any) {
      toast.error(error.message || "Błąd podczas archiwizacji");
    } finally {
      setSaving(false);
      setArchiveConfirmOpen(false);
      setItemToArchive(null);
    }
  };

  const restoreItem = async (type: "category" | "subcategory", id: number) => {
    setSaving(true);
    try {
      if (type === "category") {
        await updateCategory(id, { status: "active" });
        toast.success("Kategoria została przywrócona");
        await loadCategories();
      } else {
        await updateSubcategory(id, { status: "active" });
        toast.success("Subkategoria została przywrócona");
        await Promise.all([loadCategories(), loadSubcategories()]);
      }
    } catch (error: any) {
      toast.error(error.message || "Błąd podczas przywracania");
    } finally {
      setSaving(false);
    }
  };

  const moveSubcategoryUp = async (sub: Subcategory) => {
    const idx = currentSubcategories.findIndex((s) => s.id === sub.id);
    if (idx <= 0) return;
    const prev = currentSubcategories[idx - 1];
    
    setSaving(true);
    try {
      await reorderSubcategory(sub.id, prev.sortOrder);
      await loadSubcategories();
    } catch (error: any) {
      toast.error(error.message || "Błąd podczas zmiany kolejności");
    } finally {
      setSaving(false);
    }
  };

  const moveSubcategoryDown = async (sub: Subcategory) => {
    const idx = currentSubcategories.findIndex((s) => s.id === sub.id);
    if (idx >= currentSubcategories.length - 1) return;
    const next = currentSubcategories[idx + 1];
    
    setSaving(true);
    try {
      await reorderSubcategory(sub.id, next.sortOrder);
      await loadSubcategories();
    } catch (error: any) {
      toast.error(error.message || "Błąd podczas zmiany kolejności");
    } finally {
      setSaving(false);
    }
  };

  const openMoveDialog = (sub: Subcategory) => {
    setSubcategoryToMove(sub);
    setTargetCategoryId("");
    setMoveDialogOpen(true);
  };

  const handleMoveSubcategory = async () => {
    if (!subcategoryToMove || !targetCategoryId) return;
    const targetId = parseInt(targetCategoryId);
    
    setSaving(true);
    try {
      await moveSubcategory(subcategoryToMove.id, targetId);
      toast.success("Subkategoria została przeniesiona");
      setMoveDialogOpen(false);
      setSubcategoryToMove(null);
      await Promise.all([loadCategories(), loadSubcategories()]);
    } catch (error: any) {
      toast.error(error.message || "Błąd podczas przenoszenia subkategorii");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DietLayout pageKey="config.products">
        <Breadcrumb
          items={[
            { label: "Konfiguracja systemu" },
            { label: "Kategorie produktów" },
          ]}
        />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DietLayout>
    );
  }

  return (
    <DietLayout pageKey="config.products">
      <Breadcrumb
        items={[
          { label: "Konfiguracja systemu" },
          { label: "Kategorie produktów" },
        ]}
      />

      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Kategorie produktów</h1>
        <p className="mt-1 text-muted-foreground">
          Zarządzaj hierarchią kategorii i subkategorii produktów
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* LEFT PANEL - Categories */}
        <Card className="h-fit">
          <div className="border-b p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Kategorie główne</h2>
              <Button className="gap-2" onClick={() => setAddCategoryDialogOpen(true)} disabled={saving}>
                <Plus className="h-4 w-4" />
                Dodaj kategorię
              </Button>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Szukaj kategorii..."
                  className="pl-10"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                />
              </div>
              <Select
                value={categoryFilter}
                onValueChange={(val) => setCategoryFilter(val as FilterStatus)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Aktywne</SelectItem>
                  <SelectItem value="all">Wszystkie</SelectItem>
                  <SelectItem value="archived">Archiwalne</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-4">
            <div className="space-y-2">
              {filteredCategories.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedCategoryId === cat.id
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => {
                    if (editingCategoryId !== cat.id) {
                      setSelectedCategoryId(cat.id);
                    }
                  }}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {editingCategoryId === cat.id ? (
                      <div className="flex items-center gap-2 flex-1">
                        <Input
                          value={editingCategoryName}
                          onChange={(e) => setEditingCategoryName(e.target.value)}
                          className="h-8"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") saveEditCategory();
                            if (e.key === "Escape") cancelEditCategory();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          disabled={saving}
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveEditCategory();
                          }}
                          disabled={saving}
                        >
                          {saving ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Check className="h-4 w-4 text-green-600" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditCategory();
                          }}
                          disabled={saving}
                        >
                          <X className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    ) : (
                      <>
                        <span className="font-medium truncate">{cat.name}</span>
                        <Badge
                          variant={cat.status === "active" ? "default" : "secondary"}
                          className={cat.status === "active" ? "bg-green-600" : ""}
                        >
                          {cat.status === "active" ? "Aktywna" : "Archiwalna"}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          ({cat.subcategoryCount} sub.)
                        </span>
                      </>
                    )}
                  </div>

                  {editingCategoryId !== cat.id && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" disabled={saving}>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditCategory(cat);
                          }}
                        >
                          <Pencil className="h-4 w-4 mr-2" />
                          Edytuj nazwę
                        </DropdownMenuItem>
                        {cat.status === "active" ? (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              setItemToArchive({ type: "category", id: cat.id });
                              setArchiveConfirmOpen(true);
                            }}
                          >
                            <Archive className="h-4 w-4 mr-2" />
                            Archiwizuj
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation();
                              restoreItem("category", cat.id);
                            }}
                          >
                            <RotateCcw className="h-4 w-4 mr-2" />
                            Przywróć
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              ))}

              {filteredCategories.length === 0 && (
                <div className="text-center py-6 text-muted-foreground">
                  Brak kategorii do wyświetlenia
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* RIGHT PANEL - Subcategories */}
        <Card className="h-fit">
          <div className="border-b p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">
                Subkategorie: {selectedCategory?.name || "—"}
              </h2>
              <Button
                className="gap-2"
                onClick={() => setAddSubcategoryDialogOpen(true)}
                disabled={!selectedCategoryId || saving}
              >
                <Plus className="h-4 w-4" />
                Dodaj subkategorię
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Szukaj subkategorii..."
                className="pl-10"
                value={subcategorySearch}
                onChange={(e) => setSubcategorySearch(e.target.value)}
                disabled={!selectedCategoryId}
              />
            </div>
          </div>

          <div className="p-4">
            {!selectedCategoryId ? (
              <div className="text-center py-12 text-muted-foreground">
                Wybierz kategorię z lewego panelu
              </div>
            ) : currentSubcategories.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                Brak subkategorii w tej kategorii
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="pb-3 text-left text-sm font-semibold">Nazwa</th>
                      <th className="pb-3 text-center text-sm font-semibold">Status</th>
                      <th className="pb-3 text-center text-sm font-semibold">Produkty</th>
                      <th className="pb-3 text-center text-sm font-semibold">Kolejność</th>
                      <th className="pb-3 text-right text-sm font-semibold">Akcje</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentSubcategories.map((sub, idx) => (
                      <tr key={sub.id} className="border-b last:border-0">
                        <td className="py-3">
                          {editingSubcategoryId === sub.id ? (
                            <div className="flex items-center gap-2">
                              <Input
                                value={editingSubcategoryName}
                                onChange={(e) => setEditingSubcategoryName(e.target.value)}
                                className="h-8 w-40"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") saveEditSubcategory();
                                  if (e.key === "Escape") cancelEditSubcategory();
                                }}
                                disabled={saving}
                              />
                              <Button size="sm" variant="ghost" onClick={saveEditSubcategory} disabled={saving}>
                                {saving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4 text-green-600" />
                                )}
                              </Button>
                              <Button size="sm" variant="ghost" onClick={cancelEditSubcategory} disabled={saving}>
                                <X className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          ) : (
                            <span className="font-medium">{sub.name}</span>
                          )}
                        </td>
                        <td className="py-3 text-center">
                          <Badge
                            variant={sub.status === "active" ? "default" : "secondary"}
                            className={sub.status === "active" ? "bg-green-600" : ""}
                          >
                            {sub.status === "active" ? "Aktywna" : "Archiwalna"}
                          </Badge>
                        </td>
                        <td className="py-3 text-center text-muted-foreground">
                          {sub.productCount}
                        </td>
                        <td className="py-3 text-center">
                          <div className="flex justify-center gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={idx === 0 || saving}
                              onClick={() => moveSubcategoryUp(sub)}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={idx === currentSubcategories.length - 1 || saving}
                              onClick={() => moveSubcategoryDown(sub)}
                            >
                              <ChevronDown className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                        <td className="py-3 text-right">
                          {editingSubcategoryId !== sub.id && (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={saving}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => startEditSubcategory(sub)}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edytuj nazwę
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => openMoveDialog(sub)}>
                                  <FolderInput className="h-4 w-4 mr-2" />
                                  Przenieś do innej kategorii
                                </DropdownMenuItem>
                                {sub.status === "active" ? (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setItemToArchive({ type: "subcategory", id: sub.id });
                                      setArchiveConfirmOpen(true);
                                    }}
                                  >
                                    <Archive className="h-4 w-4 mr-2" />
                                    Archiwizuj
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem onClick={() => restoreItem("subcategory", sub.id)}>
                                    <RotateCcw className="h-4 w-4 mr-2" />
                                    Przywróć
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* Add Category Dialog */}
      <Dialog open={addCategoryDialogOpen} onOpenChange={setAddCategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj kategorię</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Nazwa kategorii"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddCategory();
              }}
              disabled={saving}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryDialogOpen(false)} disabled={saving}>
              Anuluj
            </Button>
            <Button onClick={handleAddCategory} disabled={saving || !newCategoryName.trim()}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Dodaj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Subcategory Dialog */}
      <Dialog open={addSubcategoryDialogOpen} onOpenChange={setAddSubcategoryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dodaj subkategorię</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-2">
              Kategoria: <strong>{selectedCategory?.name}</strong>
            </p>
            <Input
              placeholder="Nazwa subkategorii"
              value={newSubcategoryName}
              onChange={(e) => setNewSubcategoryName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAddSubcategory();
              }}
              disabled={saving}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSubcategoryDialogOpen(false)} disabled={saving}>
              Anuluj
            </Button>
            <Button onClick={handleAddSubcategory} disabled={saving || !newSubcategoryName.trim()}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Dodaj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Move Subcategory Dialog */}
      <Dialog open={moveDialogOpen} onOpenChange={setMoveDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Przenieś subkategorię</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-muted-foreground mb-4">
              Przenosisz: <strong>{subcategoryToMove?.name}</strong>
            </p>
            <Select value={targetCategoryId} onValueChange={setTargetCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Wybierz kategorię docelową" />
              </SelectTrigger>
              <SelectContent>
                {categories
                  .filter(
                    (c) =>
                      c.status === "active" && c.id !== subcategoryToMove?.categoryId
                  )
                  .map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>
                      {c.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMoveDialogOpen(false)} disabled={saving}>
              Anuluj
            </Button>
            <Button onClick={handleMoveSubcategory} disabled={!targetCategoryId || saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Przenieś
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation */}
      <AlertDialog open={archiveConfirmOpen} onOpenChange={setArchiveConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Potwierdzenie archiwizacji</AlertDialogTitle>
            <AlertDialogDescription>
              Czy na pewno chcesz zarchiwizować{" "}
              {itemToArchive?.type === "category" ? "tę kategorię" : "tę subkategorię"}?
              Element zostanie ukryty z widoku aktywnych, ale można go przywrócić.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Archiwizuj
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DietLayout>
  );
};

export default ProductCategories;
