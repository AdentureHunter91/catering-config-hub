import { useState } from "react";
import Layout from "@/components/Layout";
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

// Mock data
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

const initialCategories: Category[] = [
  { id: 1, name: "Produkty spożywcze", status: "active", subcategoryCount: 3 },
  { id: 2, name: "Chemia", status: "active", subcategoryCount: 2 },
  { id: 3, name: "Opakowania", status: "active", subcategoryCount: 0 },
  { id: 4, name: "Stara kategoria", status: "archived", subcategoryCount: 1 },
];

const initialSubcategories: Subcategory[] = [
  { id: 1, categoryId: 1, name: "Sery", status: "active", productCount: 24, sortOrder: 1 },
  { id: 2, categoryId: 1, name: "Wędliny", status: "active", productCount: 18, sortOrder: 2 },
  { id: 3, categoryId: 1, name: "Warzywa", status: "active", productCount: 45, sortOrder: 3 },
  { id: 4, categoryId: 2, name: "Środki czystości", status: "active", productCount: 12, sortOrder: 1 },
  { id: 5, categoryId: 2, name: "Rękawiczki", status: "active", productCount: 8, sortOrder: 2 },
  { id: 6, categoryId: 4, name: "Archiwalna sub", status: "archived", productCount: 0, sortOrder: 1 },
];

type FilterStatus = "active" | "all" | "archived";

