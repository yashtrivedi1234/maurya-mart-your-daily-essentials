import React, { useState, useCallback, useMemo } from "react";
import {
  Package,
  Plus,
  Search,
  MoreVertical,
  Edit2,
  Trash2,
  ChevronRight,
  ChevronLeft,
  ImagePlus,
  Sparkles,
  Tag,
  Layers,
  X,
  Check,
  Star,
  Sparkles as NewArrivalIcon,
  Flame,
  Loader2,
  Copy,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  useGetProductsQuery,
  useDeleteProductMutation,
  useCreateProductMutation,
  useUpdateProductMutation,
} from "@/store/api/productApi";
import { toast } from "sonner";
import { usePageRefresh } from "@/hooks/usePageRefresh";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { normalizeWhitespace } from "@/lib/validation";
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

// ─── Types ────────────────────────────────────────────────────────────────────

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  stock: number;
  image: string;
  description: string;
  isFeatured?: boolean;
  isNewArrival?: boolean;
  isTrending?: boolean;
  highlights?: string[];
  specifications?: { label: string; value: string }[];
  questions?: { question: string; answer: string }[];
  bankOffers?: string[];
  inTheBox?: string[];
  soldLastMonth?: number;
  deliveryInfo?: { standard: string; standardDays: string; express: string; expressDays: string; expressPrice: number };
  sellerInfo?: { name: string; rating: number; ratingPercentage: string };
  returnPolicy?: { days: number; description: string };
  warranty?: { duration: string; description: string };
  paymentMethods?: string[];
}

type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";
type SortKey     = "newest" | "name" | "price_high" | "price_low" | "stock_high" | "stock_low";

// ─── Normalisers (unchanged logic) ───────────────────────────────────────────

const normalizeStringList = (items: string[] = []) =>
  items.map((item) => normalizeWhitespace(item)).filter(Boolean);

const normalizeProductPayload = (product: Partial<Product>) => {
  const next: Record<string, unknown> = {};
  if (product.name          !== undefined) next.name          = normalizeWhitespace(product.name);
  if (product.category      !== undefined) next.category      = normalizeWhitespace(product.category);
  if (product.description   !== undefined) next.description   = normalizeWhitespace(product.description);
  if (product.price         !== undefined) next.price         = Number(product.price);
  if (product.originalPrice !== undefined) next.originalPrice = Number(product.originalPrice);
  if (product.stock         !== undefined) next.stock         = Number(product.stock);
  if ((product as any).rating     !== undefined) next.rating     = Number((product as any).rating);
  if ((product as any).numReviews !== undefined) next.numReviews = Number((product as any).numReviews);
  if (product.isFeatured    !== undefined) next.isFeatured    = product.isFeatured;
  if (product.isNewArrival  !== undefined) next.isNewArrival  = product.isNewArrival;
  if (product.isTrending    !== undefined) next.isTrending    = product.isTrending;
  if (product.highlights    !== undefined) next.highlights    = normalizeStringList(product.highlights);
  if (product.bankOffers    !== undefined) next.bankOffers    = normalizeStringList(product.bankOffers);
  if (product.inTheBox      !== undefined) next.inTheBox      = normalizeStringList(product.inTheBox);
  if (product.paymentMethods !== undefined) next.paymentMethods = normalizeStringList(product.paymentMethods);
  if (product.soldLastMonth !== undefined) next.soldLastMonth = Number(product.soldLastMonth);
  if (product.specifications !== undefined)
    next.specifications = product.specifications
      .map((s) => ({ label: normalizeWhitespace(s.label), value: normalizeWhitespace(s.value) }))
      .filter((s) => s.label && s.value);
  if (product.questions !== undefined)
    next.questions = product.questions
      .map((q) => ({ question: normalizeWhitespace(q.question), answer: normalizeWhitespace(q.answer) }))
      .filter((q) => q.question && q.answer);
  if (product.deliveryInfo !== undefined)
    next.deliveryInfo = { ...product.deliveryInfo, standard: normalizeWhitespace(product.deliveryInfo?.standard || ""), standardDays: normalizeWhitespace(product.deliveryInfo?.standardDays || ""), express: normalizeWhitespace(product.deliveryInfo?.express || ""), expressDays: normalizeWhitespace(product.deliveryInfo?.expressDays || ""), expressPrice: Number(product.deliveryInfo?.expressPrice || 0) };
  if (product.sellerInfo !== undefined)
    next.sellerInfo = { ...product.sellerInfo, name: normalizeWhitespace(product.sellerInfo?.name || ""), rating: Number(product.sellerInfo?.rating || 0), ratingPercentage: normalizeWhitespace(product.sellerInfo?.ratingPercentage || "") };
  if (product.returnPolicy !== undefined)
    next.returnPolicy = { days: Number(product.returnPolicy?.days || 0), description: normalizeWhitespace(product.returnPolicy?.description || "") };
  if (product.warranty !== undefined)
    next.warranty = { duration: normalizeWhitespace(product.warranty?.duration || ""), description: normalizeWhitespace(product.warranty?.description || "") };
  return next;
};

