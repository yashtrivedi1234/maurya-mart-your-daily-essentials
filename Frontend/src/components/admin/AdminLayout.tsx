import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Flame,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Image,
  Mail,
  MessageSquare,
  HelpCircle,
  Bell,
  BarChart3,
  Wifi,
  WifiOff,
  Sparkles,
  ChevronRight,
  RefreshCw,
  Shield,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import Logo from "@/assets/logo.png";
import { AdminProvider, useAdminContext } from "@/context/AdminContext";
import { useAdminRealtime } from "@/hooks/useAdminRealtime";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type NavItem = {
  name: string;
  path: string;
  icon: React.ElementType;
  badge?: number;
};

type NavSection = {
  label: string;
  items: NavItem[];
};

// ─── Static data ──────────────────────────────────────────────────────────────

const menuSections: NavSection[] = [
  {
    label: "Overview",
    items: [
      { name: "Dashboard",     path: "/admin",               icon: LayoutDashboard },
      { name: "Analytics",     path: "/admin/analytics",     icon: BarChart3 },
      { name: "Notifications", path: "/admin/notifications", icon: Bell,        badge: 3 },
      { name: "Settings",      path: "/admin/settings",      icon: Settings },
    ],
  },
  {
    label: "Commerce",
    items: [
      { name: "Products", path: "/admin/products", icon: Package },
      { name: "Trending", path: "/admin/trending", icon: Flame },
      { name: "Orders",   path: "/admin/orders",   icon: ShoppingBag, badge: 12 },
      { name: "Users",    path: "/admin/users",    icon: Users },
    ],
  },
  {
    label: "Content",
    items: [
      { name: "Media",        path: "/admin/media",      icon: Image },
      { name: "Hero Section", path: "/admin/hero",       icon: Sparkles },
      { name: "Brands",       path: "/admin/brands",     icon: Image },
      { name: "Newsletter",   path: "/admin/newsletter", icon: Mail },
      { name: "Messages",     path: "/admin/contacts",   icon: MessageSquare, badge: 5 },
      { name: "FAQs",         path: "/admin/faqs",       icon: HelpCircle },
    ],
  },
];

const pageTitles: Record<string, string> = {
  "/admin":               "Dashboard",
  "/admin/analytics":     "Analytics",
  "/admin/products":      "Products",
  "/admin/trending":      "Trending Products",
  "/admin/orders":        "Orders",
  "/admin/users":         "Users",
  "/admin/media":         "Media",
  "/admin/hero":          "Hero Section",
  "/admin/brands":        "Brands",
  "/admin/notifications": "Notifications",
  "/admin/newsletter":    "Newsletter",
  "/admin/contacts":      "Messages",
  "/admin/faqs":          "FAQs",
  "/admin/settings":      "Settings",
};

const pageDescriptions: Record<string, string> = {
  "/admin":               "Welcome back — here's what's happening today",
  "/admin/analytics":     "Track performance and growth metrics",
  "/admin/products":      "Manage your product catalog",
  "/admin/orders":        "View and manage customer orders",
  "/admin/users":         "Manage customer accounts",
  "/admin/settings":      "Configure system preferences",
  "/admin/contacts":      "Review customer messages",
  "/admin/notifications": "System alerts and updates",
  "/admin/media":         "Upload and organise media assets",
  "/admin/hero":          "Customise your storefront hero section",
  "/admin/brands":        "Manage featured brand logos",
  "/admin/newsletter":    "View and export subscriber list",
  "/admin/faqs":          "Manage frequently asked questions",
  "/admin/trending":      "Curate trending product placements",
};

// Quick-access tabs shown in the mobile bottom nav bar
const bottomBarItems: NavItem[] = [
  { name: "Dashboard", path: "/admin",          icon: LayoutDashboard },
  { name: "Products",  path: "/admin/products", icon: Package },
  { name: "Orders",    path: "/admin/orders",   icon: ShoppingBag, badge: 12 },
  { name: "Users",     path: "/admin/users",    icon: Users },
];

// ─── useWindowWidth hook ──────────────────────────────────────────────────────

function useWindowWidth() {
  const [width, setWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler, { passive: true });
    return () => window.removeEventListener("resize", handler);
  }, []);
  return width;
}

// ─── SidebarNavItem ───────────────────────────────────────────────────────────

