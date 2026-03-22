import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Flame,
  Search,
  Edit2,
  Trash2,
  Plus,
  X,
  Star,
  Package,
  ChevronDown,
  Loader2,
  TrendingUp,
  AlertCircle,
  ExternalLink,
} from "lucide-react";
import {
  useGetProductsQuery,
  useUpdateProductStatusMutation,
} from "@/store/api/productApi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  stock: number;
  image: string;
  rating?: number;
  isTrending?: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const stockBadge = (stock: number) => {
  if (stock > 10) return { label: "In Stock",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (stock > 0)  return { label: "Low Stock",  cls: "bg-amber-50 text-amber-700 border-amber-200"       };
  return              { label: "Out of Stock", cls: "bg-red-50 text-red-700 border-red-200"              };
};
const stockDot = (s: number) => s > 10 ? "bg-emerald-500" : s > 0 ? "bg-amber-500" : "bg-red-500";

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-1">
    <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
    <span className="text-sm font-semibold tabular-nums text-slate-700">{(rating || 0).toFixed(1)}</span>
  </div>
);

// ─── Product detail dialog (compact) ─────────────────────────────────────────

const ProductDetailDialog = ({
  product,
  open,
  onClose,
  onRemove,
}: {
  product: Product | null;
  open: boolean;
  onClose: () => void;
  onRemove: (p: Product) => void;
}) => {
  if (!product) return null;
  const sb = stockBadge(product.stock);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="w-full max-w-sm gap-0 overflow-hidden rounded-2xl p-0">
        {/* Horizontal: image left, info right */}
        <div className="flex items-stretch">
          <div className="h-28 w-28 shrink-0 overflow-hidden bg-slate-100">
            <img src={product.image} alt={product.name} className="h-full w-full object-cover" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-between px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-bold text-slate-900">{product.name}</p>
              <span className="mt-1 inline-block rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-700">
                {product.category}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-900">{inr(product.price)}</span>
              <StarRating rating={product.rating || 0} />
              <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", sb.cls)}>
                <span className={cn("h-1.5 w-1.5 rounded-full", stockDot(product.stock))} />
                {product.stock}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-slate-100 px-4 py-3">
          <button
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Close
          </button>
          {product.isTrending && (
            <button
              onClick={() => { onRemove(product); onClose(); }}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2 text-xs font-semibold text-white hover:bg-rose-700"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminTrending = () => {
  const navigate = useNavigate();
  const { data: productsResponse, isLoading } = useGetProductsQuery({});
  const [updateProductStatus] = useUpdateProductStatusMutation();

  const products = ((productsResponse as any)?.data || productsResponse || []) as Product[];

  const [search,          setSearch]          = useState("");
  const [filterCategory,  setFilterCategory]  = useState("");
  const [sortBy,          setSortBy]          = useState<"name" | "price" | "rating">("name");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailOpen,      setDetailOpen]      = useState(false);
  const [showAll,         setShowAll]         = useState(false);

  // ── Derived lists ──────────────────────────────────────────────────────────

  const categories = useMemo(() =>
    Array.from(new Set(products.map((p) => p.category))).sort(),
  [products]);

  const trending = useMemo(() => products.filter((p) => p.isTrending), [products]);
  const available = useMemo(() => products.filter((p) => !p.isTrending), [products]);

  const filteredTrending = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...trending]
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .filter((p) => !filterCategory || p.category === filterCategory)
      .sort((a, b) => {
        if (sortBy === "price")  return b.price - a.price;
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return a.name.localeCompare(b.name);
      });
  }, [trending, search, filterCategory, sortBy]);

  const filteredAvailable = useMemo(() => {
    const q = search.trim().toLowerCase();
    return available.filter((p) =>
      !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
  }, [available, search]);

  const avgRating = trending.length > 0
    ? (trending.reduce((s, p) => s + (p.rating || 0), 0) / trending.length).toFixed(1)
    : "—";

  const visibleAvailable = showAll ? filteredAvailable : filteredAvailable.slice(0, 8);

  // ── Toggle trending ────────────────────────────────────────────────────────

  const handleToggle = async (product: Product, isTrending: boolean) => {
    try {
      await updateProductStatus({ id: product._id, statusData: { isTrending } }).unwrap();
      toast.success(isTrending
        ? `"${product.name}" added to trending`
        : `"${product.name}" removed from trending`
      );
    } catch {
      toast.error("Failed to update trending status");
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Trending Products
            </h1>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Curate the products shown in the storefront trending section.
          </p>
        </div>
        <button
          onClick={() => navigate("/admin/products")}
          className="flex shrink-0 items-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition-all hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
        >
          <ExternalLink className="h-4 w-4" />
          Product Manager
        </button>
      </div>

      {/* ── KPI strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Trending</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-orange-600">{trending.length}</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50">
            <Flame className="h-5 w-5 text-orange-500" />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Available</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-teal-700">{available.length}</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50">
            <Plus className="h-5 w-5 text-teal-500" />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Avg Rating</p>
            <p className="mt-1 text-2xl font-bold tabular-nums text-amber-600">{avgRating}</p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
            <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          </div>
        </div>
      </div>

      {/* ── Trending section ─────────────────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <h2 className="font-bold text-slate-900">Currently Trending</h2>
          <span className="rounded-full bg-orange-50 px-2.5 py-0.5 text-[11px] font-bold text-orange-600">
            {trending.length}
          </span>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search trending products…"
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

          {/* Category select */}
          <div className="relative">
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-8 text-sm font-medium text-slate-600 focus:border-teal-400 focus:outline-none"
            >
              <option value="">All Categories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>

          {/* Sort select */}
          <div className="relative">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="appearance-none rounded-xl border border-slate-200 bg-white py-2.5 pl-3.5 pr-8 text-sm font-medium text-slate-600 focus:border-teal-400 focus:outline-none"
            >
              <option value="name">Name A–Z</option>
              <option value="price">Price: high–low</option>
              <option value="rating">Rating: high–low</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </div>
        </div>

        {/* Table card */}
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3 py-20">
              <Loader2 className="h-7 w-7 animate-spin text-teal-500" />
              <p className="text-sm text-slate-400">Loading products…</p>
            </div>
          ) : filteredTrending.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-50">
                <Flame className="h-8 w-8 text-orange-200" />
              </div>
              <p className="font-semibold text-slate-700">
                {search || filterCategory ? "No results found" : "No trending products yet"}
              </p>
              <p className="text-sm text-slate-400">
                {search || filterCategory
                  ? "Try adjusting your search or filter."
                  : "Add products from the available list below."}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/70">
                      {["Product", "Category", "Price", "Rating", "Stock", ""].map((h) => (
                        <th key={h} className={cn("px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400", h === "" && "text-right")}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredTrending.map((product) => {
                      const sb = stockBadge(product.stock);
                      return (
                        <tr key={product._id} className="group transition-colors hover:bg-slate-50/60">
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-3">
                              <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                                <img src={product.image} alt="" className="h-full w-full object-cover" />
                              </div>
                              <div className="min-w-0">
                                <p className="max-w-[180px] truncate font-semibold text-slate-800">{product.name}</p>
                                <p className="font-mono text-[10px] text-slate-400">{product._id.slice(-8).toUpperCase()}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-teal-700">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-5 py-4 font-bold text-slate-900">{inr(product.price)}</td>
                          <td className="px-5 py-4"><StarRating rating={product.rating || 0} /></td>
                          <td className="px-5 py-4">
                            <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold", sb.cls)}>
                              <span className={cn("h-1.5 w-1.5 rounded-full", stockDot(product.stock))} />
                              {product.stock}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="flex items-center justify-end gap-1.5 opacity-0 transition-opacity group-hover:opacity-100">
                              <button
                                onClick={() => { setSelectedProduct(product); setDetailOpen(true); }}
                                className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                                title="View details"
                              >
                                <Edit2 className="h-4 w-4" />
                              </button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <button
                                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                    title="Remove from trending"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent className="max-w-sm rounded-2xl">
                                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                                    <Flame className="h-5 w-5" />
                                  </div>
                                  <AlertDialogTitle className="mt-3 text-base font-bold text-slate-900">
                                    Remove from trending?
                                  </AlertDialogTitle>
                                  <AlertDialogDescription className="text-sm text-slate-500">
                                    <strong>{product.name}</strong> will no longer appear in the storefront trending section.
                                  </AlertDialogDescription>
                                  <div className="mt-2 flex gap-3">
                                    <AlertDialogCancel className="flex-1 rounded-xl">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleToggle(product, false)}
                                      className="flex-1 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                                    >
                                      Remove
                                    </AlertDialogAction>
                                  </div>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredTrending.map((product) => {
                  const sb = stockBadge(product.stock);
                  return (
                    <div key={product._id} className="flex items-start gap-3 p-4">
                      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                        <img src={product.image} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate font-semibold text-slate-800">{product.name}</p>
                            <span className="mt-0.5 inline-block rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-700">{product.category}</span>
                          </div>
                          <button
                            onClick={() => handleToggle(product, false)}
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-rose-200 bg-rose-50 text-rose-600 transition-colors hover:bg-rose-100"
                            title="Remove"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <span className="font-bold text-slate-900">{inr(product.price)}</span>
                          <StarRating rating={product.rating || 0} />
                          <span className={cn("inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold", sb.cls)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", stockDot(product.stock))} />
                            {product.stock}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ── Available products ───────────────────────────────────────────── */}
      {available.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-teal-500" />
              <h2 className="font-bold text-slate-900">Available to Add</h2>
              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold text-teal-600">
                {filteredAvailable.length}
              </span>
            </div>
          </div>

          {/* Info banner */}
          <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
            <p className="text-xs text-blue-800">
              Click <strong>"Add to Trending"</strong> on any card to feature it in the storefront trending carousel.
            </p>
          </div>

          {/* Product grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
            {visibleAvailable.map((product) => (
              <div
                key={product._id}
                className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
              >
                {/* Image */}
                <div className="relative aspect-square overflow-hidden bg-slate-50">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Rating overlay */}
                  {product.rating && product.rating > 0 && (
                    <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-full bg-black/50 px-2 py-0.5 backdrop-blur-sm">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-bold text-white">{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="p-3">
                  <p className="line-clamp-2 text-xs font-semibold leading-tight text-slate-800 sm:text-sm">{product.name}</p>
                  <div className="mt-1.5 flex items-center justify-between">
                    <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-700">
                      {product.category}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{inr(product.price)}</span>
                  </div>

                  <button
                    onClick={() => handleToggle(product, true)}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-teal-600 py-2 text-xs font-semibold text-white transition-colors hover:bg-teal-700 active:scale-95"
                  >
                    <Flame className="h-3.5 w-3.5 text-orange-300" />
                    Add to Trending
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Show more / less */}
          {filteredAvailable.length > 8 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <p className="text-xs text-slate-400">
                Showing {visibleAvailable.length} of {filteredAvailable.length} products
              </p>
              <button
                onClick={() => setShowAll((s) => !s)}
                className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-600 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
              >
                {showAll ? "Show less" : `Show all ${filteredAvailable.length}`}
                <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showAll && "rotate-180")} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Product detail dialog ────────────────────────────────────────── */}
      <ProductDetailDialog
        product={selectedProduct}
        open={detailOpen}
        onClose={() => { setDetailOpen(false); setSelectedProduct(null); }}
        onRemove={(p) => handleToggle(p, false)}
      />
    </div>
  );
};

export default AdminTrending;