const validateProductPayload = (product: Partial<Product>) => {
  const name     = normalizeWhitespace(product.name     || "");
  const category = normalizeWhitespace(product.category || "");
  const price    = Number(product.price);
  const stock    = Number(product.stock);
  if (!name)                                                       return "Product name is required";
  if (!category)                                                   return "Category is required";
  if (!Number.isFinite(price) || price <= 0)                      return "Sale price must be greater than 0";
  if (!Number.isFinite(stock) || stock < 0)                       return "Stock cannot be negative";
  if (product.originalPrice !== undefined && Number(product.originalPrice) < 0) return "MRP cannot be negative";
  if ((product as any).rating !== undefined) { const r = Number((product as any).rating); if (!Number.isFinite(r) || r < 0 || r > 5) return "Rating must be between 0 and 5"; }
  return null;
};

// ─── Stock helpers ────────────────────────────────────────────────────────────

const stockBadge = (stock: number) => {
  if (stock > 10)  return { label: "In Stock",   cls: "bg-emerald-50 text-emerald-700 border-emerald-200" };
  if (stock > 0)   return { label: "Low Stock",  cls: "bg-amber-50 text-amber-700 border-amber-200"       };
  return               { label: "Out of Stock", cls: "bg-red-50 text-red-700 border-red-200"              };
};
const stockDot = (stock: number) =>
  stock > 10 ? "bg-emerald-500" : stock > 0 ? "bg-amber-500" : "bg-red-500";

const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;

// ─── Step indicator ───────────────────────────────────────────────────────────

