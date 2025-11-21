import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingCart,
  ChefHat,
  Settings,
  Users,
  Shield,
  Building2,
  BookOpen,
  UtensilsCrossed,
  FileText,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { useAccessContext } from "@/auth/AccessContext";
import { usePageAccess } from "@/auth/usePageAccess";

interface LayoutProps {
  children: ReactNode;
  pageKey?: string;
}

const Layout = ({ children, pageKey }: LayoutProps) => {
  const location = useLocation();
  const { access, me } = useAccessContext();
  const { canView, canEdit } = usePageAccess(pageKey || "");

  // Dropdowny
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Rola (opcjonalnie — do wyświetlania obok nazwiska)
  const role = me?.roles?.join(", ") || "Użytkownik";

  // Zamknij menu przy kliknięciu poza
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  if (pageKey && !canView) {
    return (
        <div className="p-10 text-center text-red-500 text-xl">
          🔒 Brak dostępu do tej strony.
        </div>
    );
  }

  const readOnlyClass = !canEdit ? "opacity-60 pointer-events-none select-none" : "";

  // ---- PODMENU (USTAWIENIA) ----
  const settingsItems = [
    { label: "Kontrakty", path: "/kontrakty", pageKey: "config.contracts_list", icon: FileText },
    { label: "Klienci", path: "/klienci", pageKey: "config.clients_list", icon: Users },
    { label: "Kuchnie", path: "/kuchnie", pageKey: "config.kitchens_list", icon: Building2 },
    { label: "Oddziały", path: "/oddzialy", pageKey: "config.departments_list", icon: Building2 },
    { label: "Diety", path: "/diety", pageKey: "config.diets", icon: BookOpen },
    { label: "Typy posiłków", path: "/posilki", pageKey: "config.meal_types", icon: UtensilsCrossed },
    { label: "Użytkownicy", path: "/uzytkownicy", pageKey: "config.users", icon: Users },
    { label: "Role i uprawnienia", path: "/uprawnienia", pageKey: "config.permissions", icon: Shield },
    { label: "Dostęp do stron", path: "/dostep-stron", pageKey: "config.page_access", icon: Shield },
    { label: "Dziennik zdarzeń", path: "/audit", pageKey: "config.audit", icon: FileText },
  ];

  const dropdownAnimation =
      "transition-all duration-150 origin-top transform scale-95 opacity-0 data-[open=true]:scale-100 data-[open=true]:opacity-100";


  return (
      <div className="min-h-screen bg-background">
        {/* === TOP NAV === */}
        <header className="sticky top-0 z-50 w-full border-b bg-card shadow-sm">
          <div className="flex h-16 items-center px-6">

            {/* LOGO */}
            <Link to="/dashboard" className="font-bold text-xl mr-10">CateringHub</Link>

            {/* === LEWE MENU === */}
            <nav className="flex gap-4 items-center" ref={menuRef}>

              {/* DASHBOARD */}
              <Link
                  to="/dashboard"
                  className={cn(
                      "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                      location.pathname.startsWith("/dashboard")
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Link>

              {/* ZAKUPY */}
              <Dropdown
                  label="Zakupy"
                  icon={ShoppingCart}
                  isOpen={openMenu === "zakupy"}
                  onOpen={() => setOpenMenu(openMenu === "zakupy" ? null : "zakupy")}
              >
                <div className="p-2 text-muted-foreground text-xs">Wkrótce…</div>
              </Dropdown>

              {/* DIETETYKA */}
              <Dropdown
                  label="Dietetyka"
                  icon={ChefHat}
                  isOpen={openMenu === "dietetyka"}
                  onOpen={() => setOpenMenu(openMenu === "dietetyka" ? null : "dietetyka")}
              >
                <div className="p-2 text-muted-foreground text-xs">Wkrótce…</div>
              </Dropdown>

              {/* USTAWIENIA */}
              <Dropdown
                  label="Ustawienia"
                  icon={Settings}
                  isOpen={openMenu === "settings"}
                  onOpen={() => setOpenMenu(openMenu === "settings" ? null : "settings")}
              >
                {settingsItems
                    .filter((i) => access[i.pageKey]?.view)
                    .map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-secondary rounded text-sm"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </Link>
                    ))}
              </Dropdown>

            </nav>

            {/* === PRAWA CZĘŚĆ (UŻYTKOWNIK) === */}
            <div className="ml-auto relative">
              <button
                  onClick={() => setOpenMenu(openMenu === "user" ? null : "user")}
                  className="flex items-center gap-3"
              >
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground">
                    {me?.first_name} {me?.last_name}
                  </p>
                  <p className="text-xs text-muted-foreground">{role}</p>
                </div>

                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {me?.first_name?.[0]}
                  {me?.last_name?.[0]}
                </div>
              </button>

              {openMenu === "user" && (
                  <div
                      data-open={true}
                      className={cn(
                          "absolute right-0 mt-3 bg-card shadow-lg rounded-md p-2 w-48 z-50",
                          dropdownAnimation
                      )}
                  >
                    <Link to="/profil" className="block px-3 py-2 rounded hover:bg-secondary">
                      Profil
                    </Link>
                    <a
                        href="/Login/logout.php"
                        className="block px-3 py-2 rounded hover:bg-secondary text-red-500"
                    >
                      Wyloguj
                    </a>
                  </div>
              )}
            </div>

          </div>
        </header>

        {/* === TREŚĆ STRONY === */}
        <main className={cn("mx-auto max-w-[1600px] p-6", readOnlyClass)}>{children}</main>
      </div>
  );
};

export default Layout;

interface DropdownProps {
  label: string;
  icon: React.ElementType;
  isOpen: boolean;
  onOpen: () => void;
  children: ReactNode;
}

const Dropdown = ({ label, icon: Icon, isOpen, onOpen, children }: DropdownProps) => {
  const animation = "transition-all duration-150 origin-top transform scale-95 opacity-0 data-[open=true]:scale-100 data-[open=true]:opacity-100";

  return (
      <div className="relative">
        <button
            onClick={onOpen}
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                isOpen ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>

        {isOpen && (
            <div
                data-open={isOpen}
                className={cn("absolute mt-2 w-64 bg-card shadow-lg rounded-lg p-2 z-50", animation)}
            >
              {children}
            </div>
        )}
      </div>
  );
};
