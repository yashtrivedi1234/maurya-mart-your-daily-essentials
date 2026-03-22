import React, { useMemo, useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Package,
  ShoppingBag,
  Users,
  Loader2,
  RotateCw,
  Wifi,
  WifiOff,
  Zap,
  UserCheck,
  BadgeIndianRupee,
  Layers3,
  ChartColumn,
  Image,
  Bell,
  Settings,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Truck,
  AlertCircle,
} from "lucide-react";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useGetAllUsersQuery } from "@/store/api/authApi";
import { useGetAllOrdersQuery } from "@/store/api/orderApi";
import { useAdminContext } from "@/context/AdminContext";
import { usePageRefresh } from "@/hooks/usePageRefresh";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  _id: string;
  user: { name: string; email: string; _id: string };
  items: Array<{ product: { name: string; _id: string }; quantity: number; price: number }>;
  totalPrice: number;
  status: "Processing" | "Shipped" | "Delivered" | "Cancelled" | string;
  shippingAddress: {
    name: string; email: string; phone: string;
    address: string; city: string; state: string;
    country: string; pincode: string;
  };
  paymentStatus: string;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatCurrency = (amount: number) =>
  `₹${(amount || 0).toLocaleString("en-IN")}`;

const formatLastUpdate = (date: Date) => {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60)   return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
};

