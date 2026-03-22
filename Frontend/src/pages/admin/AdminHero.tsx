import React, { useState } from "react";
import {
  Plus,
  Trash2,
  Edit2,
  Image as ImageIcon,
  UploadCloud,
  X,
  Sparkles,
  Type,
  AlignLeft,
  Tag,
  Layers,
  ShieldAlert,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useGetHeroSlidesQuery,
  useCreateHeroSlideMutation,
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation,
} from "@/store/api/heroApi";
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
import { normalizeWhitespace } from "@/lib/validation";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroSlide {
  _id: string;
  image: string;
  badge: string;
  heading: string;
  highlight: string;
  sub: string;
}

type SlideForm = Pick<HeroSlide, "badge" | "heading" | "highlight" | "sub">;

const EMPTY_FORM: SlideForm = { badge: "", heading: "", highlight: "", sub: "" };

// ─── Image drop zone ──────────────────────────────────────────────────────────

const ImageDropZone = ({
  preview,
  existingUrl,
  onFile,
  onClear,
  disabled,
  required,
}: {
  preview: string | null;
  existingUrl?: string;
  onFile: (file: File) => void;
  onClear: () => void;
  disabled?: boolean;
  required?: boolean;
}) => {
  const [dragOver, setDragOver] = useState(false);
  const displaySrc = preview || existingUrl || null;

  const applyFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file.");
      return;
    }
    onFile(file);
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => { e.preventDefault(); setDragOver(false); const f = e.dataTransfer.files?.[0]; if (f) applyFile(f); }}
      className={cn(
        "relative overflow-hidden rounded-xl border-2 border-dashed transition-all",
        dragOver ? "border-teal-400 bg-teal-50" : "border-slate-200 hover:border-teal-300 hover:bg-teal-50/30",
        disabled && "pointer-events-none opacity-60"
      )}
    >
      <input
        type="file"
        accept="image/*"
        required={required && !displaySrc}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) applyFile(f); }}
        disabled={disabled}
        className="absolute inset-0 cursor-pointer opacity-0"
      />

      {displaySrc ? (
        <div className="relative">
          <img
            src={displaySrc}
            alt="Slide preview"
            className="h-40 w-full object-cover sm:h-48"
          />
          {/* Overlay: change image hint */}
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity hover:opacity-100">
            <p className="flex items-center gap-1.5 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-semibold text-slate-700">
              <UploadCloud className="h-3.5 w-3.5" />
              Click or drop to replace
            </p>
          </div>
          {/* Clear preview (only clears new file, not existing) */}
          {preview && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onClear(); }}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
          {preview && (
            <span className="absolute bottom-2 left-2 rounded-lg bg-teal-600/90 px-2 py-0.5 text-[10px] font-bold text-white">
              New image selected
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
            <UploadCloud className="h-5 w-5" />
          </div>
          <p className="text-sm font-semibold text-slate-700">
            {dragOver ? "Drop to upload" : "Click or drag & drop"}
          </p>
          <p className="text-xs text-slate-400">PNG, JPG, WEBP — recommended 1920×800px</p>
        </div>
      )}
    </div>
  );
};

// ─── Slide form (shared by create + edit) ─────────────────────────────────────

const SlideFormDialog = ({
  open,
  onOpenChange,
  mode,
  initialSlide,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  mode: "create" | "edit";
  initialSlide?: HeroSlide;
  onSubmit: (form: SlideForm, file: File | null) => Promise<void>;
}) => {
  const [form, setForm]           = useState<SlideForm>(
    initialSlide ? { badge: initialSlide.badge, heading: initialSlide.heading, highlight: initialSlide.highlight, sub: initialSlide.sub }
                 : EMPTY_FORM
  );
  const [file,       setFile]     = useState<File | null>(null);
  const [preview,    setPreview]  = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const set = (k: keyof SlideForm, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleFile = (f: File) => {
    setFile(f);
    const r = new FileReader();
    r.onloadend = () => setPreview(r.result as string);
    r.readAsDataURL(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload: SlideForm = {
      badge:     normalizeWhitespace(form.badge),
      heading:   normalizeWhitespace(form.heading),
      highlight: normalizeWhitespace(form.highlight),
      sub:       normalizeWhitespace(form.sub),
    };
    if (!payload.heading || !payload.highlight || !payload.sub) {
      toast.error("Heading, highlight, and description are required.");
      return;
    }
    if (mode === "create" && !file) {
      toast.error("Please select a background image.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(payload, file);
    } finally {
      setSubmitting(false);
    }
  };

  const isEdit = mode === "edit";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-2xl gap-0 overflow-hidden rounded-2xl p-0">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="text-base font-bold text-slate-900">
            {isEdit ? "Edit Hero Slide" : "New Hero Slide"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500">
            {isEdit
              ? "Update slide content, image, and storefront copy."
              : "Create a homepage hero slide with image, messaging, and copy."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="max-h-[80vh] overflow-y-auto">
          <div className="space-y-5 px-6 py-5">

            {/* Image */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Background Image {isEdit && <span className="ml-1 normal-case font-normal text-slate-400">(leave blank to keep current)</span>}
              </label>
              <ImageDropZone
                preview={preview}
                existingUrl={isEdit ? initialSlide?.image : undefined}
                onFile={handleFile}
                onClear={() => { setFile(null); setPreview(null); }}
                disabled={submitting}
                required={!isEdit}
              />
            </div>

            {/* Badge */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <Tag className="h-3.5 w-3.5" /> Badge Text
                <span className="ml-1 normal-case font-normal text-slate-400">(optional)</span>
              </label>
              <Input
                value={form.badge}
                onChange={(e) => set("badge", e.target.value)}
                placeholder="e.g. Free delivery on daily essentials"
                disabled={submitting}
                className="rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400/20"
              />
            </div>

            {/* Heading + Highlight side by side on sm+ */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Type className="h-3.5 w-3.5" /> Primary Heading
                </label>
                <Input
                  required
                  value={form.heading}
                  onChange={(e) => set("heading", e.target.value)}
                  placeholder="Fresh groceries and essentials"
                  disabled={submitting}
                  className="rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400/20"
                />
              </div>
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Sparkles className="h-3.5 w-3.5 text-teal-500" /> Highlighted Text
                </label>
                <Input
                  required
                  value={form.highlight}
                  onChange={(e) => set("highlight", e.target.value)}
                  placeholder="Delivered quickly"
                  disabled={submitting}
                  className="rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400/20"
                />
                <p className="text-[10px] text-slate-400">Rendered in teal on the storefront.</p>
              </div>
            </div>

            {/* Subtext */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500">
                <AlignLeft className="h-3.5 w-3.5" /> Subtext / Description
              </label>
              <Textarea
                required
                rows={3}
                value={form.sub}
                onChange={(e) => set("sub", e.target.value)}
                placeholder="Highlight fast delivery, trusted quality, and value for everyday shopping."
                disabled={submitting}
                className="resize-none rounded-xl border-slate-200 focus:border-teal-400 focus:ring-teal-400/20"
              />
            </div>

            {/* Live preview strip */}
            {(form.heading || form.highlight || form.sub) && (
              <div className="rounded-xl border border-dashed border-teal-200 bg-teal-50/50 px-4 py-3">
                <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-teal-600">
                  Copy preview
                </p>
                {form.badge && (
                  <span className="mb-1.5 inline-block rounded-full bg-teal-600/10 px-2.5 py-0.5 text-[11px] font-bold text-teal-700">
                    {form.badge}
                  </span>
                )}
                <p className="text-base font-bold text-slate-900">
                  {form.heading}{" "}
                  <span className="text-teal-600">{form.highlight}</span>
                </p>
                {form.sub && (
                  <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{form.sub}</p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="flex-1 rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />{isEdit ? "Updating…" : "Creating…"}</>
              ) : (
                isEdit ? "Update Slide" : "Create Slide"
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Slide card ───────────────────────────────────────────────────────────────

const SlideCard = ({
  slide,
  index,
  onEdit,
  onDelete,
}: {
  slide: HeroSlide;
  index: number;
  onEdit: (s: HeroSlide) => void;
  onDelete: (id: string) => void;
}) => (
  <div className="group overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
    {/* Image area */}
    <div className="relative aspect-[16/9] overflow-hidden">
      <img
        src={slide.image}
        alt={slide.heading}
        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
      />
      {/* Slide number badge */}
      <span className="absolute left-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-[11px] font-bold text-white">
        {index + 1}
      </span>

      {/* Hover action overlay */}
      <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
        <button
          onClick={() => onEdit(slide)}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow transition-transform hover:scale-105 hover:bg-teal-50 hover:text-teal-700"
          title="Edit slide"
        >
          <Edit2 className="h-4 w-4" />
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-700 shadow transition-transform hover:scale-105 hover:bg-rose-50 hover:text-rose-600"
              title="Delete slide"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-sm rounded-2xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
              <Trash2 className="h-5 w-5" />
            </div>
            <AlertDialogTitle className="mt-3 text-base font-bold text-slate-900">
              Delete slide?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm text-slate-500">
              This hero slide will be permanently removed from the storefront.
            </AlertDialogDescription>
            <div className="mt-2 flex gap-3">
              <AlertDialogCancel className="flex-1 rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => onDelete(slide._id)}
                className="flex-1 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
              >
                Delete
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>

    {/* Copy preview */}
    <div className="p-4">
      {slide.badge && (
        <span className="inline-block rounded-full bg-teal-50 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700">
          {slide.badge}
        </span>
      )}
      <h3 className="mt-2 line-clamp-1 text-sm font-bold text-slate-900 sm:text-base">
        {slide.heading}{" "}
        <span className="text-teal-600">{slide.highlight}</span>
      </h3>
      <p className="mt-1 line-clamp-2 text-xs text-slate-500">{slide.sub}</p>
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const AdminHero = () => {
  const { data: slidesRaw, isLoading } = useGetHeroSlidesQuery({});
  const [createHeroSlide] = useCreateHeroSlideMutation();
  const [updateHeroSlide] = useUpdateHeroSlideMutation();
  const [deleteHeroSlide] = useDeleteHeroSlideMutation();

  const slides: HeroSlide[] = (slidesRaw as any)?.data || slidesRaw || [];

  const [addOpen,       setAddOpen]       = useState(false);
  const [editOpen,      setEditOpen]      = useState(false);
  const [editingSlide,  setEditingSlide]  = useState<HeroSlide | null>(null);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleCreate = async (form: SlideForm, file: File | null) => {
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("image", file);
    try {
      await createHeroSlide(fd).unwrap();
      toast.success("Hero slide created successfully.");
      setAddOpen(false);
    } catch {
      toast.error("Failed to create slide.");
    }
  };

  const handleUpdate = async (form: SlideForm, file: File | null) => {
    if (!editingSlide) return;
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => fd.append(k, v));
    if (file) fd.append("image", file);
    try {
      await updateHeroSlide({ id: editingSlide._id, formData: fd }).unwrap();
      toast.success("Hero slide updated successfully.");
      setEditOpen(false);
      setEditingSlide(null);
    } catch {
      toast.error("Failed to update slide.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteHeroSlide(id).unwrap();
      toast.success("Slide deleted.");
    } catch {
      toast.error("Failed to delete slide.");
    }
  };

  const openEdit = (slide: HeroSlide) => {
    setEditingSlide(slide);
    setEditOpen(true);
  };

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Hero Section
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage the slides shown in your homepage hero carousel.
          </p>
        </div>
        <button
          onClick={() => setAddOpen(true)}
          className="flex shrink-0 items-center gap-2 self-start rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Slide
        </button>
      </div>

      {/* ── Summary strip ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Stat */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-6 py-5 text-white shadow-md">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Live Slides</p>
            <p className="mt-1.5 text-3xl font-bold tabular-nums">{slides.length}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        {/* Tip */}
        <div className="flex items-start gap-4 rounded-2xl border border-teal-100 bg-teal-50/70 px-5 py-5 sm:col-span-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-teal-900">Hero slides define the storefront's first impression.</p>
            <p className="mt-0.5 text-xs leading-relaxed text-teal-700">
              Use high-contrast images (1920×800px recommended), keep headings under 8 words, and avoid
              more than 4 active slides at a time.
            </p>
          </div>
        </div>
      </div>

      {/* ── Slide grid ───────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20">
          <span className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-teal-500" />
          <p className="text-sm text-slate-400">Loading slides…</p>
        </div>
      ) : slides.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <Layers className="h-8 w-8 text-slate-300" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">No slides yet</p>
            <p className="mt-1 text-sm text-slate-400">Add your first hero slide to light up the storefront.</p>
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" /> Add First Slide
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-3 xl:gap-6">
          {slides.map((slide: HeroSlide, i: number) => (
            <SlideCard
              key={slide._id}
              slide={slide}
              index={i}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}

          {/* Add more tile */}
          <button
            onClick={() => setAddOpen(true)}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-12 transition-colors hover:border-teal-300 hover:bg-teal-50/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
              <Plus className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500">Add Slide</p>
          </button>
        </div>
      )}

      {/* ── Create dialog ─────────────────────────────────────────────────── */}
      {addOpen && (
        <SlideFormDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          mode="create"
          onSubmit={handleCreate}
        />
      )}

      {/* ── Edit dialog ───────────────────────────────────────────────────── */}
      {editOpen && editingSlide && (
        <SlideFormDialog
          open={editOpen}
          onOpenChange={(v) => { setEditOpen(v); if (!v) setEditingSlide(null); }}
          mode="edit"
          initialSlide={editingSlide}
          onSubmit={handleUpdate}
        />
      )}
    </div>
  );
};

export default AdminHero;