const SidebarNavItem = ({
  item,
  collapsed = false,
  onClick,
}: {
  item: NavItem;
  collapsed?: boolean;
  onClick?: () => void;
}) => {
  const location = useLocation();
  const isActive = location.pathname === item.path;
  const Icon = item.icon;

  return (
    <Link
      to={item.path}
      onClick={onClick}
      title={collapsed ? item.name : undefined}
      className={cn(
        "group relative flex items-center rounded-xl transition-all duration-150",
        collapsed ? "h-10 w-10 justify-center" : "gap-3 px-3 py-2.5",
        isActive
          ? "bg-gradient-to-r from-teal-500 to-cyan-500 text-white shadow-md shadow-cyan-950/30"
          : "text-slate-400 hover:bg-white/[0.07] hover:text-slate-100"
      )}
    >
      {isActive && !collapsed && (
        <span className="absolute inset-y-1.5 -left-3 w-[3px] rounded-r-full bg-cyan-300/70" />
      )}

      <Icon
        className={cn(
          "shrink-0 transition-transform duration-150",
          collapsed ? "h-[18px] w-[18px]" : "h-[17px] w-[17px]",
          !isActive && "group-hover:scale-110"
        )}
      />

      {!collapsed && (
        <>
          <span className="flex-1 text-sm font-medium leading-none">{item.name}</span>
          <span className="ml-auto flex items-center gap-1.5">
            {item.badge && (
              <span
                className={cn(
                  "flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[10px] font-bold",
                  isActive ? "bg-white/25 text-white" : "bg-teal-500/20 text-teal-400"
                )}
              >
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            )}
            <ChevronRight
              className={cn(
                "h-3.5 w-3.5 transition-opacity",
                isActive ? "opacity-60" : "opacity-0 group-hover:opacity-40"
              )}
            />
          </span>
        </>
      )}

      {collapsed && item.badge && (
        <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-teal-500 text-[9px] font-bold text-white shadow">
          {item.badge > 9 ? "9+" : item.badge}
        </span>
      )}
    </Link>
  );
};

// ─── AdminLayoutContent ───────────────────────────────────────────────────────