const StepIndicator = ({ currentStep }: { currentStep: 1 | 2 }) => (
  <div className="mb-6 flex items-center gap-0">
    {[{ n: 1, label: "Core Details" }, { n: 2, label: "Rich Content" }].map(({ n, label }, idx) => {
      const done   = currentStep > n;
      const active = currentStep === n;
      return (
        <React.Fragment key={n}>
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all duration-300",
              done   ? "bg-teal-600 text-white" :
              active ? "bg-teal-600 text-white ring-4 ring-teal-500/20" :
                       "bg-slate-100 text-slate-400"
            )}>
              {done ? <Check className="h-4 w-4" /> : n}
            </div>
            <span className={cn("text-sm font-semibold transition-colors", active ? "text-slate-900" : "text-slate-400")}>
              {label}
            </span>
          </div>
          {idx === 0 && (
            <div className="relative mx-3 h-px flex-1 overflow-hidden bg-slate-200">
              <div
                className="absolute inset-y-0 left-0 bg-teal-500 transition-all duration-500"
                style={{ width: currentStep === 2 ? "100%" : "0%" }}
              />
            </div>
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ─── Section header ───────────────────────────────────────────────────────────

const SectionHeader = ({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) => (
  <div className="mb-3.5 flex items-start gap-3">
    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
      <Icon className="h-4 w-4" />
    </div>
    <div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
    </div>
  </div>
);

// ─── Dynamic list ─────────────────────────────────────────────────────────────

const DynamicList = ({ items, onChange, placeholder, addLabel }: { items: string[]; onChange: (v: string[]) => void; placeholder?: string; addLabel: string }) => (
  <div className="space-y-2">
    {items.map((item, i) => (
      <div key={i} className="group flex gap-2">
        <Input
          value={item}
          placeholder={placeholder}
          onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
          className="rounded-xl text-sm border-slate-200 focus:border-teal-400 focus:ring-teal-400/20"
        />
        <button
          type="button"
          onClick={() => onChange(items.filter((_, idx) => idx !== i))}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    ))}
    <button
      type="button"
      onClick={() => onChange([...items, ""])}
      className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 transition-colors hover:text-teal-800"
    >
      <Plus className="h-3.5 w-3.5" /> {addLabel}
    </button>
  </div>
);

// ─── Product form (2-step — logic unchanged, styling improved) ────────────────

const ProductForm = ({
  product, onChange, onSubmit, submitLabel, onCancel, mode, isLoading = false,
}: {
  product: Partial<Product>;
  onChange: (p: Partial<Product>) => void;
  onSubmit: (e: React.FormEvent, file: File | null) => void;
  submitLabel: string;
  onCancel: () => void;
  mode: "create" | "edit";
  isLoading?: boolean;
}) => {
  const [step, setStep]             = useState<1 | 2>(1);
  const [selectedFile, setFile]     = useState<File | null>(null);
  const [imagePreview, setPreview]  = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please select a valid image file"); return; }
    setFile(file);
    const r = new FileReader();
    r.onloadend = () => setPreview(r.result as string);
    r.readAsDataURL(file);
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "create" && !selectedFile) { toast.error("Please select a product image"); return; }
    setStep(2);
  };

  const fieldCls = "rounded-xl border-slate-200 text-sm focus:border-teal-400 focus:ring-teal-400/20";
  const labelCls = "text-[10px] font-bold uppercase tracking-wider text-slate-500";

  return (
    <form onSubmit={(e) => onSubmit(e, selectedFile)} className="flex flex-col">
      <StepIndicator currentStep={step} />

      {/* ── Step 1 ── */}
      <div className={cn("space-y-6", step !== 1 && "hidden")}>

        {/* Image */}
        <div>
          <SectionHeader icon={ImagePlus} title="Product Image" subtitle="Upload a high-quality product photo" />
          <label className="block cursor-pointer">
            <input type="file" name="productImage" accept="image/*" className="sr-only" onChange={handleFileChange} />
            <div className={cn(
              "relative overflow-hidden rounded-2xl border-2 border-dashed transition-all",
              imagePreview || product.image
                ? "border-teal-300 bg-teal-50/40"
                : "border-slate-200 hover:border-teal-300 hover:bg-teal-50/30"
            )}>
              {imagePreview || product.image ? (
                <div className="flex items-center gap-4 p-4">
                  <div className="h-20 w-20 shrink-0 overflow-hidden rounded-xl border border-slate-100">
                    <img src={imagePreview || product.image} alt="" className="h-full w-full object-cover" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">Image ready</p>
                    <p className="mt-0.5 text-xs text-slate-400">Click to replace</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                    <ImagePlus className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Click or drag & drop</p>
                  <p className="text-xs text-slate-400">PNG, JPG, WEBP up to 10 MB</p>
                </div>
              )}
            </div>
          </label>
        </div>

        {/* Basic info */}
        <div>
          <SectionHeader icon={Package} title="Basic Information" />
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className={labelCls}>Product Name</Label>
              <Input required placeholder="Amul Gold Full Cream Milk 1L" value={product.name || ""} onChange={(e) => onChange({ ...product, name: e.target.value })} className={fieldCls} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Category</Label>
              <Input required placeholder="Dairy, Snacks…" value={product.category || ""} onChange={(e) => onChange({ ...product, category: e.target.value })} className={fieldCls} />
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>Stock (units)</Label>
              <Input type="number" required placeholder="25" value={product.stock || ""} onChange={(e) => onChange({ ...product, stock: Number(e.target.value) })} className={fieldCls} />
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div>
          <SectionHeader icon={Tag} title="Pricing" subtitle="Set sale price and original MRP" />
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className={labelCls}>Sale Price (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">₹</span>
                <Input type="number" required placeholder="499" value={product.price || ""} onChange={(e) => onChange({ ...product, price: Number(e.target.value) })} className={cn(fieldCls, "pl-7")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className={labelCls}>MRP (₹)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">₹</span>
                <Input type="number" placeholder="599" value={product.originalPrice || ""} onChange={(e) => onChange({ ...product, originalPrice: Number(e.target.value) })} className={cn(fieldCls, "pl-7")} />
              </div>
            </div>
            {product.price && product.originalPrice && product.originalPrice > product.price && (
              <div className="col-span-2 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-sm font-semibold text-emerald-700">
                  {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% discount applied
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Labels / flags */}
        <div>
          <SectionHeader icon={Sparkles} title="Product Labels" subtitle="Tag this product for better visibility" />
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            {[
              { key: "isFeatured",   label: "Featured",    desc: "Shown in featured section", Icon: Star           },
              { key: "isNewArrival", label: "New Arrival", desc: "Recently added",             Icon: NewArrivalIcon },
              { key: "isTrending",   label: "Trending",    desc: "Popular right now",          Icon: Flame          },
            ].map(({ key, label, desc, Icon }) => {
              const checked = product[key as keyof Product] as boolean;
              return (
                <label key={key} className={cn(
                  "flex cursor-pointer flex-col gap-1 rounded-xl border-2 p-3 transition-all",
                  checked ? "border-teal-400 bg-teal-50/60" : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}>
                  <div className="flex items-center gap-2">
                    <Checkbox checked={checked || false} onCheckedChange={(v) => onChange({ ...product, [key]: Boolean(v) })} />
                    <Icon className="h-4 w-4 text-teal-600" />
                    <span className="text-sm font-semibold text-slate-800">{label}</span>
                  </div>
                  <span className="pl-6 text-[10px] text-slate-500">{desc}</span>
                </label>
              );
            })}
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={(e) => handleNext(e as any)} className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
            Next: Rich Content <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Step 2 ── */}
      <div className={cn("space-y-6", step !== 2 && "hidden")}>

        <div>
          <SectionHeader icon={Sparkles} title="Highlights" subtitle="Key selling points shown prominently" />
          <DynamicList items={product.highlights || []} onChange={(v) => onChange({ ...product, highlights: v })} placeholder="Rich taste and creamy texture" addLabel="Add highlight" />
        </div>

        <div className="border-t border-slate-100 pt-5">
          <SectionHeader icon={Layers} title="Specifications" subtitle="Technical details in label/value pairs" />
          <div className="space-y-2">
            {(product.specifications || []).map((s, i) => (
              <div key={i} className="group flex gap-2">
                <Input placeholder="Label, e.g. Weight" value={s.label} onChange={(e) => { const n = [...(product.specifications || [])]; n[i] = { ...n[i], label: e.target.value }; onChange({ ...product, specifications: n }); }} className={cn(fieldCls, "w-2/5")} />
                <Input placeholder="Value, e.g. 1 litre" value={s.value} onChange={(e) => { const n = [...(product.specifications || [])]; n[i] = { ...n[i], value: e.target.value }; onChange({ ...product, specifications: n }); }} className={cn(fieldCls, "flex-1")} />
                <button type="button" onClick={() => onChange({ ...product, specifications: (product.specifications || []).filter((_, idx) => idx !== i) })} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => onChange({ ...product, specifications: [...(product.specifications || []), { label: "", value: "" }] })} className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-800">
              <Plus className="h-3.5 w-3.5" /> Add specification
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <SectionHeader icon={Package} title="Customer Q&A" subtitle="Common questions and answers" />
          <div className="space-y-3">
            {(product.questions || []).map((q, i) => (
              <div key={i} className="group relative space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                <Input placeholder="Is this item delivered chilled?" value={q.question} onChange={(e) => { const n = [...(product.questions || [])]; n[i] = { ...n[i], question: e.target.value }; onChange({ ...product, questions: n }); }} className={cn(fieldCls, "bg-white")} />
                <Textarea placeholder="Yes, dairy items are packed and delivered with care." rows={2} value={q.answer} onChange={(e) => { const n = [...(product.questions || [])]; n[i] = { ...n[i], answer: e.target.value }; onChange({ ...product, questions: n }); }} className={cn(fieldCls, "resize-none bg-white")} />
                <button type="button" onClick={() => onChange({ ...product, questions: (product.questions || []).filter((_, idx) => idx !== i) })} className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-lg border border-slate-200 text-slate-400 opacity-0 transition-all group-hover:opacity-100 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
            <button type="button" onClick={() => onChange({ ...product, questions: [...(product.questions || []), { question: "", answer: "" }] })} className="flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-800">
              <Plus className="h-3.5 w-3.5" /> Add Q&A
            </button>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <SectionHeader icon={Tag} title="Bank Offers" subtitle="Discount codes or EMI offers" />
          <DynamicList items={product.bankOffers || []} onChange={(v) => onChange({ ...product, bankOffers: v })} placeholder="10% instant discount on HDFC cards" addLabel="Add bank offer" />
        </div>

        <div className="border-t border-slate-100 pt-5">
          <SectionHeader icon={Package} title="What's in the Box" subtitle="Items included with the product" />
          <DynamicList items={product.inTheBox || []} onChange={(v) => onChange({ ...product, inTheBox: v })} placeholder="1 x 1L milk pack" addLabel="Add box item" />
        </div>

        <div className="border-t border-slate-100 pt-5">
          <SectionHeader icon={Package} title="Delivery & Seller Info" subtitle="Configure delivery options and seller details" />
          <div className="space-y-4">
            <div>
              <Label className={labelCls}>Units Sold Last Month</Label>
              <Input type="number" placeholder="350" value={(product as any).soldLastMonth || ""} onChange={(e) => onChange({ ...product, soldLastMonth: Number(e.target.value) })} className={cn(fieldCls, "mt-1.5")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className={labelCls}>Delivery Type</Label><Input placeholder="Free delivery" value={(product as any).deliveryInfo?.standard || ""} onChange={(e) => onChange({ ...product, deliveryInfo: { ...(product as any).deliveryInfo, standard: e.target.value } })} className={cn(fieldCls, "mt-1.5")} /></div>
              <div><Label className={labelCls}>Estimated Days</Label><Input placeholder="30–45 minutes" value={(product as any).deliveryInfo?.standardDays || ""} onChange={(e) => onChange({ ...product, deliveryInfo: { ...(product as any).deliveryInfo, standardDays: e.target.value } })} className={cn(fieldCls, "mt-1.5")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className={labelCls}>Seller Name</Label><Input placeholder="MaurMart Fresh" value={(product as any).sellerInfo?.name || ""} onChange={(e) => onChange({ ...product, sellerInfo: { ...(product as any).sellerInfo, name: e.target.value } })} className={cn(fieldCls, "mt-1.5")} /></div>
              <div><Label className={labelCls}>Seller Rating (0–5)</Label><Input type="number" step="0.1" min="0" max="5" placeholder="4.7" value={(product as any).sellerInfo?.rating || ""} onChange={(e) => onChange({ ...product, sellerInfo: { ...(product as any).sellerInfo, rating: Number(e.target.value) } })} className={cn(fieldCls, "mt-1.5")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className={labelCls}>Return Days</Label><Input type="number" placeholder="7" value={(product as any).returnPolicy?.days || ""} onChange={(e) => onChange({ ...product, returnPolicy: { ...(product as any).returnPolicy, days: Number(e.target.value) } })} className={cn(fieldCls, "mt-1.5")} /></div>
              <div><Label className={labelCls}>Return Description</Label><Input placeholder="Easy returns on damaged items" value={(product as any).returnPolicy?.description || ""} onChange={(e) => onChange({ ...product, returnPolicy: { ...(product as any).returnPolicy, description: e.target.value } })} className={cn(fieldCls, "mt-1.5")} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className={labelCls}>Warranty Duration</Label><Input placeholder="Best before 2 days" value={(product as any).warranty?.duration || ""} onChange={(e) => onChange({ ...product, warranty: { ...(product as any).warranty, duration: e.target.value } })} className={cn(fieldCls, "mt-1.5")} /></div>
              <div><Label className={labelCls}>Warranty Description</Label><Input placeholder="Freshness guidance included" value={(product as any).warranty?.description || ""} onChange={(e) => onChange({ ...product, warranty: { ...(product as any).warranty, description: e.target.value } })} className={cn(fieldCls, "mt-1.5")} /></div>
            </div>
            <div>
              <Label className={labelCls}>Payment Methods</Label>
              <div className="mt-1.5">
                <DynamicList items={(product as any).paymentMethods || []} onChange={(v) => onChange({ ...product, paymentMethods: v })} placeholder="UPI, Cards, Wallets" addLabel="Add payment method" />
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-5">
          <SectionHeader icon={Layers} title="Description" subtitle="Full product description shown on the product page" />
          <Textarea rows={5} placeholder="Describe the product, quality, usage, pack size, and key buying details." value={product.description || ""} onChange={(e) => onChange({ ...product, description: e.target.value })} className={cn(fieldCls, "resize-none")} />
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <button type="button" onClick={() => setStep(1)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <div className="flex gap-3">
            <button type="button" onClick={onCancel} className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
            <button type="submit" disabled={isLoading} className="flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60">
              {isLoading ? <><Loader2 className="h-4 w-4 animate-spin" />Saving…</> : <><Check className="h-4 w-4" />{submitLabel}</>}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminProducts = () => {
  const productsQuery                        = useGetProductsQuery({});
  const { data: productsResponse, isLoading } = productsQuery;
  const products = (productsResponse?.data || productsResponse || []) as Product[];

  const [deleteProduct] = useDeleteProductMutation();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();

  const [search,       setSearch]       = useState("");
  const [stockFilter,  setStockFilter]  = useState<StockFilter>("all");
  const [sortBy,       setSortBy]       = useState<SortKey>("newest");
  const [addOpen,      setAddOpen]      = useState(false);
  const [editOpen,     setEditOpen]     = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ── Refresh ────────────────────────────────────────────────────────────────

  const handleRefresh = useCallback(async () => {
    try { await productsQuery.refetch(); } catch {}
  }, [productsQuery]);

  usePageRefresh({ page: "products", onRefresh: handleRefresh });

  // ── CRUD handlers ──────────────────────────────────────────────────────────

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id).unwrap();
      toast.success("Product deleted.");
      await handleRefresh();
    } catch { toast.error("Failed to delete product."); }
  };

  const buildFormData = (payload: Record<string, unknown>, file?: File | null) => {
    const fd = new FormData();
    Object.entries(payload).forEach(([k, v]) => {
      if (k === "_id" || k === "image") return;
      if (Array.isArray(v) || (typeof v === "object" && v !== null)) fd.append(k, JSON.stringify(v));
      else fd.append(k, String(v));
    });
    if (file) fd.append("image", file);
    return fd;
  };

  const handleCreate = async (e: React.FormEvent, file: File | null) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (!file) { toast.error("Please select a product image."); return; }
      const payload = normalizeProductPayload(currentProduct);
      const err     = validateProductPayload(payload as Partial<Product>);
      if (err) { toast.error(err); return; }
      const fd = buildFormData(payload, file);
      await createProduct(fd).unwrap();
      await handleRefresh();
      toast.success("Product created successfully.");
      setAddOpen(false);
      setCurrentProduct({});
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Failed to create product.");
    } finally { setIsSubmitting(false); }
  };

  const handleUpdate = async (e: React.FormEvent, file: File | null) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = normalizeProductPayload(currentProduct);
      const err     = validateProductPayload(payload as Partial<Product>);
      if (err) { toast.error(err); return; }
      const fd = buildFormData(payload, file);
      await updateProduct({ id: currentProduct._id!, formData: fd }).unwrap();
      await handleRefresh();
      toast.success("Product updated successfully.");
      setEditOpen(false);
      setCurrentProduct({});
    } catch (error: any) {
      toast.error(error?.data?.message || error?.message || "Failed to update product.");
    } finally { setIsSubmitting(false); }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return [...products]
      .filter((p) => !q || p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q))
      .filter((p) => {
        if (stockFilter === "in_stock")      return p.stock > 10;
        if (stockFilter === "low_stock")     return p.stock > 0 && p.stock <= 10;
        if (stockFilter === "out_of_stock")  return p.stock <= 0;
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "name")        return a.name.localeCompare(b.name);
        if (sortBy === "price_high")  return b.price - a.price;
        if (sortBy === "price_low")   return a.price - b.price;
        if (sortBy === "stock_high")  return b.stock - a.stock;
        if (sortBy === "stock_low")   return a.stock - b.stock;
        return 0;
      });
  }, [products, search, stockFilter, sortBy]);

  // ── KPI counts ─────────────────────────────────────────────────────────────

  const kpi = useMemo(() => ({
    total:    products.length,
    inStock:  products.filter((p) => p.stock > 10).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock <= 10).length,
    outStock: products.filter((p) => p.stock <= 0).length,
  }), [products]);

  const isFiltered = search.trim() !== "" || stockFilter !== "all";

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Products</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your store's inventory and product details.</p>
        </div>
        <button
          onClick={() => { setCurrentProduct({}); setAddOpen(true); }}
          className="flex shrink-0 items-center gap-2 self-start rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-95"
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>

      {/* ── KPI strip ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
        {[
          { label: "Total",       value: kpi.total,    accent: "text-slate-900",   iconBg: "bg-slate-100 text-slate-600",    dot: "bg-slate-400"   },
          { label: "In Stock",    value: kpi.inStock,  accent: "text-emerald-700", iconBg: "bg-emerald-50 text-emerald-600", dot: "bg-emerald-500" },
          { label: "Low Stock",   value: kpi.lowStock, accent: "text-amber-700",   iconBg: "bg-amber-50 text-amber-600",     dot: "bg-amber-500"   },
          { label: "Out of Stock",value: kpi.outStock, accent: "text-red-700",     iconBg: "bg-red-50 text-red-600",         dot: "bg-red-500"     },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-4 py-4 shadow-sm sm:px-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{s.label}</p>
              <p className={cn("mt-1 text-2xl font-bold tabular-nums", s.accent)}>{s.value}</p>
            </div>
            <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", s.iconBg)}>
              <span className={cn("h-3 w-3 rounded-full", s.dot)} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Table card ───────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">

        {/* Toolbar */}
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              placeholder="Search by name or category…"
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

          {/* Filter + Sort */}
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className={cn(
                  "flex shrink-0 items-center gap-2 rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors",
                  stockFilter !== "all"
                    ? "border-teal-300 bg-teal-50 text-teal-700"
                    : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                )}>
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor"><path d="M1.5 3h13l-5 6v4l-3-1.5V9L1.5 3z" fillOpacity=".15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  Filter
                  {stockFilter !== "all" && <span className="h-2 w-2 rounded-full bg-teal-500" />}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Stock Status</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={stockFilter} onValueChange={(v) => setStockFilter(v as StockFilter)}>
                  {[["all","All stock"],["in_stock","In stock"],["low_stock","Low stock"],["out_of_stock","Out of stock"]].map(([v,l]) => (
                    <DropdownMenuRadioItem key={v} value={v} className="text-sm">{l}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50">
                  <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M4 8h8M6 12h4" strokeLinecap="round"/></svg>
                  Sort
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuLabel className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sort By</DropdownMenuLabel>
                <DropdownMenuRadioGroup value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
                  {[["newest","Default"],["name","Name A–Z"],["price_high","Price: high–low"],["price_low","Price: low–high"],["stock_high","Stock: high–low"],["stock_low","Stock: low–high"]].map(([v,l]) => (
                    <DropdownMenuRadioItem key={v} value={v} className="text-sm">{l}</DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Result count strip */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/60 px-5 py-2.5">
          <p className="text-xs font-medium text-slate-500">
            {isFiltered ? `${filtered.length} of ${products.length} products` : `${products.length} products`}
          </p>
          {isFiltered && (
            <button onClick={() => { setSearch(""); setStockFilter("all"); }} className="flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-800">
              <X className="h-3 w-3" /> Clear
            </button>
          )}
        </div>

        {/* Loading / empty */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20">
            <Loader2 className="h-7 w-7 animate-spin text-teal-500" />
            <p className="text-sm text-slate-400">Loading products…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
              <Package className="h-7 w-7 text-slate-300" />
            </div>
            <p className="font-semibold text-slate-700">{isFiltered ? "No products match" : "No products yet"}</p>
            <p className="text-sm text-slate-400">{isFiltered ? "Try adjusting filters or search." : "Add your first product to get started."}</p>
            {!isFiltered && (
              <button onClick={() => { setCurrentProduct({}); setAddOpen(true); }} className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700">
                <Plus className="h-4 w-4" /> Add First Product
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ── Desktop table ──────────────────────────────────────────── */}
            <div className="hidden overflow-x-auto md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    {["Product","Category","Price","Stock","Labels",""].map((h) => (
                      <th key={h} className={cn("px-5 py-3.5 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400", h === "" && "text-right")}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map((product) => {
                    const sb = stockBadge(product.stock);
                    return (
                      <tr key={product._id} className="group transition-colors hover:bg-slate-50/60">
                        {/* Product */}
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
                        {/* Category */}
                        <td className="px-5 py-4">
                          <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-teal-700">
                            {product.category}
                          </span>
                        </td>
                        {/* Price */}
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900">{inr(product.price)}</p>
                          {product.originalPrice > product.price && (
                            <p className="text-xs text-slate-400 line-through">{inr(product.originalPrice)}</p>
                          )}
                        </td>
                        {/* Stock */}
                        <td className="px-5 py-4">
                          <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold", sb.cls)}>
                            <span className={cn("h-1.5 w-1.5 rounded-full", stockDot(product.stock))} />
                            {product.stock}
                          </span>
                        </td>
                        {/* Labels */}
                        <td className="px-5 py-4">
                          <div className="flex gap-1">
                            {product.isFeatured   && <span title="Featured"    className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-50 text-yellow-600"><Star    className="h-3 w-3" /></span>}
                            {product.isNewArrival && <span title="New Arrival" className="flex h-6 w-6 items-center justify-center rounded-full bg-purple-50 text-purple-600"><Sparkles className="h-3 w-3" /></span>}
                            {product.isTrending   && <span title="Trending"    className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-50 text-orange-600"><Flame    className="h-3 w-3" /></span>}
                          </div>
                        </td>
                        {/* Actions */}
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                            <button
                              onClick={() => { setCurrentProduct(product); setEditOpen(true); }}
                              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
                              title="Edit"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>

                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <button
                                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
                                  title="Delete"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className="max-w-sm rounded-2xl">
                                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                                  <Trash2 className="h-5 w-5" />
                                </div>
                                <AlertDialogTitle className="mt-3 text-base font-bold text-slate-900">Delete product?</AlertDialogTitle>
                                <AlertDialogDescription className="text-sm text-slate-500">
                                  <strong>{product.name}</strong> will be permanently removed from your catalog.
                                </AlertDialogDescription>
                                <div className="mt-2 flex gap-3">
                                  <AlertDialogCancel className="flex-1 rounded-xl">Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleDelete(product._id)} className="flex-1 rounded-xl bg-rose-600 text-white hover:bg-rose-700">Delete</AlertDialogAction>
                                </div>
                              </AlertDialogContent>
                            </AlertDialog>

                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:bg-slate-50">
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="rounded-xl">
                                <DropdownMenuItem onClick={() => { setCurrentProduct(product); setEditOpen(true); }}>Edit Product</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(product._id)}>Copy Product ID</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => { const { _id, ...rest } = product; setCurrentProduct({ ...rest, name: `${product.name} Copy` }); setAddOpen(true); }}>Duplicate</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── Mobile cards ──────────────────────────────────────────── */}
            <div className="divide-y divide-slate-100 md:hidden">
              {filtered.map((product) => {
                const sb = stockBadge(product.stock);
                return (
                  <div key={product._id} className="flex items-start gap-3 p-4">
                    {/* Thumbnail */}
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-slate-100 bg-slate-50">
                      <img src={product.image} alt="" className="h-full w-full object-cover" />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">{product.name}</p>
                          <span className="mt-0.5 inline-block rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-bold uppercase text-teal-700">
                            {product.category}
                          </span>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 text-slate-500">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuItem onClick={() => { setCurrentProduct(product); setEditOpen(true); }}>Edit Product</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => navigator.clipboard?.writeText(product._id)}>Copy ID</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { const { _id, ...rest } = product; setCurrentProduct({ ...rest, name: `${product.name} Copy` }); setAddOpen(true); }}>Duplicate</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between gap-3">
                        <div>
                          <p className="font-bold text-slate-900">{inr(product.price)}</p>
                          {product.originalPrice > product.price && (
                            <p className="text-xs text-slate-400 line-through">{inr(product.originalPrice)}</p>
                          )}
                        </div>
                        <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold", sb.cls)}>
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

      {/* ── Add dialog ───────────────────────────────────────────────────── */}
      <Dialog open={addOpen} onOpenChange={(v) => { setAddOpen(v); if (!v) setCurrentProduct({}); }}>
        <DialogContent className="w-full max-w-2xl gap-0 overflow-hidden rounded-2xl p-0">
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="text-base font-bold text-slate-900">Add New Product</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Fill in details across two steps to create a complete product listing.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[82vh] overflow-y-auto px-6 py-5">
            <ProductForm
              key={addOpen ? "add-open" : "add-closed"}
              product={currentProduct}
              onChange={setCurrentProduct}
              onSubmit={handleCreate}
              submitLabel="Create Product"
              onCancel={() => setAddOpen(false)}
              mode="create"
              isLoading={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Edit dialog ──────────────────────────────────────────────────── */}
      <Dialog open={editOpen} onOpenChange={(v) => { setEditOpen(v); if (!v) setCurrentProduct({}); }}>
        <DialogContent className="w-full max-w-2xl gap-0 overflow-hidden rounded-2xl p-0">
          <DialogHeader className="border-b border-slate-100 px-6 py-5">
            <DialogTitle className="text-base font-bold text-slate-900">Edit Product</DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              {currentProduct.name ? `Editing: ${currentProduct.name}` : "Update the selected product."}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[82vh] overflow-y-auto px-6 py-5">
            <ProductForm
              key={currentProduct._id}
              product={currentProduct}
              onChange={setCurrentProduct}
              onSubmit={handleUpdate}
              submitLabel="Save Changes"
              onCancel={() => setEditOpen(false)}
              mode="edit"
              isLoading={isSubmitting}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminProducts;