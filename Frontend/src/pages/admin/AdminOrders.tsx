import React, { useState, useCallback, useMemo } from "react";
import {
  ShoppingBag,
  Search,
  Eye,
  MoreVertical,
  CheckCircle2,
  Clock,
  XCircle,
  Truck,
  X,
  Copy,
  Check,
  ChevronDown,
  Loader2,
  MapPin,
  Phone,
  Mail,
  User,
  CreditCard,
  Package,
} from "lucide-react";
import { useGetAllOrdersQuery, useUpdateOrderStatusMutation } from "@/store/api/orderApi";
import { toast } from "sonner";
import { format } from "date-fns";
import { usePageRefresh } from "@/hooks/usePageRefresh";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface OrderItem {
  product: { name: string; image: string; price: number };
  quantity: number;
  price?: number;
}

interface Order {
  _id: string;
  user?: { name: string; email: string };
  createdAt: string;
  totalPrice: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  shippingAddress: {
    name?: string; phone?: string; address?: string;
    city?: string; pincode?: string;
  } | string;
  items: OrderItem[];
}

type StatusFilter  = "all" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
type PaymentFilter = "all" | "Paid" | "Pending";
type SortKey       = "newest" | "oldest" | "amount_high" | "amount_low";

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { bg: string; text: string; dot: string; icon: React.ElementType }> = {
  Delivered:  { bg: "bg-emerald-50",  text: "text-emerald-700", dot: "bg-emerald-500", icon: CheckCircle2 },
  Shipped:    { bg: "bg-blue-50",     text: "text-blue-700",    dot: "bg-blue-500",    icon: Truck        },
  Processing: { bg: "bg-amber-50",    text: "text-amber-700",   dot: "bg-amber-500",   icon: Clock        },
  Cancelled:  { bg: "bg-red-50",      text: "text-red-700",     dot: "bg-red-500",     icon: XCircle      },
};
const getStatusCfg = (s: string) =>
  STATUS_CFG[s] ?? { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400", icon: Package };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt  = (d: string) => format(new Date(d), "dd MMM, yyyy");
const fmtT = (d: string) => format(new Date(d), "HH:mm");
const inr  = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const cfg = getStatusCfg(status);
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold", cfg.bg, cfg.text)}>
      <span className={cn("h-1.5 w-1.5 rounded-full", cfg.dot)} />
      {status}
    </span>
  );
};

// ─── Inline status select (styled) ───────────────────────────────────────────

const StatusSelect = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) => {
  const cfg = getStatusCfg(value);
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={cn(
          "appearance-none rounded-xl border-0 py-1.5 pl-3 pr-7 text-[11px] font-bold uppercase outline-none cursor-pointer",
          cfg.bg, cfg.text
        )}
      >
        {["Processing", "Shipped", "Delivered", "Cancelled"].map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <ChevronDown className={cn("pointer-events-none absolute right-2 h-3 w-3", cfg.text)} />
    </div>
  );
};

// ─── Order detail dialog ──────────────────────────────────────────────────────

const OrderDetailDialog = ({
  order,
  open,
  onClose,
  onStatusChange,
}: {
  order: Order | null;
  open: boolean;
  onClose: () => void;
  onStatusChange: (id: string, status: string) => void;
}) => {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    if (!order) return;
    navigator.clipboard.writeText(order._id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!order) return null;

  const cfg     = getStatusCfg(order.status);
  const addr    = typeof order.shippingAddress === "object" ? order.shippingAddress : null;
  const addrStr = typeof order.shippingAddress === "string" ? order.shippingAddress : null;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-2xl gap-0 overflow-hidden rounded-2xl p-0">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <DialogTitle className="text-base font-bold text-slate-900">
                Order Details
              </DialogTitle>
              <button
                onClick={copyId}
                className="mt-0.5 flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
              >
                <span className="font-mono">#{order._id.slice(-10).toUpperCase()}</span>
                {copied ? <Check className="h-3 w-3 text-emerald-500" /> : <Copy className="h-3 w-3" />}
              </button>
            </div>
            <StatusBadge status={order.status} />
          </div>
          <DialogDescription className="sr-only">
            Order details for #{order._id}
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[75vh] space-y-5 overflow-y-auto px-6 py-5">

          {/* Customer + Shipping side by side */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Customer */}
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Customer</p>
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold uppercase text-teal-700">
                  {order.user?.name?.[0] || "G"}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-slate-800">{order.user?.name || "Guest"}</p>
                  <p className="truncate text-xs text-slate-400">{order.user?.email || "—"}</p>
                </div>
              </div>
            </div>

            {/* Shipping */}
            <div className="space-y-2 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Shipping Address</p>
              {addr ? (
                <div className="space-y-0.5 text-sm text-slate-700">
                  {addr.name     && <p className="font-semibold">{addr.name}</p>}
                  {addr.address  && <p className="text-slate-500">{addr.address}</p>}
                  {addr.city     && <p className="text-slate-500">{addr.city}{addr.pincode ? ` — ${addr.pincode}` : ""}</p>}
                  {addr.phone    && <p className="text-slate-500">{addr.phone}</p>}
                </div>
              ) : (
                <p className="text-sm text-slate-500">{addrStr || "No address provided"}</p>
              )}
            </div>
          </div>

          {/* Payment info row */}
          <div className="grid grid-cols-3 divide-x divide-slate-100 overflow-hidden rounded-xl border border-slate-100">
            {[
              { label: "Payment Status", value: order.paymentStatus, color: order.paymentStatus?.toLowerCase() === "paid" ? "text-emerald-700" : "text-amber-700" },
              { label: "Payment Method", value: order.paymentMethod || "—", color: "text-slate-800" },
              { label: "Order Date",     value: fmt(order.createdAt),        color: "text-slate-800" },
            ].map(({ label, value, color }) => (
              <div key={label} className="bg-white px-4 py-3">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <p className={cn("mt-1 text-sm font-semibold", color)}>{value}</p>
              </div>
            ))}
          </div>

          {/* Items */}
          <div>
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Items ({order.items.length})
            </p>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3 rounded-xl border border-slate-100 bg-white p-3">
                  <div className="flex h-11 w-11 shrink-0 overflow-hidden rounded-lg border border-slate-100 bg-slate-50 items-center justify-center">
                    {item.product?.image
                      ? <img src={item.product.image} className="h-full w-full object-cover" alt="" />
                      : <Package className="h-5 w-5 text-slate-300" />
                    }
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {item.product?.name || "Product"}
                    </p>
                    <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                  </div>
                  <p className="shrink-0 text-sm font-bold text-slate-900">
                    {inr((item.price || item.product?.price || 0) * item.quantity)}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-end">
            <div className="w-full max-w-xs space-y-1.5 rounded-xl border border-slate-100 bg-slate-50 p-4">
              <div className="flex justify-between text-sm text-slate-500">
                <span>Subtotal</span><span>{inr(order.totalPrice)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-500">
                <span>Shipping</span><span className="text-emerald-600 font-medium">Free</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2 text-base font-bold text-slate-900">
                <span>Total</span><span className="text-teal-700">{inr(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Update status */}
          <div>
            <p className="mb-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Update Status
            </p>
            <div className="flex flex-wrap gap-2">
              {["Processing", "Shipped", "Delivered", "Cancelled"].map((s) => {
                const c       = getStatusCfg(s);
                const isActive = order.status === s;
                return (
                  <button
                    key={s}
                    onClick={() => onStatusChange(order._id, s)}
                    className={cn(
                      "flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all",
                      isActive
                        ? cn(c.bg, c.text, "border-transparent shadow-sm")
                        : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    {isActive && <CheckCircle2 className="h-3.5 w-3.5" />}
                    {s}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 px-6 py-4">
          <button
            onClick={onClose}
            className="w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
          >
            Close
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminOrders = () => {
  const ordersQuery         = useGetAllOrdersQuery({});
  const { data: ordersRaw, isLoading } = ordersQuery;
  const [updateStatus]      = useUpdateOrderStatusMutation();

  const orders: Order[] = (ordersRaw as any)?.data || ordersRaw || [];

  const [search,        setSearch]        = useState("");
  const [statusFilter,  setStatusFilter]  = useState<StatusFilter>("all");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("all");
  const [sortBy,        setSortBy]        = useState<SortKey>("newest");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [detailOpen,    setDetailOpen]    = useState(false);

  // ── Refresh ────────────────────────────────────────────────────────────────
  const handleRefresh = useCallback(async () => {
    try { await ordersQuery.refetch(); } catch {}
  }, [ordersQuery]);

  usePageRefresh({ page: "orders", onRefresh: handleRefresh });

  // ── Status change ──────────────────────────────────────────────────────────
  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateStatus({ id, status }).unwrap();
      toast.success(`Status updated to ${status}`);
      if (selectedOrder?._id === id) {
        setSelectedOrder((o) => o ? { ...o, status } : o);
      }
      await handleRefresh();
    } catch {
      toast.error("Failed to update status");
    }
  };

  // ── Filtered + sorted orders ───────────────────────────────────────────────
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...orders]
      .filter((o) =>
        !q ||
        o._id.toLowerCase().includes(q) ||
        (o.user?.name || "").toLowerCase().includes(q) ||
        (o.user?.email || "").toLowerCase().includes(q)
      )
      .filter((o) => statusFilter  === "all" || o.status        === statusFilter)
      .filter((o) => paymentFilter === "all" || o.paymentStatus === paymentFilter)
      .sort((a, b) => {
        if (sortBy === "oldest")      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        if (sortBy === "amount_high") return b.totalPrice - a.totalPrice;
        if (sortBy === "amount_low")  return a.totalPrice - b.totalPrice;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [orders, search, statusFilter, paymentFilter, sortBy]);

  // ── KPI counts ─────────────────────────────────────────────────────────────
  const counts = useMemo(() => ({
    total:     orders.length,
    processing: orders.filter((o) => o.status === "Processing").length,
    shipped:    orders.filter((o) => o.status === "Shipped").length,
    delivered:  orders.filter((o) => o.status === "Delivered").length,
  }), [orders]);

  const isFiltered = statusFilter !== "all" || paymentFilter !== "all" || search.trim() !== "";

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Orders</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage customer orders and update fulfilment status.
        </p>
      </div>

      {/* ── KPI strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[
          { label: "Total",      value: counts.total,      accent: "text-slate-900",    iconBg: "bg-slate-100 text-slate-600",    icon: ShoppingBag  },
          { label: "Processing", value: counts.processing, accent: "text-amber-700",    iconBg: "bg-amber-50 text-amber-600",     icon: Clock        },
          { label: "Shipped",    value: counts.shipped,    accent: "text-blue-700",     iconBg: "bg-blue-50 text-blue-600",       icon: Truck        },
          { label: "Delivered",  value: counts.delivered,  accent: "text-emerald-700",  iconBg: "bg-emerald-50 text-emerald-600", icon: CheckCircle2 },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{s.label}</p>
              <p className={cn("mt-1 text-2xl font-bold tabular-nums", s.accent)}>{s.value}</p>
            </div>
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", s.iconBg)}>
              <s.icon className="h-5 w-5" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Table card ───────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center sm:gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by ID, name, or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm text-slate-700 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Filter dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className={cn(
                "flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors",
                isFiltered
                  ? "border-teal-300 bg-teal-50 text-teal-700"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              )}>
                <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M1.5 3h13l-5 6v4l-3-1.5V9L1.5 3z" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Filter
                {isFiltered && <span className="h-2 w-2 rounded-full bg-teal-500" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-xl">
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-slate-400">Status</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                {["all", "Processing", "Shipped", "Delivered", "Cancelled"].map((v) => (
                  <DropdownMenuRadioItem key={v} value={v} className="text-sm">
                    {v === "all" ? "All statuses" : v}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-slate-400">Payment</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={paymentFilter} onValueChange={(v) => setPaymentFilter(v as PaymentFilter)}>
                {["all", "Paid", "Pending"].map((v) => (
                  <DropdownMenuRadioItem key={v} value={v} className="text-sm">
                    {v === "all" ? "All payments" : v}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs font-bold uppercase tracking-wider text-slate-400">Sort</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                {[
                  ["newest",      "Newest first"],
                  ["oldest",      "Oldest first"],
                  ["amount_high", "Amount: high–low"],
                  ["amount_low",  "Amount: low–high"],
                ].map(([v, label]) => (
                  <DropdownMenuRadioItem key={v} value={v} className="text-sm">{label}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Result count strip */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-2.5">
          <p className="text-xs font-medium text-slate-500">
            {isFiltered
              ? `${filtered.length} of ${orders.length} orders`
              : `${orders.length} orders`}
          </p>
          {isFiltered && (
            <button
              onClick={() => { setSearch(""); setStatusFilter("all"); setPaymentFilter("all"); }}
              className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800"
            >
              <X className="h-3 w-3" /> Clear filters
            </button>
          )}
        </div>

        {/* ── Desktop table ──────────────────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-7 w-7 animate-spin text-teal-500" />
            <p className="text-sm text-slate-400">Loading orders…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <ShoppingBag className="h-7 w-7 text-slate-300" />
            </div>
            <p className="font-semibold text-slate-700">No orders found</p>
            <p className="text-sm text-slate-400">
              {isFiltered ? "Try adjusting your filters or search." : "Orders will appear here once customers start placing them."}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {["Order", "Customer", "Date", "Total", "Status", "Payment", ""].map((h) => (
                      <th key={h} className={cn(
                        "px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400",
                        h === "" && "text-right"
                      )}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((order) => (
                    <tr key={order._id} className="group transition-colors hover:bg-slate-50/60">
                      {/* Order ID */}
                      <td className="px-5 py-4">
                        <span className="font-mono text-xs font-bold text-slate-600">
                          #{order._id.slice(-8).toUpperCase()}
                        </span>
                      </td>

                      {/* Customer */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-xs font-bold uppercase text-teal-700">
                            {order.user?.name?.[0] || "G"}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">{order.user?.name || "Guest"}</p>
                            <p className="truncate text-xs text-slate-400">{order.user?.email || "—"}</p>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="whitespace-nowrap px-5 py-4">
                        <p className="text-slate-700">{fmt(order.createdAt)}</p>
                        <p className="text-xs text-slate-400">{fmtT(order.createdAt)}</p>
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4 font-bold text-slate-900">
                        {inr(order.totalPrice)}
                      </td>

                      {/* Status select */}
                      <td className="px-5 py-4">
                        <StatusSelect value={order.status} onChange={(v) => handleStatusChange(order._id, v)} />
                      </td>

                      {/* Payment */}
                      <td className="px-5 py-4">
                        <span className={cn(
                          "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                          order.paymentStatus?.toLowerCase() === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        )}>
                          {order.paymentStatus || "—"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button
                            onClick={() => { setSelectedOrder(order); setDetailOpen(true); }}
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                            title="View details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-colors hover:border-slate-300 hover:bg-slate-50">
                                <MoreVertical className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-xl">
                              <DropdownMenuItem onClick={() => { setSelectedOrder(order); setDetailOpen(true); }}>
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleStatusChange(order._id, "Delivered")}>
                                Mark Delivered
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(order._id)}>
                                Copy Order ID
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ──────────────────────────────────────────── */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filtered.map((order) => (
                <div key={order._id} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    {/* Customer */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-sm font-bold uppercase text-teal-700">
                        {order.user?.name?.[0] || "G"}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">{order.user?.name || "Guest"}</p>
                        <p className="font-mono text-[11px] text-slate-400">#{order._id.slice(-8).toUpperCase()}</p>
                      </div>
                    </div>

                    {/* More menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="rounded-xl">
                        <DropdownMenuItem onClick={() => { setSelectedOrder(order); setDetailOpen(true); }}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(order._id, "Delivered")}>
                          Mark Delivered
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(order._id)}>
                          Copy Order ID
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Date + Amount */}
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Date</p>
                      <p className="mt-0.5 text-sm font-medium text-slate-700">{fmt(order.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Amount</p>
                      <p className="mt-0.5 text-sm font-bold text-slate-900">{inr(order.totalPrice)}</p>
                    </div>
                  </div>

                  {/* Status + action */}
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <StatusBadge status={order.status} />
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                        order.paymentStatus?.toLowerCase() === "paid"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-amber-50 text-amber-700"
                      )}>
                        {order.paymentStatus || "—"}
                      </span>
                      <button
                        onClick={() => { setSelectedOrder(order); setDetailOpen(true); }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* ── Order detail dialog ──────────────────────────────────────────── */}
      <OrderDetailDialog
        order={selectedOrder}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedOrder(null); }}
        onStatusChange={handleStatusChange}
      />
    </div>
  );
};

export default AdminOrders;