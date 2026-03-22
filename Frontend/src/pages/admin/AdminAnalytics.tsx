import React, { useMemo } from "react";
import {
  BarChart3,
  BadgeIndianRupee,
  ShoppingBag,
  Users,
  Layers3,
  TrendingUp,
  Award,
  UserCheck,
  CreditCard,
} from "lucide-react";
import { useGetProductsQuery } from "@/store/api/productApi";
import { useGetAllOrdersQuery } from "@/store/api/orderApi";
import { useGetAllUsersQuery } from "@/store/api/authApi";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Order {
  _id: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  user?: { _id?: string };
}

// ─── Palette for category bars ────────────────────────────────────────────────

const BAR_COLORS = [
  "bg-teal-500",
  "bg-cyan-500",
  "bg-blue-500",
  "bg-indigo-500",
  "bg-purple-500",
  "bg-fuchsia-500",
  "bg-orange-500",
  "bg-emerald-500",
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const KpiCard = ({
  label,
  value,
  icon: Icon,
  accent,
  note,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accent: string;
  note?: string;
}) => (
  <div className="group relative overflow-hidden rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-6">
    <div className={cn("absolute -right-4 -top-4 h-20 w-20 rounded-full opacity-[0.08] blur-2xl", accent)} />
    <div className="flex items-start justify-between">
      <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md", accent)}>
        <Icon className="h-5 w-5" />
      </div>
      <TrendingUp className="h-4 w-4 text-slate-200 transition-colors group-hover:text-teal-400" />
    </div>
    <p className="mt-4 text-sm font-medium text-slate-500">{label}</p>
    <p className="mt-1 text-2xl font-bold tabular-nums tracking-tight text-slate-900 sm:text-3xl">
      {value}
    </p>
    {note && <p className="mt-1 text-xs text-slate-400">{note}</p>}
  </div>
);

const HighlightCard = ({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  sub: string;
  icon: React.ElementType;
  accent: string;
}) => (
  <div className="flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/60 px-4 py-4 transition-colors hover:bg-slate-50">
    <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow", accent)}>
      <Icon className="h-4.5 w-4.5 h-[18px] w-[18px]" />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="mt-0.5 text-lg font-bold tabular-nums text-slate-900">{value}</p>
      <p className="mt-0.5 truncate text-xs text-slate-500">{sub}</p>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────

const AdminAnalytics = () => {
  const { data: productsResponse = [] } = useGetProductsQuery({});
  const { data: ordersResponse   = [] } = useGetAllOrdersQuery({});
  const { data: usersResponse    = [] } = useGetAllUsersQuery();

  const products = ((productsResponse as any)?.data || productsResponse || []) as Array<{ category?: string; stock?: number }>;
  const orders   = ((ordersResponse   as any)?.data || ordersResponse   || []) as Order[];
  const users    = ((usersResponse    as any)?.data || usersResponse    || []) as Array<{ _id: string }>;

  const { revenue, paidOrders, categoryBreakdown, topCategory, activeUsers } = useMemo(() => {
    const revenueTotal = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const paid         = orders.filter((o) => ["paid", "completed"].includes((o.paymentStatus || "").toLowerCase()));
    const userIds      = new Set(orders.map((o) => o.user?._id).filter(Boolean));

    const catMap = products.reduce<Record<string, number>>((acc, p) => {
      const key = p.category?.trim() || "Uncategorized";
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
    const sorted = Object.entries(catMap).sort((a, b) => b[1] - a[1]);

    return {
      revenue:           revenueTotal,
      paidOrders:        paid.length,
      categoryBreakdown: sorted,
      topCategory:       sorted[0],
      activeUsers:       userIds.size,
    };
  }, [orders, products]);

  const maxCatCount = categoryBreakdown[0]?.[1] ?? 1;

  const summaryCards = [
    { label: "Total Revenue",  value: `₹${revenue.toLocaleString("en-IN")}`, icon: BadgeIndianRupee, accent: "bg-teal-600",   note: "Across all orders" },
    { label: "Total Orders",   value: orders.length,                          icon: ShoppingBag,      accent: "bg-blue-500",   note: `${paidOrders} paid` },
    { label: "Registered Users", value: users.length,                         icon: Users,            accent: "bg-purple-500", note: `${activeUsers} active` },
    { label: "Categories",     value: categoryBreakdown.length,               icon: Layers3,          accent: "bg-cyan-500",   note: topCategory ? `Top: ${topCategory[0]}` : undefined },
  ];

  const highlights = [
    {
      label: "Top Category",
      value: topCategory?.[0] || "—",
      sub:   topCategory ? `${topCategory[1]} products` : "No data yet",
      icon:  Award,
      accent: "bg-teal-500",
    },
    {
      label: "Active Users",
      value: activeUsers,
      sub:   "Users with at least one order",
      icon:  UserCheck,
      accent: "bg-purple-500",
    },
    {
      label: "Paid Orders",
      value: paidOrders,
      sub:   "Marked paid or completed",
      icon:  CreditCard,
      accent: "bg-emerald-600",
    },
    {
      label: "Conversion",
      value: users.length > 0 ? `${Math.round((activeUsers / users.length) * 100)}%` : "—",
      sub:   "Registered users who ordered",
      icon:  TrendingUp,
      accent: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Analytics</h1>
        <p className="mt-1 text-sm text-slate-500">
          Live business metrics for users, orders, revenue, and categories.
        </p>
      </div>

      {/* ── KPI cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {summaryCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Category distribution + Highlights ───────────────────────────── */}
      <div className="grid grid-cols-1 gap-5 xl:grid-cols-3 xl:gap-6">

        {/* Category distribution chart */}
        <div className="rounded-2xl border border-slate-100 bg-white shadow-sm xl:col-span-2">
          <div className="flex items-center gap-2.5 border-b border-slate-100 px-5 py-4 sm:px-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-50">
              <BarChart3 className="h-4 w-4 text-teal-600" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900">Category Distribution</h2>
              <p className="text-xs text-slate-500">Products per category</p>
            </div>
          </div>

          <div className="px-5 py-5 sm:px-6 sm:py-6">
            {categoryBreakdown.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <Layers3 className="h-10 w-10 text-slate-200" />
                <p className="text-sm text-slate-400">No category data available yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {categoryBreakdown.map(([category, count], i) => {
                  const pct = Math.round((count / maxCatCount) * 100);
                  const barColor = BAR_COLORS[i % BAR_COLORS.length];
                  return (
                    <div key={category}>
                      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", barColor)} />
                          <span className="truncate font-medium text-slate-700">{category}</span>
                        </div>
                        <div className="flex shrink-0 items-center gap-3">
                          <span className="text-xs text-slate-400 tabular-nums">
                            {count} {count === 1 ? "product" : "products"}
                          </span>
                          <span className="w-8 text-right text-xs font-bold tabular-nums text-slate-600">
                            {pct}%
                          </span>
                        </div>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div
                          className={cn("h-full rounded-full transition-all duration-700", barColor)}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Product count legend */}
          {categoryBreakdown.length > 0 && (
            <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 sm:px-6">
              <p className="text-xs text-slate-400">
                {products.length} total products across {categoryBreakdown.length} categories
              </p>
              <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
                Live
              </span>
            </div>
          )}
        </div>

        {/* Highlights */}
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="font-bold text-slate-900">Highlights</h2>
            <p className="mt-0.5 text-xs text-slate-500">Key performance indicators at a glance.</p>
          </div>
          <div className="space-y-3">
            {highlights.map((h) => (
              <HighlightCard key={h.label} {...h} />
            ))}
          </div>
        </div>
      </div>

      {/* ── Revenue breakdown bar (visual) ───────────────────────────────── */}
      {orders.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="mb-5">
            <h2 className="font-bold text-slate-900">Order Status Breakdown</h2>
            <p className="mt-0.5 text-xs text-slate-500">
              Visual share of each order status across {orders.length} orders.
            </p>
          </div>

          {(() => {
            const statuses = [
              { label: "Delivered",  color: "bg-emerald-500", count: orders.filter((o) => o.status === "Delivered").length },
              { label: "Processing", color: "bg-blue-500",    count: orders.filter((o) => o.status === "Processing").length },
              { label: "Shipped",    color: "bg-amber-500",   count: orders.filter((o) => o.status === "Shipped").length },
              { label: "Cancelled",  color: "bg-red-500",     count: orders.filter((o) => o.status === "Cancelled").length },
            ].filter((s) => s.count > 0);

            const total = statuses.reduce((s, x) => s + x.count, 0) || 1;

            return (
              <>
                {/* Stacked bar */}
                <div className="flex h-4 w-full overflow-hidden rounded-full">
                  {statuses.map((s) => (
                    <div
                      key={s.label}
                      className={cn("h-full transition-all duration-700", s.color)}
                      style={{ width: `${(s.count / total) * 100}%` }}
                      title={`${s.label}: ${s.count}`}
                    />
                  ))}
                </div>

                {/* Legend */}
                <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
                  {statuses.map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5">
                      <span className={cn("h-2.5 w-2.5 shrink-0 rounded-full", s.color)} />
                      <span className="text-xs text-slate-600">
                        <span className="font-semibold">{s.label}</span>
                        <span className="ml-1 text-slate-400">
                          {s.count} ({Math.round((s.count / total) * 100)}%)
                        </span>
                      </span>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default AdminAnalytics;