const ProductCategories = () => {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [subcategories, setSubcategories] = useState<Subcategory[]>(initialSubcategories);
  
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

  // Filter categories
  const filteredCategories = categories
    .filter((c) => {
      if (categoryFilter === "active") return c.status === "active";
      if (categoryFilter === "archived") return c.status === "archived";
      return true;
    })
    .filter((c) => c.name.toLowerCase().includes(categorySearch.toLowerCase()));

  // Get subcategories for selected category
  const currentSubcategories = subcategories
    .filter((s) => s.categoryId === selectedCategoryId)
    .filter((s) => s.name.toLowerCase().includes(subcategorySearch.toLowerCase()))
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const selectedCategory = categories.find((c) => c.id === selectedCategoryId);

  // Handlers
  const handleAddCategory = () => {
    if (!newCategoryName.trim()) return;
    const newId = Math.max(...categories.map((c) => c.id), 0) + 1;
    setCategories([
      ...categories,
      { id: newId, name: newCategoryName.trim(), status: "active", subcategoryCount: 0 },
    ]);
    setNewCategoryName("");
    setAddCategoryDialogOpen(false);
  };

  const handleAddSubcategory = () => {
    if (!newSubcategoryName.trim() || !selectedCategoryId) return;
    const newId = Math.max(...subcategories.map((s) => s.id), 0) + 1;
    const maxOrder = Math.max(...currentSubcategories.map((s) => s.sortOrder), 0);
    setSubcategories([
      ...subcategories,
      {
        id: newId,
        categoryId: selectedCategoryId,
        name: newSubcategoryName.trim(),
        status: "active",
        productCount: 0,
        sortOrder: maxOrder + 1,
      },
    ]);
    // Update category count
    setCategories(
      categories.map((c) =>
        c.id === selectedCategoryId ? { ...c, subcategoryCount: c.subcategoryCount + 1 } : c
      )
    );
    setNewSubcategoryName("");
    setAddSubcategoryDialogOpen(false);
  };

  const startEditCategory = (cat: Category) => {
    setEditingCategoryId(cat.id);
    setEditingCategoryName(cat.name);
  };

  const saveEditCategory = () => {
    if (!editingCategoryName.trim()) return;
    setCategories(
      categories.map((c) =>
        c.id === editingCategoryId ? { ...c, name: editingCategoryName.trim() } : c
      )
    );
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const cancelEditCategory = () => {
    setEditingCategoryId(null);
    setEditingCategoryName("");
  };

  const startEditSubcategory = (sub: Subcategory) => {
    setEditingSubcategoryId(sub.id);
    setEditingSubcategoryName(sub.name);
  };

  const saveEditSubcategory = () => {
    if (!editingSubcategoryName.trim()) return;
    setSubcategories(
      subcategories.map((s) =>
        s.id === editingSubcategoryId ? { ...s, name: editingSubcategoryName.trim() } : s
      )
    );
    setEditingSubcategoryId(null);
    setEditingSubcategoryName("");
  };

  const cancelEditSubcategory = () => {
    setEditingSubcategoryId(null);
    setEditingSubcategoryName("");
  };

  const confirmArchive = () => {
    if (!itemToArchive) return;
    if (itemToArchive.type === "category") {
      setCategories(
        categories.map((c) =>
          c.id === itemToArchive.id ? { ...c, status: "archived" } : c
        )
      );
      if (selectedCategoryId === itemToArchive.id) {
        setSelectedCategoryId(null);
      }
    } else {
      setSubcategories(
        subcategories.map((s) =>
          s.id === itemToArchive.id ? { ...s, status: "archived" } : s
        )
      );
    }
    setArchiveConfirmOpen(false);
    setItemToArchive(null);
  };

  const restoreItem = (type: "category" | "subcategory", id: number) => {
    if (type === "category") {
      setCategories(
        categories.map((c) => (c.id === id ? { ...c, status: "active" } : c))
      );
    } else {
      setSubcategories(
        subcategories.map((s) => (s.id === id ? { ...s, status: "active" } : s))
      );
    }
  };

  const moveSubcategoryUp = (sub: Subcategory) => {
    const idx = currentSubcategories.findIndex((s) => s.id === sub.id);
    if (idx <= 0) return;
    const prev = currentSubcategories[idx - 1];
    setSubcategories(
      subcategories.map((s) => {
        if (s.id === sub.id) return { ...s, sortOrder: prev.sortOrder };
        if (s.id === prev.id) return { ...s, sortOrder: sub.sortOrder };
        return s;
      })
    );
  };

  const moveSubcategoryDown = (sub: Subcategory) => {
    const idx = currentSubcategories.findIndex((s) => s.id === sub.id);
    if (idx >= currentSubcategories.length - 1) return;
    const next = currentSubcategories[idx + 1];
    setSubcategories(
      subcategories.map((s) => {
        if (s.id === sub.id) return { ...s, sortOrder: next.sortOrder };
        if (s.id === next.id) return { ...s, sortOrder: sub.sortOrder };
        return s;
      })
    );
  };

  const openMoveDialog = (sub: Subcategory) => {
    setSubcategoryToMove(sub);
    setTargetCategoryId("");
    setMoveDialogOpen(true);
  };

  const handleMoveSubcategory = () => {
    if (!subcategoryToMove || !targetCategoryId) return;
    const targetId = parseInt(targetCategoryId);
    // Update subcategory
    setSubcategories(
      subcategories.map((s) =>
        s.id === subcategoryToMove.id ? { ...s, categoryId: targetId } : s
      )
    );
    // Update counts
    setCategories(
      categories.map((c) => {
        if (c.id === subcategoryToMove.categoryId) {
          return { ...c, subcategoryCount: c.subcategoryCount - 1 };
        }
        if (c.id === targetId) {
          return { ...c, subcategoryCount: c.subcategoryCount + 1 };
        }
        return c;
      })
    );
    setMoveDialogOpen(false);
    setSubcategoryToMove(null);
  };

  return (
    <Layout pageKey="config.products">
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
              <Button className="gap-2" onClick={() => setAddCategoryDialogOpen(true)}>
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
                        />
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            saveEditCategory();
                          }}
                        >
                          <Check className="h-4 w-4 text-green-600" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditCategory();
                          }}
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
                        <Button variant="ghost" size="sm">
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
                disabled={!selectedCategoryId}
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
                              />
                              <Button size="sm" variant="ghost" onClick={saveEditSubcategory}>
                                <Check className="h-4 w-4 text-green-600" />
                              </Button>
                              <Button size="sm" variant="ghost" onClick={cancelEditSubcategory}>
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
                              disabled={idx === 0}
                              onClick={() => moveSubcategoryUp(sub)}
                            >
                              <ChevronUp className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              disabled={idx === currentSubcategories.length - 1}
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
                                <Button variant="ghost" size="sm">
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
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCategoryDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleAddCategory}>Dodaj</Button>
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
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSubcategoryDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleAddSubcategory}>Dodaj</Button>
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
            <Button variant="outline" onClick={() => setMoveDialogOpen(false)}>
              Anuluj
            </Button>
            <Button onClick={handleMoveSubcategory} disabled={!targetCategoryId}>
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
            <AlertDialogCancel>Anuluj</AlertDialogCancel>
            <AlertDialogAction onClick={confirmArchive}>Archiwizuj</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Layout>
  );
};

export default ProductCategories;
