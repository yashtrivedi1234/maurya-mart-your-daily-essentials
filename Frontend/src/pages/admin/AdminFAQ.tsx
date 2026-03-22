import { useState, useMemo } from "react";
import {
  useGetFAQsQuery,
  useCreateFAQMutation,
  useUpdateFAQMutation,
  useDeleteFAQMutation,
} from "@/store/api/faqApi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Loader2,
  Trash2,
  Plus,
  Edit,
  MessageCircleQuestion,
  FolderOpen,
  X,
  ChevronDown,
  Search,
  HelpCircle,
} from "lucide-react";
import { normalizeWhitespace } from "@/lib/validation";
import { cn } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

interface FAQ {
  _id: string;
  category: string;
  question: string;
  answer: string;
}

interface FormState {
  category: string;
  question: string;
  answer: string;
}

// ─── Category accent palette (cycles) ──────────────────────────────────────

const CATEGORY_COLORS = [
  { dot: "bg-teal-500",    badge: "bg-teal-50 text-teal-700 border-teal-200"    },
  { dot: "bg-blue-500",    badge: "bg-blue-50 text-blue-700 border-blue-200"    },
  { dot: "bg-purple-500",  badge: "bg-purple-50 text-purple-700 border-purple-200" },
  { dot: "bg-amber-500",   badge: "bg-amber-50 text-amber-700 border-amber-200" },
  { dot: "bg-cyan-500",    badge: "bg-cyan-50 text-cyan-700 border-cyan-200"    },
  { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700 border-emerald-200" },
];

const getCatColor = (idx: number) => CATEGORY_COLORS[idx % CATEGORY_COLORS.length];

// ─── FAQ form dialog ────────────────────────────────────────────────────────

const FAQFormDialog = ({
  open,
  onOpenChange,
  editing,
  onSubmit,
  isSubmitting,
  error,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: FAQ | null;
  onSubmit: (form: FormState) => Promise<void>;
  isSubmitting: boolean;
  error: string;
}) => {
  const [form, setForm] = useState<FormState>(
    editing
      ? { category: editing.category, question: editing.question, answer: editing.answer }
      : { category: "", question: "", answer: "" }
  );
  const [localError, setLocalError] = useState("");

  // Sync form when editing changes
  const set = (k: keyof FormState, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.category.trim() || !form.question.trim() || !form.answer.trim()) {
      setLocalError("All fields are required.");
      return;
    }
    setLocalError("");
    await onSubmit(form);
  };

  const displayError = localError || error;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg gap-0 overflow-hidden rounded-2xl p-0">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="text-base font-bold text-slate-900">
            {editing ? "Edit FAQ" : "New FAQ"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {editing
              ? "Update this question and answer shown on the storefront."
              : "Add a new frequently asked question for customers."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 px-6 py-5">
          {/* Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Category
            </label>
            <Input
              placeholder="e.g. Ordering, Delivery, Payments"
              value={form.category}
              onChange={(e) => set("category", e.target.value)}
              disabled={isSubmitting}
              className="rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400/20"
            />
          </div>

          {/* Question */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Question
            </label>
            <Input
              placeholder="e.g. How long does delivery take?"
              value={form.question}
              onChange={(e) => set("question", e.target.value)}
              disabled={isSubmitting}
              className="rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400/20"
            />
          </div>

          {/* Answer */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Answer
            </label>
            <Textarea
              placeholder="e.g. Orders are typically delivered within 1–3 business days."
              rows={5}
              value={form.answer}
              onChange={(e) => set("answer", e.target.value)}
              disabled={isSubmitting}
              className="resize-none rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400/20"
            />
          </div>

          {/* Error */}
          {displayError && (
            <div className="flex items-center gap-2 rounded-xl bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">
              <X className="h-3.5 w-3.5 shrink-0" />
              {displayError}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-teal-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <><Loader2 className="h-4 w-4 animate-spin" />{editing ? "Updating…" : "Creating…"}</>
              ) : (
                <>{editing ? "Update FAQ" : "Create FAQ"}</>
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Single FAQ accordion row ───────────────────────────────────────────────

const FAQRow = ({
  faq,
  onEdit,
  onDelete,
  accentDot,
}: {
  faq: FAQ;
  onEdit: (faq: FAQ) => void;
  onDelete: (id: string) => void;
  accentDot: string;
}) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-shadow hover:shadow-md">
      {/* Question row — clickable to expand */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="flex w-full items-start gap-3 px-5 py-4 text-left"
      >
        <span className={cn("mt-1.5 h-2 w-2 shrink-0 rounded-full", accentDot)} />
        <span className="flex-1 text-sm font-semibold text-slate-800">{faq.question}</span>
        <ChevronDown
          className={cn(
            "ml-2 mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Expandable answer + actions */}
      {expanded && (
        <div className="border-t border-slate-100 px-5 pb-4 pt-3">
          <p className="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{faq.answer}</p>

          {/* Actions */}
          <div className="mt-4 flex items-center justify-end gap-2">
            <button
              onClick={() => onEdit(faq)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 transition-colors hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-500 transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-sm rounded-2xl">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                  <Trash2 className="h-5 w-5" />
                </div>
                <AlertDialogTitle className="mt-3 text-base font-bold text-slate-900">
                  Delete FAQ?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-sm text-slate-500">
                  This question and answer will be permanently removed from the storefront.
                </AlertDialogDescription>
                <div className="mt-2 flex gap-3">
                  <AlertDialogCancel className="flex-1 rounded-xl">Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(faq._id)}
                    className="flex-1 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
                  >
                    Delete
                  </AlertDialogAction>
                </div>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      )}
    </div>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminFAQ() {
  const { data: rawFaqs = [], isLoading } = useGetFAQsQuery({});
  const [createFAQ]  = useCreateFAQMutation();
  const [updateFAQ]  = useUpdateFAQMutation();
  const [deleteFAQ]  = useDeleteFAQMutation();

  const faqs: FAQ[] = (rawFaqs as any)?.data || rawFaqs;

  const [dialogOpen,   setDialogOpen]   = useState(false);
  const [editingFaq,   setEditingFaq]   = useState<FAQ | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError,    setFormError]    = useState("");
  const [pageError,    setPageError]    = useState("");
  const [search,       setSearch]       = useState("");

  // ── Derived data ──────────────────────────────────────────────────────────

  const faqsByCategory = useMemo(() => {
    const q = search.trim().toLowerCase();
    const filtered = q
      ? faqs.filter(
          (f) =>
            f.question.toLowerCase().includes(q) ||
            f.answer.toLowerCase().includes(q) ||
            f.category.toLowerCase().includes(q)
        )
      : faqs;

    return filtered.reduce<Record<string, FAQ[]>>((acc, faq) => {
      const cat = faq.category?.trim() || "General";
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(faq);
      return acc;
    }, {});
  }, [faqs, search]);

  const categoryList  = Object.keys(faqsByCategory);
  const totalFaqs     = faqs.length;
  const totalCategories = Object.keys(
    faqs.reduce<Record<string, true>>((a, f) => { a[f.category || "General"] = true; return a; }, {})
  ).length;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const openCreate = () => { setEditingFaq(null); setFormError(""); setDialogOpen(true); };
  const openEdit   = (faq: FAQ) => { setEditingFaq(faq); setFormError(""); setDialogOpen(true); };

  const handleSubmit = async (form: FormState) => {
    const payload = {
      category: normalizeWhitespace(form.category),
      question: normalizeWhitespace(form.question),
      answer:   normalizeWhitespace(form.answer),
    };
    try {
      setIsSubmitting(true);
      setFormError("");
      if (editingFaq) {
        await updateFAQ({ id: editingFaq._id, ...payload }).unwrap();
      } else {
        await createFAQ(payload).unwrap();
      }
      setDialogOpen(false);
    } catch (err: any) {
      setFormError("Error: " + (err?.data?.message || err?.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteFAQ(id).unwrap();
    } catch (err: any) {
      setPageError("Delete failed: " + (err?.data?.message || err?.message));
    }
  };

  // ── Loading ────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        <p className="text-sm text-slate-400">Loading FAQs…</p>
      </div>
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            FAQ Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Group common questions by category and keep storefront answers current.
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex shrink-0 items-center gap-2 self-start rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add FAQ
        </button>
      </div>

      {/* ── Stat cards ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total FAQs</p>
            <p className="mt-1.5 text-3xl font-bold tabular-nums text-slate-900">{totalFaqs}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
            <MessageCircleQuestion className="h-5 w-5" />
          </div>
        </div>
        <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white px-5 py-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Categories</p>
            <p className="mt-1.5 text-3xl font-bold tabular-nums text-slate-900">{totalCategories}</p>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <FolderOpen className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* ── Page error ─────────────────────────────────────────────────────── */}
      {pageError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <span className="flex-1">{pageError}</span>
          <button onClick={() => setPageError("")} className="rounded p-0.5 hover:bg-rose-100">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ── Search ─────────────────────────────────────────────────────────── */}
      {faqs.length > 0 && (
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search questions, answers, or categories…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-700 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-600"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ── Empty state ────────────────────────────────────────────────────── */}
      {categoryList.length === 0 && (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <HelpCircle className="h-8 w-8 text-slate-300" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">
              {search ? "No results found" : "No FAQs yet"}
            </p>
            <p className="mt-1 text-sm text-slate-400">
              {search
                ? `Nothing matches "${search}". Try a different search term.`
                : "Add your first FAQ to help customers find quick answers."}
            </p>
          </div>
          {!search && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              <Plus className="h-4 w-4" />
              Add Your First FAQ
            </button>
          )}
        </div>
      )}

      {/* ── FAQ categories ─────────────────────────────────────────────────── */}
      {categoryList.length > 0 && (
        <div className="space-y-8">
          {categoryList.map((category, catIdx) => {
            const color  = getCatColor(catIdx);
            const items  = faqsByCategory[category];

            return (
              <section key={category}>
                {/* Category header */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className={cn("h-3 w-3 rounded-full", color.dot)} />
                    <h2 className="text-base font-bold text-slate-800 sm:text-lg">{category}</h2>
                  </div>
                  <span
                    className={cn(
                      "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                      color.badge
                    )}
                  >
                    {items.length} {items.length === 1 ? "item" : "items"}
                  </span>
                </div>

                {/* FAQ rows */}
                <div className="space-y-2">
                  {items.map((faq) => (
                    <FAQRow
                      key={faq._id}
                      faq={faq}
                      onEdit={openEdit}
                      onDelete={handleDelete}
                      accentDot={color.dot}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      {/* ── Form dialog ────────────────────────────────────────────────────── */}
      {dialogOpen && (
        <FAQFormDialog
          open={dialogOpen}
          onOpenChange={(v) => { setDialogOpen(v); if (!v) setEditingFaq(null); }}
          editing={editingFaq}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={formError}
        />
      )}
    </div>
  );
}