import * as React from "react";
import { Check, ChevronsUpDown, Search, Database } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface NutritionDbItem {
  id: number;
  name: string;
}

interface NutritionDbComboboxProps {
  items: NutritionDbItem[];
  value: string; // "none" or id as string
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function NutritionDbCombobox({
  items,
  value,
  onValueChange,
  placeholder = "Wybierz produkt z bazy IŻŻ",
  className,
}: NutritionDbComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  // Find selected item
  const selectedItem = value !== "none" 
    ? items.find((item) => item.id.toString() === value) 
    : null;

  // Filter items based on search (case-insensitive)
  const filteredItems = React.useMemo(() => {
    if (!search.trim()) return items.slice(0, 100); // Show first 100 when no search
    const lowerSearch = search.toLowerCase();
    return items.filter((item) =>
      item.name.toLowerCase().includes(lowerSearch)
    ).slice(0, 100); // Limit to 100 results for performance
  }, [items, search]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between font-normal", className)}
        >
          <span className="truncate">
            {selectedItem ? selectedItem.name : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0 z-[100]" align="start">
        <Command shouldFilter={false}>
          <CommandInput 
            placeholder="Wyszukaj produkt..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>
              {search.length > 0 ? (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Nie znaleziono produktów dla "{search}"
                </div>
              ) : (
                <div className="py-4 text-center text-sm text-muted-foreground">
                  <Database className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  Wpisz szukaną frazę
                </div>
              )}
            </CommandEmpty>
            <CommandGroup>
              {/* Option to clear selection */}
              <CommandItem
                value="none"
                onSelect={() => {
                  onValueChange("none");
                  setOpen(false);
                  setSearch("");
                }}
                className="text-muted-foreground"
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === "none" ? "opacity-100" : "opacity-0"
                  )}
                />
                -- Brak powiązania --
              </CommandItem>
              
              {/* Filtered items */}
              {filteredItems.map((item) => (
                <CommandItem
                  key={item.id}
                  value={item.id.toString()}
                  onSelect={() => {
                    onValueChange(item.id.toString());
                    setOpen(false);
                    setSearch("");
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === item.id.toString() ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <span className="truncate">{item.name}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            
            {/* Info about results limit */}
            {filteredItems.length >= 100 && (
              <div className="px-2 py-2 text-xs text-center text-muted-foreground border-t">
                Wyświetlono pierwsze 100 wyników. Zawęź wyszukiwanie, aby zobaczyć więcej.
              </div>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