const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; dot: string; icon: React.ElementType }
> = {
  Delivered:  { label: "Delivered",  bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500", icon: CheckCircle2 },
  Processing: { label: "Processing", bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500",    icon: Clock },
  Shipped:    { label: "Shipped",    bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-500",   icon: Truck },
  Cancelled:  { label: "Cancelled",  bg: "bg-red-50",      text: "text-red-700",     dot: "bg-red-500",     icon: XCircle },
};

const getStatusCfg = (status: string) =>
  STATUS_CONFIG[status] ?? { label: status || "Unknown", bg: "bg-slate-50", text: "text-slate-600", dot: "bg-slate-400", icon: AlertCircle };

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Animated count-up wrapper — simple version without extra deps */
const StatValue = ({ value }: { value: string | number }) => (
  <span className="tabular-nums">{value}</span>
);

/** Primary KPI card */
const KpiCard = ({
  name,
  value,
  icon: Icon,
  accent,
  sub,
}: {
  name: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;   // tailwind bg class for icon bg
  sub?: string;
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
    {/* Soft glow blob */}
    <div className={cn("absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-10 blur-2xl", accent)} />

    <div className="flex items-start justify-between">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md", accent)}>
        <Icon className="h-5 w-5" />
      </div>
      <TrendingUp className="h-4 w-4 text-slate-300 transition-colors group-hover:text-teal-400" />
    </div>

    <p className="mt-4 text-sm font-medium text-slate-500">{name}</p>
    <p className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
      <StatValue value={value} />
    </p>
    {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
  </div>
);

/** Order status badge */
const StatusBadge = ({ status }: { status: string }) => {
  const cfg = getStatusCfg(status);
  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold", cfg.bg, cfg.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
};

/** Section header */
const SectionHeader = ({
  title,
  subtitle,
  action,
  onAction,
}: {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}) => (
  <div className="mb-5 flex items-start justify-between gap-4">
    <div>
      <h3 className="font-bold text-slate-900">{title}</h3>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
    {action && (
      <button
        onClick={onAction}
        className="flex shrink-0 items-center gap-1 text-xs font-semibold text-teal-600 transition-colors hover:text-teal-800"
      >
        {action}
        <ArrowRight className="h-3.5 w-3.5" />
      </button>
    )}
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate]     = useState<Date>(new Date());

  const productsQuery = useGetProductsQuery({});
  const usersQuery    = useGetAllUsersQuery();
  const ordersQuery   = useGetAllOrdersQuery({});

  const products = ((productsQuery.data as any)?.data || productsQuery.data || []) as any[];
  const users    = ((usersQuery.data   as any)?.data || usersQuery.data    || []) as any[];
  const orders   = ((ordersQuery.data  as any)?.data || ordersQuery.data   || []) as Order[];
  const ordersLoading = ordersQuery.isLoading;

  const { isConnected } = useAdminContext();

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([productsQuery.refetch(), usersQuery.refetch(), ordersQuery.refetch()]);
      setLastUpdate(new Date());
    } catch (err) {
      console.error(err);
    } finally {
      setIsRefreshing(false);
    }
  }, [productsQuery, usersQuery, ordersQuery]);

  usePageRefresh({ page: "dashboard", onRefresh: handleRefresh });

  // ── Derived metrics ────────────────────────────────────────────────────────

  const metrics = useMemo(() => {
    const totalRevenue = orders.reduce((s, o) => s + (o.totalPrice || 0), 0);
    const categories   = new Set(products.map((p: any) => p?.category?.trim()).filter(Boolean));
    const activeSet    = new Set(orders.map((o) => o?.user?._id).filter(Boolean));
    const paidSet      = new Set(
      orders
        .filter((o) => ["paid", "completed"].includes((o.paymentStatus || "").toLowerCase()))
        .map((o) => o?.user?._id)
        .filter(Boolean)
    );

    return {
      totalRevenue,
      totalOrders:     orders.length,
      totalCategories: categories.size,
      activeUsers:     activeSet.size,
      paidUsers:       paidSet.size,
      delivered:  orders.filter((o) => o.status === "Delivered").length,
      processing: orders.filter((o) => o.status === "Processing").length,
      shipped:    orders.filter((o) => o.status === "Shipped").length,
      cancelled:  orders.filter((o) => o.status === "Cancelled").length,
    };
  }, [orders, products]);

  const recentOrders = orders.slice(0, 6);

  // ── Static config ──────────────────────────────────────────────────────────

  const kpiCards = [
    { name: "Total Products",   value: products.length,                              icon: Package,          accent: "bg-blue-500" },
    { name: "Categories",       value: metrics.totalCategories,                      icon: Layers3,          accent: "bg-cyan-500" },
    { name: "Total Orders",     value: metrics.totalOrders,                          icon: ShoppingBag,      accent: "bg-teal-600" },
    { name: "Total Revenue",    value: formatCurrency(metrics.totalRevenue),         icon: BadgeIndianRupee, accent: "bg-orange-500" },
  ];

  const userStats = [
    { name: "Total Users",  value: users.length,         icon: Users,          accent: "bg-purple-500", caption: "All registered accounts" },
    { name: "Active Users", value: metrics.activeUsers,  icon: UserCheck,      accent: "bg-emerald-500", caption: "Have placed at least one order" },
    { name: "Paid Users",   value: metrics.paidUsers,    icon: BadgeIndianRupee, accent: "bg-green-600", caption: "Completed or paid orders" },
  ];

  const orderStatusStats = [
    { label: "Pending",   value: metrics.processing, icon: Clock,        color: "border-blue-500",    bg: "bg-blue-50",    text: "text-blue-700" },
    { label: "Delivered", value: metrics.delivered,  icon: CheckCircle2, color: "border-emerald-500", bg: "bg-emerald-50", text: "text-emerald-700" },
    { label: "Shipped",   value: metrics.shipped,    icon: Truck,        color: "border-amber-500",   bg: "bg-amber-50",   text: "text-amber-700" },
    { label: "Cancelled", value: metrics.cancelled,  icon: XCircle,      color: "border-red-500",     bg: "bg-red-50",     text: "text-red-700" },
  ];

  const dashboardModules = [
    { name: "Analytics",     description: "Revenue, orders, and category performance.",          icon: ChartColumn, path: "/admin/analytics",     iconBg: "bg-blue-50",    iconColor: "text-blue-600" },
    { name: "Media",         description: "Hero slides, brand assets, and storefront visuals.", icon: Image,       path: "/admin/media",          iconBg: "bg-fuchsia-50", iconColor: "text-fuchsia-600" },
    { name: "Notifications", description: "Newsletter audience and contact updates.",            icon: Bell,        path: "/admin/notifications",  iconBg: "bg-amber-50",   iconColor: "text-amber-600" },
    { name: "Settings",      description: "Admin tools, shortcuts, and system controls.",       icon: Settings,    path: "/admin/settings",       iconBg: "bg-slate-100",  iconColor: "text-slate-700" },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Welcome back, Super Admin. Here's what's happening today.
          </p>
          {/* Last update */}
          <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-400">
            <Zap className="h-3 w-3 shrink-0" />
            <span>Last updated: {formatLastUpdate(lastUpdate)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2.5">
          {/* Connection badge */}
          <div
            className={cn(
              "flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold shadow-sm",
              isConnected
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-amber-200 bg-amber-50 text-amber-700"
            )}
          >
            <span className={cn("relative flex h-2 w-2 rounded-full", isConnected ? "bg-emerald-500" : "bg-amber-500")}>
              {isConnected && (
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              )}
            </span>
            {isConnected ? "Live" : "Polling"}
          </div>

          {/* Refresh */}
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RotateCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            <span className="hidden sm:inline">{isRefreshing ? "Refreshing…" : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* ── KPI cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.name} {...card} />
        ))}
      </div>

      {/* ── User overview + Dashboard modules ──────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-5 xl:gap-6">

        {/* User overview */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 xl:col-span-2">
          <SectionHeader
            title="User Overview"
            subtitle="Customer growth and conversion snapshot."
            action="View Users"
            onAction={() => navigate("/admin/users")}
          />
          <div className="space-y-3">
            {userStats.map((stat) => (
              <div
                key={stat.name}
                className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-3 transition-colors hover:bg-slate-50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white shadow", stat.accent)}>
                    <stat.icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{stat.name}</p>
                    <p className="truncate text-xs text-slate-400">{stat.caption}</p>
                  </div>
                </div>
                <p className="ml-3 shrink-0 text-xl font-bold text-slate-900 tabular-nums sm:text-2xl">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard modules */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6 xl:col-span-3">
          <SectionHeader
            title="Dashboard Modules"
            subtitle="Quick shortcuts for key features."
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {dashboardModules.map((mod) => (
              <button
                key={mod.name}
                onClick={() => navigate(mod.path)}
                className="group flex flex-col rounded-xl border border-slate-100 p-4 text-left transition-all duration-150 hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", mod.iconBg, mod.iconColor)}>
                    <mod.icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 translate-x-0 text-slate-300 transition-all group-hover:translate-x-0.5 group-hover:text-teal-500" />
                </div>
                <p className="mt-3.5 text-sm font-bold text-slate-800">{mod.name}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500">{mod.description}</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Recent orders + Quick stats ─────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3 lg:gap-6">

        {/* Recent orders */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2.5">
              <h3 className="font-bold text-slate-900">Recent Orders</h3>
              {/* Live pill */}
              <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                Live
              </span>
            </div>
            <button
              onClick={() => navigate("/admin/orders")}
              className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800"
            >
              View All <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          {ordersLoading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
              <ShoppingBag className="h-10 w-10 text-slate-200" />
              <p className="text-sm text-slate-400">No orders yet</p>
            </div>
          ) : (
            <>
              {/* Table — desktop */}
              <div className="hidden overflow-x-auto sm:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Order</th>
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Customer</th>
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Amount</th>
                      <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentOrders.map((order: Order) => (
                      <tr key={order._id} className="transition-colors hover:bg-slate-50/50">
                        <td className="px-5 py-3.5">
                          <span className="font-mono text-xs font-bold text-slate-600">
                            #{order._id?.slice(-6).toUpperCase() || "N/A"}
                          </span>
                        </td>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold uppercase text-teal-700">
                              {order.user?.name?.[0] || "G"}
                            </div>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-800">
                                {order.user?.name || "Guest"}
                              </p>
                              <p className="truncate text-xs text-slate-400">
                                {order.user?.email || "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          <span className="font-bold text-slate-900">{formatCurrency(order.totalPrice)}</span>
                        </td>
                        <td className="px-5 py-3.5">
                          <StatusBadge status={order.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Card list — mobile */}
              <div className="divide-y divide-slate-100 sm:hidden">
                {recentOrders.map((order: Order) => (
                  <div key={order._id} className="flex items-center justify-between gap-3 px-4 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold uppercase text-teal-700">
                        {order.user?.name?.[0] || "G"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-slate-800">
                          {order.user?.name || "Guest"}
                        </p>
                        <p className="font-mono text-[11px] text-slate-400">
                          #{order._id?.slice(-6).toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-1">
                      <span className="text-sm font-bold text-slate-900">{formatCurrency(order.totalPrice)}</span>
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Quick stats */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <SectionHeader
            title="Order Status"
            subtitle="Breakdown of all orders by status."
            action="View Orders"
            onAction={() => navigate("/admin/orders")}
          />

          {/* 2-column grid on mobile/tablet, stack on lg in the sidebar */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-1">
            {orderStatusStats.map((stat) => (
              <div
                key={stat.label}
                className={cn(
                  "group flex items-center justify-between rounded-xl border-l-[3px] p-3.5 transition-all hover:shadow-sm",
                  stat.color, stat.bg
                )}
              >
                <div className="flex items-center gap-2.5">
                  <stat.icon className={cn("h-4 w-4 shrink-0", stat.text)} />
                  <p className={cn("text-xs font-bold uppercase tracking-wide", stat.text)}>
                    {stat.label}
                  </p>
                </div>
                <p className={cn("text-2xl font-bold tabular-nums", stat.text)}>
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          {/* Mini donut-style progress bars */}
          <div className="mt-5 space-y-2.5">
            {orderStatusStats.map((stat) => {
              const pct = metrics.totalOrders > 0
                ? Math.round((stat.value / metrics.totalOrders) * 100)
                : 0;
              return (
                <div key={stat.label}>
                  <div className="mb-1 flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-500">{stat.label}</span>
                    <span className="font-bold text-slate-700">{pct}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                    <div
                      className={cn("h-full rounded-full transition-all duration-700", stat.dot ?? stat.color.replace("border-", "bg-"))}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;