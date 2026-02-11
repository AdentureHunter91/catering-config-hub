import { ReactNode, useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
  Package,
  ChevronRight,
  BellRing,
  Check,
  CheckCheck,
  History,
} from "lucide-react";

import { cn } from "@/lib/utils";
import { buildAuthUrl } from "@/api/apiBase";
import { useAccessContext } from "@/auth/AccessContext";
import { usePageAccess } from "@/auth/usePageAccess";
import { listNotifications, markNotificationsRead, NotificationRow } from "@/api/notifications";

interface LayoutProps {
  children: ReactNode;
  pageKey?: string;
  noPadding?: boolean;
}

type SubMenuItem = {
  label: string;
  path: string;
  pageKey: string;
};

type MenuItem = {
  label: string;
  path: string;
  pageKey: string;
  icon: React.ElementType;
  submenu?: SubMenuItem[];
};

const Layout = ({ children, pageKey, noPadding }: LayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { access, me } = useAccessContext();
  const { canView, canEdit } = usePageAccess(pageKey || "");

  // Dropdowny
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement | null>(null);
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loadingNotifications, setLoadingNotifications] = useState<boolean>(false);
  const [notificationError, setNotificationError] = useState<string | null>(null);

  // Rola (opcjonalnie — do wyświetlania obok nazwiska)
  const role = me?.roles?.join(", ") || "Użytkownik";

  // Zamknij menu przy kliknięciu poza
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
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

  const readOnlyClass = !canEdit
      ? "opacity-60 pointer-events-none select-none"
      : "";

  // ---- PODMENU (DIETETYKA) ----
  const dietItems: MenuItem[] = [
    { label: "Dashboard", path: "/dietetyka", pageKey: "diet.meals_approval", icon: Home },
    { label: "Zamówienia / Akceptacja", path: "/dietetyka/akceptacja-posilkow", pageKey: "diet.meals_approval", icon: UtensilsCrossed },
    { label: "Produkty", path: "/dietetyka/produkty", pageKey: "config.products", icon: Package },
    { label: "Receptury", path: "/dietetyka/receptury", pageKey: "diet.meals_approval", icon: BookOpen },
    { label: "Dania", path: "/dietetyka/dania", pageKey: "diet.meals_approval", icon: UtensilsCrossed },
    { label: "Jadłospisy", path: "/dietetyka/jadlospisy", pageKey: "diet.meals_approval", icon: BookOpen },
    { label: "Wydawki", path: "/dietetyka/wydawki", pageKey: "diet.meals_approval", icon: FileText },
    { label: "Produkcja", path: "/dietetyka/produkcja", pageKey: "diet.meals_approval", icon: Building2 },
    { label: "Raporty", path: "/dietetyka/raporty", pageKey: "diet.meals_approval", icon: FileText },
  ];

  // ---- PODMENU (USTAWIENIA) ----
  const settingsItems: MenuItem[] = [
    {
      label: "Kontrakty",
      path: "/kontrakty",
      pageKey: "config.contracts_list",
      icon: FileText,
    },
    { label: "Klienci", path: "/klienci", pageKey: "config.clients_list", icon: Users },
    { label: "Kuchnie", path: "/kuchnie", pageKey: "config.kitchens_list", icon: Building2 },
    {
      label: "Oddziały",
      path: "/oddzialy",
      pageKey: "config.departments_list",
      icon: Building2,
    },
    { label: "Diety", path: "/diety", pageKey: "config.diets", icon: BookOpen },
    {
      label: "Typy posiłków",
      path: "/posilki",
      pageKey: "config.meal_types",
      icon: UtensilsCrossed,
    },
    {
      label: "Produkty",
      path: "",
      pageKey: "config.products",
      icon: Package,
      submenu: [
        { label: "Kategorie", path: "/settings/productCategories", pageKey: "config.products" },
        { label: "Konfiguracja produktów", path: "/settings/products", pageKey: "config.products" },
        { label: "Baza Instytutu Żywienia", path: "/settings/nutritionDatabase", pageKey: "config.products" },
      ],
    },
    { label: "Użytkownicy", path: "/uzytkownicy", pageKey: "config.users", icon: Users },
    {
      label: "Role i uprawnienia",
      path: "/uprawnienia",
      pageKey: "config.permissions",
      icon: Shield,
    },
    {
      label: "Dostęp do stron",
      path: "/dostep-stron",
      pageKey: "config.page_access",
      icon: Shield,
    },
    {
      label: "Powiadomienia",
      path: "/settings/notifications",
      pageKey: "config.page_access",
      icon: Shield,
    },
    { label: "Dziennik zdarzeń", path: "/audit", pageKey: "config.audit", icon: FileText },
  ];

  const dropdownAnimation =
      "transition-all duration-150 origin-top transform scale-95 opacity-0 data-[open=true]:scale-100 data-[open=true]:opacity-100";

  const navLinkClass = (isActive: boolean) =>
      cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
          isActive
              ? "bg-primary text-primary-foreground"
              : "text-muted-foreground hover:bg-secondary hover:text-foreground"
      );

  const [expandedSubmenu, setExpandedSubmenu] = useState<string | null>(null);

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      setNotificationError(null);
      const res = await listNotifications({ status: "open", unreadOnly: true, limit: 200 });
      const rows = res.rows || [];
      setNotifications(rows);
      setUnreadCount(rows.length);
    } catch {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationError("Nie udało się pobrać powiadomień.");
    } finally {
      setLoadingNotifications(false);
    }
  };

  useEffect(() => {
    void fetchNotifications();
    const id = window.setInterval(fetchNotifications, 30_000);
    return () => window.clearInterval(id);
  }, []);

  const notificationLabel = (n: NotificationRow) => {
    if (n.type === "diet_meal_approval_pending") return "Korekty po czasie";
    return "Powiadomienie";
  };

  const notificationSubtitle = (n: NotificationRow) => {
    const kitchen = n.kitchen_short_name || n.kitchen_name || "Kuchnia —";
    const client = n.client_short_name || n.client_full_name || `Klient #${n.client_id}`;
    return `${kitchen} • ${client} • ${n.meal_date}`;
  };

  const formatWhen = (value: string) => {
    try {
      return new Date(value).toLocaleString();
    } catch {
      return value;
    }
  };

  const markAllNotificationsRead = async () => {
    if (notifications.length === 0) return;
    try {
      const ids = notifications.map((n) => n.id);
      await markNotificationsRead(ids);
      await fetchNotifications();
    } catch {
      setNotificationError("Nie udało się oznaczyć wszystkich jako przeczytane.");
    }
  };

  const markOneNotificationRead = async (id: number) => {
    try {
      await markNotificationsRead([id]);
      await fetchNotifications();
    } catch {
      setNotificationError("Nie udało się oznaczyć powiadomienia jako przeczytane.");
    }
  };

  const renderDropdownItems = (items: MenuItem[]) => {
    const visible = items.filter((i) => access[i.pageKey]?.view);
    if (visible.length === 0) {
      return <div className="p-2 text-muted-foreground text-xs">Brak dostępu</div>;
    }

    return visible.map((item) => {
      if (item.submenu && item.submenu.length > 0) {
        const isExpanded = expandedSubmenu === item.label;
        return (
          <div key={item.label}>
            <button
              className="flex items-center justify-between w-full gap-2 px-3 py-2 hover:bg-secondary rounded text-sm"
              onClick={() => setExpandedSubmenu(isExpanded ? null : item.label)}
            >
              <div className="flex items-center gap-2">
                <item.icon className="h-4 w-4" />
                {item.label}
              </div>
              <ChevronRight className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
            </button>
            {isExpanded && (
              <div className="ml-6 border-l pl-2">
                {item.submenu.map((sub) => (
                  <Link
                    key={sub.path}
                    to={sub.path}
                    className="flex items-center gap-2 px-3 py-2 hover:bg-secondary rounded text-sm"
                  >
                    {sub.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        );
      }
      return (
        <Link
          key={item.path}
          to={item.path}
          className="flex items-center gap-2 px-3 py-2 hover:bg-secondary rounded text-sm"
        >
          <item.icon className="h-4 w-4" />
          {item.label}
        </Link>
      );
    });
  };

  return (
      <div className="min-h-screen bg-background">
        {/* === TOP NAV === */}
        <header className="sticky top-0 z-[1200] w-full border-b bg-card shadow-sm">
          <div className="flex h-16 items-center px-6" ref={headerRef}>
            {/* LOGO */}
            <Link to="/dashboard" className="font-bold text-xl mr-10">
              CateringHub
            </Link>

            {/* === LEWE MENU === */}
            <nav className="flex gap-4 items-center">
              {/* DASHBOARD */}
              <Link to="/dashboard" className={navLinkClass(location.pathname.startsWith("/dashboard"))}>
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
                {renderDropdownItems(dietItems)}
              </Dropdown>

              {/* USTAWIENIA */}
              <Dropdown
                  label="Ustawienia"
                  icon={Settings}
                  isOpen={openMenu === "settings"}
                  onOpen={() => setOpenMenu(openMenu === "settings" ? null : "settings")}
              >
                {renderDropdownItems(settingsItems)}
              </Dropdown>
            </nav>

            {/* === PRAWA CZĘŚĆ (POWIADOMIENIA + UŻYTKOWNIK) === */}
            <div className="ml-auto relative flex items-center gap-4">
              <div className="relative">
                <button
                  onClick={() => setOpenMenu(openMenu === "notifications" ? null : "notifications")}
                  className={cn(
                    "relative flex items-center justify-center px-2 py-2",
                    "text-muted-foreground hover:text-foreground"
                  )}
                  title="Powiadomienia"
                >
                  <BellRing className="h-6 w-6" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-rose-600 px-1 text-[11px] font-bold text-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  )}
                </button>

                {openMenu === "notifications" && (
                  <div
                    data-open={true}
                    className={cn(
                      "absolute right-0 mt-3 w-[360px] bg-card shadow-lg rounded-md p-2 z-[1300]",
                      dropdownAnimation
                    )}
                  >
                    <div className="px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
                      <span>Powiadomienia</span>
                      <div className="flex items-center gap-3">
                        <button
                          className="inline-flex items-center justify-center text-primary hover:text-primary/80"
                          title="Historia powiadomień"
                          aria-label="Historia powiadomień"
                          onClick={() => {
                            setOpenMenu(null);
                            navigate("/settings/notifications-history");
                          }}
                        >
                          <History className="h-4 w-4" />
                        </button>
                        <button
                          className="text-xs text-primary hover:underline"
                          onClick={() => void fetchNotifications()}
                          disabled={loadingNotifications}
                        >
                          Odśwież
                        </button>
                        <button
                          className="inline-flex items-center justify-center text-primary hover:text-primary/80"
                          onClick={() => void markAllNotificationsRead()}
                          disabled={loadingNotifications || notifications.length === 0}
                          title="Oznacz wszystkie jako przeczytane"
                          aria-label="Oznacz wszystkie jako przeczytane"
                        >
                          <CheckCheck className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    {loadingNotifications ? (
                      <div className="px-3 py-4 text-sm text-muted-foreground">Ładowanie…</div>
                    ) : notificationError ? (
                      <div className="px-3 py-4 text-sm text-rose-600">{notificationError}</div>
                    ) : notifications.length === 0 ? (
                      <div className="px-3 py-4 text-sm text-muted-foreground">Brak nowych powiadomień</div>
                    ) : (
                      <div className="max-h-80 overflow-auto">
                        {notifications.map((n) => (
                          <div
                            key={n.id}
                            className="flex items-start justify-between gap-3 rounded-md px-3 py-2 hover:bg-secondary"
                          >
                            <button
                              className="flex-1 text-left"
                              onClick={() => {
                                setOpenMenu(null);
                                navigate("/dietetyka/akceptacja-posilkow");
                              }}
                            >
                              <div className="text-sm font-medium text-foreground">
                                {notificationLabel(n)} ({n.count})
                              </div>
                              <div className="text-xs text-muted-foreground">{notificationSubtitle(n)}</div>
                              <div className="text-[11px] text-muted-foreground">
                                Ostatnia zmiana: {formatWhen(n.last_at)}
                              </div>
                            </button>
                            <button
                              className="mt-1 inline-flex h-7 w-7 items-center justify-center rounded-full border bg-background text-primary hover:bg-secondary"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                void markOneNotificationRead(n.id);
                              }}
                              title="Oznacz jako przeczytane"
                              aria-label="Oznacz jako przeczytane"
                            >
                              <Check className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
                          "absolute right-0 mt-3 bg-card shadow-lg rounded-md p-2 w-48 z-[1300]",
                          dropdownAnimation
                      )}
                  >
                    <Link to="/profil" className="block px-3 py-2 rounded hover:bg-secondary">
                      Profil
                    </Link>
                    <a
                        href={buildAuthUrl("Login/logout.php")}
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
        <main className={cn(noPadding ? "" : "mx-auto max-w-[1600px] p-6", readOnlyClass)}>{children}</main>
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
  const animation =
      "transition-all duration-150 origin-top transform scale-95 opacity-0 data-[open=true]:scale-100 data-[open=true]:opacity-100";

  return (
      <div className="relative">
        <button
            onClick={onOpen}
            className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
                isOpen
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            )}
        >
          <Icon className="h-4 w-4" />
          {label}
        </button>

        {isOpen && (
            <div
                data-open={isOpen}
                className={cn("absolute mt-2 w-64 bg-card shadow-lg rounded-lg p-2 z-[1300]", animation)}
            >
              {children}
            </div>
        )}
      </div>
  );
};