const AdminLayoutContent = () => {
  const location   = useLocation();
  const navigate   = useNavigate();
  const windowWidth = useWindowWidth();

  const isMobile  = windowWidth < 768;
  const isTablet  = windowWidth >= 768 && windowWidth < 1024;
  const isDesktop = windowWidth >= 1024;

  const [collapsed,        setCollapsed]   = useState(isTablet);
  const [mobileDrawerOpen, setMobileDrawer] = useState(false);

  const { isConnected, triggerGlobalRefresh } = useAdminContext();
  useAdminRealtime({ enabled: true, verbose: false });

  // Adjust collapsed state when breakpoint changes
  useEffect(() => {
    if (isDesktop) setCollapsed(false);
    if (isTablet)  setCollapsed(true);
  }, [isDesktop, isTablet]);

  // Close drawer on navigation
  useEffect(() => { setMobileDrawer(false); }, [location.pathname]);

  // Close drawer on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileDrawer(false); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("isAdmin");
    navigate("/admin-login");
    window.location.reload();
  }, [navigate]);

  const currentTitle       = pageTitles[location.pathname]       || "Admin";
  const currentDescription = pageDescriptions[location.pathname] || "";
  const currentSectionLabel =
    menuSections.find((s) => s.items.some((i) => i.path === location.pathname))?.label ?? "Admin";

  // ── Shared sidebar body ──────────────────────────────────────────────────

  const SidebarInner = ({ drawer = false }: { drawer?: boolean }) => {
    const isIconOnly = collapsed && !drawer;

    return (
      <>
        {/* Logo row */}
        <div
          className={cn(
            "flex shrink-0 items-center border-b border-white/[0.07]",
            isIconOnly ? "justify-center px-2 py-4" : "gap-3 px-4 py-4 sm:px-5"
          )}
        >
          <img
            src={Logo}
            alt="MaurMart"
            className={cn(
              "shrink-0 object-contain drop-shadow-md transition-all duration-300",
              isIconOnly ? "h-8 w-8" : "h-9 w-auto"
            )}
          />
          {!isIconOnly && (
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold leading-none text-white">MaurMart</p>
              <p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.2em] text-teal-400">
                Admin Panel
              </p>
            </div>
          )}

          {/* Desktop collapse toggle */}
          {!drawer && (
            <button
              onClick={() => setCollapsed((c) => !c)}
              className="ml-auto flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white/10 hover:text-slate-300"
              title={isIconOnly ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isIconOnly
                ? <PanelLeftOpen  className="h-4 w-4" />
                : <PanelLeftClose className="h-4 w-4" />}
            </button>
          )}

          {/* Mobile drawer close */}
          {drawer && (
            <button
              onClick={() => setMobileDrawer(false)}
              className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-white/10 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Admin identity */}
        {!isIconOnly ? (
          <div className="mx-3 mt-4 flex shrink-0 items-center gap-2.5 rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2.5 sm:mx-4 sm:px-3.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 shadow-inner">
              <Shield className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">Administrator</p>
              <div className="mt-0.5 flex items-center gap-1.5">
                <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", isConnected ? "bg-emerald-400" : "bg-amber-400")} />
                <p className="truncate text-[11px] text-slate-400">
                  {isConnected ? "Live sync active" : "Polling mode"}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex justify-center">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-600 shadow"
              title={`Administrator — ${isConnected ? "Live" : "Polling"}`}
            >
              <Shield className="h-4 w-4 text-white" />
            </div>
          </div>
        )}

        {/* Navigation */}
        <nav
          className={cn(
            "flex-1 space-y-5 overflow-y-auto py-5 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10",
            isIconOnly ? "px-2" : "px-3 sm:px-3"
          )}
        >
          {menuSections.map((section) => (
            <div key={section.label}>
              {!isIconOnly ? (
                <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.25em] text-slate-600">
                  {section.label}
                </p>
              ) : (
                <div className="mb-2 h-px w-full bg-white/[0.06]" />
              )}
              <div className={cn("space-y-0.5", isIconOnly && "flex flex-col items-center")}>
                {section.items.map((item) => (
                  <SidebarNavItem
                    key={item.path}
                    item={item}
                    collapsed={isIconOnly}
                    onClick={drawer ? () => setMobileDrawer(false) : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div
          className={cn(
            "shrink-0 space-y-1 border-t border-white/[0.07] p-3",
            isIconOnly && "flex flex-col items-center"
          )}
        >
          <button
            onClick={() => navigate("/")}
            title={isIconOnly ? "Back to Store" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl text-sm font-medium text-slate-400 transition-colors hover:bg-white/[0.07] hover:text-slate-200",
              isIconOnly ? "h-10 w-10 justify-center" : "w-full px-3 py-2.5"
            )}
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {!isIconOnly && <span>Back to Store</span>}
          </button>
          <button
            onClick={handleLogout}
            title={isIconOnly ? "Logout" : undefined}
            className={cn(
              "flex items-center gap-3 rounded-xl text-sm font-medium text-rose-400/80 transition-colors hover:bg-rose-500/10 hover:text-rose-300",
              isIconOnly ? "h-10 w-10 justify-center" : "w-full px-3 py-2.5"
            )}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!isIconOnly && <span>Logout</span>}
          </button>
        </div>
      </>
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.10),_transparent_30%),linear-gradient(180deg,_#f8fafc_0%,_#eef2ff_100%)] text-slate-900">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px]">

        {/* ══ Desktop / Tablet sidebar ══════════════════════════════════════ */}
        <aside
          className={cn(
            "sticky top-0 hidden h-screen shrink-0 flex-col border-r border-white/[0.07] bg-slate-950 text-white transition-[width] duration-300 ease-in-out md:flex",
            collapsed ? "w-[68px]" : "w-[252px] lg:w-[264px]"
          )}
        >
          <SidebarInner />
        </aside>

        {/* ══ Mobile: backdrop ═════════════════════════════════════════════ */}
        <div
          aria-hidden="true"
          onClick={() => setMobileDrawer(false)}
          className={cn(
            "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden",
            mobileDrawerOpen
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          )}
        />

        {/* ══ Mobile drawer ════════════════════════════════════════════════ */}
        <aside
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className={cn(
            "fixed inset-y-0 left-0 z-50 flex w-[82vw] max-w-[290px] flex-col bg-slate-950 text-white shadow-2xl transition-transform duration-300 ease-in-out md:hidden",
            mobileDrawerOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <SidebarInner drawer />
        </aside>

        {/* ══ Main content ═════════════════════════════════════════════════ */}
        <main className="flex min-w-0 flex-1 flex-col">

          {/* ── Sticky top bar ──────────────────────────────────────────── */}
          <header className="sticky top-0 z-30 shrink-0 border-b border-white/60 bg-white/88 backdrop-blur-xl">
            <div className="flex items-center gap-2.5 px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3 md:px-5">

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileDrawer(true)}
                aria-label="Open menu"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 md:hidden"
              >
                <Menu className="h-4 w-4" />
              </button>

              {/* Mobile logo */}
              <div className="flex items-center gap-2 md:hidden">
                <img src={Logo} alt="MaurMart" className="h-7 w-auto object-contain" />
              </div>

              {/* Desktop breadcrumb + title */}
              <div className="hidden min-w-0 flex-1 md:block">
                <nav className="flex items-center gap-1 text-xs text-slate-400" aria-label="Breadcrumb">
                  <span>Admin</span>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span>{currentSectionLabel}</span>
                  <ChevronRight className="h-3 w-3 shrink-0" />
                  <span className="truncate font-semibold text-slate-700">{currentTitle}</span>
                </nav>
                <h1 className="mt-0.5 truncate text-sm font-bold leading-none text-slate-900 lg:text-[15px]">
                  {currentTitle}
                </h1>
              </div>

              {/* Mobile page title (center) */}
              <p className="flex-1 truncate text-sm font-bold text-slate-900 md:hidden">
                {currentTitle}
              </p>

              {/* Right side actions */}
              <div className="ml-auto flex shrink-0 items-center gap-2">
                {/* Refresh — hidden on xs */}
                <button
                  onClick={triggerGlobalRefresh}
                  title="Refresh data"
                  className="hidden items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 shadow-sm transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 active:scale-95 sm:flex"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span className="hidden lg:inline">Refresh</span>
                </button>

                {/* Connection pill */}
                <div
                  className={cn(
                    "flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-xs font-semibold shadow-sm sm:px-2.5",
                    isConnected
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  )}
                >
                  <span
                    className={cn(
                      "relative flex h-2 w-2 shrink-0 rounded-full",
                      isConnected ? "bg-emerald-500" : "bg-amber-500"
                    )}
                  >
                    {isConnected && (
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    )}
                  </span>
                  {/* Label: text on sm+, icon on xs */}
                  <span className="hidden sm:inline">
                    {isConnected ? "Real-time" : "Polling"}
                  </span>
                  <span className="sm:hidden">
                    {isConnected
                      ? <Wifi    className="h-3 w-3" />
                      : <WifiOff className="h-3 w-3" />}
                  </span>
                </div>
              </div>
            </div>

            {/* Page description — desktop only, shown as subtle sub-bar */}
            {currentDescription && (
              <div className="hidden border-t border-slate-100/70 px-5 py-1 md:block">
                <p className="text-[11px] text-slate-500">{currentDescription}</p>
              </div>
            )}
          </header>

          {/* ── Page content ─────────────────────────────────────────────── */}
          {/*
            Padding scale:
              mobile  (< 640)  : px-3  py-4
              sm      (≥ 640)  : px-5  py-5
              md      (≥ 768)  : px-6  py-6
              lg      (≥ 1024) : px-8  py-8
          */}
          <div className="flex-1 px-3 py-4 sm:px-5 sm:py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto w-full max-w-7xl">
              <Outlet />
            </div>
          </div>

          {/* ── Mobile bottom navigation bar ─────────────────────────────── */}
          {/*
            Shows 4 quick-access tabs + "More" which opens the full drawer.
            Hidden on md and up (they use the sidebar instead).
          */}
          <nav
            aria-label="Mobile navigation"
            className="sticky bottom-0 z-30 shrink-0 border-t border-slate-200/80 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex items-stretch">
              {bottomBarItems.map((item) => {
                const Icon     = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "relative flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold transition-colors",
                      isActive ? "text-teal-600" : "text-slate-400 active:text-slate-700"
                    )}
                  >
                    {/* Active indicator bar */}
                    {isActive && (
                      <span className="absolute inset-x-4 top-0 h-0.5 rounded-b-full bg-gradient-to-r from-teal-500 to-cyan-500" />
                    )}
                    <span className="relative">
                      <Icon className={cn("h-5 w-5 transition-transform", isActive && "scale-110")} />
                      {item.badge && (
                        <span className="absolute -right-2 -top-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-teal-500 text-[8px] font-bold text-white">
                          {item.badge > 9 ? "9+" : item.badge}
                        </span>
                      )}
                    </span>
                    <span>{item.name}</span>
                  </Link>
                );
              })}

              {/* "More" opens the full drawer */}
              <button
                onClick={() => setMobileDrawer(true)}
                className="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-semibold text-slate-400 active:text-slate-700"
              >
                <Menu className="h-5 w-5" />
                <span>More</span>
              </button>
            </div>
          </nav>
        </main>
      </div>
    </div>
  );
};

// ─── Root export ──────────────────────────────────────────────────────────────

const AdminLayout = () => (
  <AdminProvider>
    <AdminLayoutContent />
  </AdminProvider>
);

export default AdminLayout;