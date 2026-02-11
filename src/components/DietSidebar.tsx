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
  ClipboardCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

const dietMenuItems = [
  { label: "Dashboard", path: "/dietetyka", icon: LayoutDashboard },
  { label: "Zamówienia", path: "/dietetyka/akceptacja-posilkow", icon: ClipboardCheck },
  { label: "Produkty", path: "/dietetyka/produkty", icon: Package },
  { label: "Receptury", path: "/dietetyka/receptury", icon: FlaskConical },
  { label: "Dania", path: "/dietetyka/dania", icon: Utensils },
  { label: "Jadłospisy", path: "/dietetyka/jadlospisy", icon: CalendarDays },
  { label: "Wydawki", path: "/dietetyka/wydawki", icon: Truck },
  { label: "Produkcja", path: "/dietetyka/produkcja", icon: Factory },
  { label: "Raporty", path: "/dietetyka/raporty", icon: BarChart3 },
];

export default function DietSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "sticky top-16 h-[calc(100vh-4rem)] border-r bg-card flex flex-col transition-all duration-200 shrink-0",
        collapsed ? "w-14" : "w-56"
      )}
    >
      <nav className="flex-1 overflow-y-auto py-2">
        {dietMenuItems.map((item) => {
          const isActive =
            item.path === "/dietetyka"
              ? location.pathname === "/dietetyka"
              : location.pathname.startsWith(item.path);

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
        })}
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
