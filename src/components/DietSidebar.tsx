import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  FlaskConical,
  Utensils,
  CalendarDays,
  Truck,
  Factory,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ClipboardCheck,
  FolderTree,
  Settings2,
  Database,
  Apple,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SidebarItem = {
  label: string;
  path: string;
  icon: React.ElementType;
  submenu?: { label: string; path: string; icon: React.ElementType }[];
};

const dietMenuItems: SidebarItem[] = [
  { label: "Dashboard", path: "/dietetyka", icon: LayoutDashboard },
  { label: "Zamówienia", path: "/dietetyka/akceptacja-posilkow", icon: ClipboardCheck },
  { label: "Diety", path: "/dietetyka/plany-diet", icon: Apple },
  {
    label: "Produkty",
    path: "/dietetyka/produkty",
    icon: Package,
    submenu: [
      { label: "Kategorie", path: "/dietetyka/produkty/kategorie", icon: FolderTree },
      { label: "Konfiguracja", path: "/dietetyka/produkty/konfiguracja", icon: Settings2 },
      { label: "Baza IŻŻ", path: "/dietetyka/produkty/baza-izz", icon: Database },
    ],
  },
  { label: "Receptury", path: "/dietetyka/receptury", icon: FlaskConical },
  { label: "Dania", path: "/dietetyka/dania", icon: Utensils },
  { label: "Jadłospisy", path: "/dietetyka/jadlospisy", icon: CalendarDays },
  { label: "Wydawki", path: "/dietetyka/wydawki", icon: Truck },
  { label: "Produkcja", path: "/dietetyka/produkcja", icon: Factory },
  {
    label: "Raporty",
    path: "/dietetyka/raporty",
    icon: BarChart3,
    submenu: [
      { label: "Odżywczy", path: "/dietetyka/raporty/odzywczy", icon: BarChart3 },
      { label: "Kosztowy", path: "/dietetyka/raporty/kosztowy", icon: BarChart3 },
      { label: "Alergenów", path: "/dietetyka/raporty/alergeny", icon: BarChart3 },
      { label: "Odpadów", path: "/dietetyka/raporty/odpady", icon: BarChart3 },
    ],
  },
];

export default function DietSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);
  const location = useLocation();

  const renderItem = (item: SidebarItem) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0;
    const isActive = hasSubmenu
      ? location.pathname.startsWith(item.path)
      : item.path === "/dietetyka"
        ? location.pathname === "/dietetyka"
        : location.pathname.startsWith(item.path);
    const isExpanded = expandedMenu === item.label;

    if (hasSubmenu) {
      return (
        <div key={item.label}>
          <button
            onClick={() => setExpandedMenu(isExpanded ? null : item.label)}
            title={collapsed ? item.label : undefined}
            className={cn(
              "flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm transition-colors w-[calc(100%-1rem)]",
              isActive
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1 text-left">{item.label}</span>
                <ChevronDown className={cn("h-3 w-3 transition-transform", isExpanded && "rotate-180")} />
              </>
            )}
          </button>
          {!collapsed && isExpanded && (
            <div className="ml-5 border-l border-border pl-2 mt-0.5">
              {item.submenu!.map((sub) => {
                const subActive = location.pathname === sub.path;
                return (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    className={cn(
                      "flex items-center gap-2 mx-2 px-3 py-1.5 rounded-md text-xs transition-colors",
                      subActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    <sub.icon className="h-3.5 w-3.5 shrink-0" />
                    <span>{sub.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        key={item.path}
        to={item.path}
        title={collapsed ? item.label : undefined}
        className={cn(
          "flex items-center gap-3 mx-2 px-3 py-2 rounded-md text-sm transition-colors",
          isActive
            ? "bg-primary text-primary-foreground"
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span>{item.label}</span>}
      </Link>
    );
  };

  return (
    <aside
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] border-r bg-card flex flex-col transition-all duration-200 shrink-0",
        collapsed ? "w-14" : "w-56"
      )}
    >
      <nav className="flex-1 overflow-y-auto py-2">
        {dietMenuItems.map(renderItem)}
      </nav>

      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center justify-center h-10 border-t text-muted-foreground hover:text-foreground transition-colors"
        title={collapsed ? "Rozwiń" : "Zwiń"}
      >
        {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
      </button>
    </aside>
  );
}
