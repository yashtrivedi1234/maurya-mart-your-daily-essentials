import { useState } from "react";
import {
  useGetBrandsQuery,
  useCreateBrandMutation,
  useDeleteBrandMutation,
} from "@/store/api/brandApi";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
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
  ImageIcon,
  GalleryHorizontal,
  UploadCloud,
  X,
  ShieldAlert,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Brand {
  _id: string;
  image: string;
}

// ─── Upload dialog ────────────────────────────────────────────────────────────

const AddBrandDialog = ({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const [createBrand] = useCreateBrandMutation();
  const [imageFile, setImageFile]   = useState<File | null>(null);
  const [preview,   setPreview]     = useState<string>("");
  const [isSubmitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver]     = useState(false);
  const [error, setError]           = useState<string>("");

  const reset = () => {
    setImageFile(null);
    setPreview("");
    setError("");
    setDragOver(false);
  };

  const handleClose = (v: boolean) => {
    if (!v) reset();
    onOpenChange(v);
  };

  const applyFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      return;
    }
    setError("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) applyFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) applyFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) { setError("Please select an image."); return; }
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("image", imageFile);
      await createBrand(formData).unwrap();
      reset();
      onOpenChange(false);
    } catch (err: any) {
      setError("Upload failed: " + (err?.data?.message || err?.message || "Unknown error"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-md rounded-2xl p-0 gap-0 overflow-hidden">
        <DialogHeader className="border-b border-slate-100 px-6 py-5">
          <DialogTitle className="text-base font-bold text-slate-900">Add Brand Logo</DialogTitle>
          <DialogDescription className="text-xs text-slate-500 mt-0.5">
            Upload a brand logo to display across the storefront.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-5">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={cn(
              "relative flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-4 py-10 text-center transition-all",
              dragOver
                ? "border-teal-400 bg-teal-50"
                : preview
                ? "border-slate-200 bg-slate-50"
                : "border-slate-200 bg-slate-50 hover:border-teal-300 hover:bg-teal-50/40"
            )}
          >
            <input
              type="file"
              accept="image/*"
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="absolute inset-0 cursor-pointer opacity-0"
            />

            {preview ? (
              <>
                <img
                  src={preview}
                  alt="Preview"
                  className="mx-auto max-h-32 object-contain"
                />
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span className="truncate max-w-[200px]">{imageFile?.name}</span>
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); reset(); }}
                  className="mt-1 flex items-center gap-1 text-xs font-medium text-rose-500 hover:text-rose-700"
                >
                  <X className="h-3.5 w-3.5" /> Remove
                </button>
              </>
            ) : (
              <>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-100 text-teal-600">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {dragOver ? "Drop to upload" : "Click or drag & drop"}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">PNG, JPG, SVG, WEBP up to 5 MB</p>
                </div>
              </>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2.5 text-xs font-medium text-rose-700">
              <ShieldAlert className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          {/* Tip */}
          <div className="flex items-start gap-2 rounded-xl bg-cyan-50 px-3.5 py-3 text-xs text-cyan-800">
            <ImageIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-cyan-600" />
            <span>Use transparent PNGs or clean SVGs for the best result on the storefront.</span>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1 rounded-xl"
              onClick={() => handleClose(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !imageFile}
              className="flex-1 rounded-xl bg-teal-600 text-white hover:bg-teal-700"
            >
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Uploading…</>
              ) : (
                <><UploadCloud className="mr-2 h-4 w-4" />Upload Logo</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// ─── Brand card ───────────────────────────────────────────────────────────────

const BrandCard = ({ brand, onDelete }: { brand: Brand; onDelete: (id: string) => void }) => (
  <div className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
    {/* Logo area */}
    <div className="flex flex-1 items-center justify-center bg-slate-50 p-6 sm:p-8">
      <img
        src={brand.image}
        alt="Brand logo"
        className="max-h-20 w-full object-contain transition-transform duration-200 group-hover:scale-105 sm:max-h-24"
      />
    </div>

    {/* Footer */}
    <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3">
      <div>
        <p className="text-xs font-semibold text-slate-700">Brand Asset</p>
        <p className="font-mono text-[10px] text-slate-400">#{brand._id.slice(-6).toUpperCase()}</p>
      </div>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <button className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600">
            <Trash2 className="h-4 w-4" />
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent className="max-w-sm rounded-2xl">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
            <Trash2 className="h-6 w-6" />
          </div>
          <AlertDialogTitle className="mt-4 text-base font-bold text-slate-900">
            Delete brand?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm text-slate-500">
            This logo will be permanently removed from the storefront and cannot be undone.
          </AlertDialogDescription>
          <div className="mt-2 flex gap-3">
            <AlertDialogCancel className="flex-1 rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(brand._id)}
              className="flex-1 rounded-xl bg-rose-600 text-white hover:bg-rose-700"
            >
              Delete
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  </div>
);

// ─── Main page ────────────────────────────────────────────────────────────────

export default function AdminBrands() {
  const { data: brandsRaw = [], isLoading } = useGetBrandsQuery({});
  const [deleteBrand] = useDeleteBrandMutation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const brands = (brandsRaw as any)?.data || brandsRaw as Brand[];

  const handleDelete = async (id: string) => {
    try {
      setDeleteError("");
      await deleteBrand(id).unwrap();
    } catch (err: any) {
      setDeleteError("Delete failed: " + (err?.data?.message || err?.message));
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
          <p className="text-sm text-slate-400">Loading brand library…</p>
        </div>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 lg:space-y-8">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Brand Library
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload and manage the partner logos shown across the storefront.
          </p>
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex shrink-0 items-center gap-2 self-start rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 active:scale-95"
        >
          <Plus className="h-4 w-4" />
          Add Brand
        </button>
      </div>

      {/* ── Summary strip ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Dark stat card */}
        <div className="flex items-center justify-between rounded-2xl bg-slate-900 px-6 py-5 text-white shadow-md">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Total Logos
            </p>
            <p className="mt-1.5 text-3xl font-bold tabular-nums">{brands.length}</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <GalleryHorizontal className="h-6 w-6 text-white" />
          </div>
        </div>

        {/* Tip card spans remaining columns */}
        <div className="flex items-start gap-4 rounded-2xl border border-cyan-100 bg-cyan-50/70 px-5 py-5 sm:col-span-2">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
            <ImageIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-cyan-900">Keep brand assets lightweight</p>
            <p className="mt-0.5 text-xs leading-relaxed text-cyan-700">
              Use transparent PNGs or clean SVG exports for the best rendering quality on all
              screens — especially the homepage brand carousel.
            </p>
          </div>
        </div>
      </div>

      {/* ── Delete error banner ───────────────────────────────────────────── */}
      {deleteError && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          <ShieldAlert className="h-4 w-4 shrink-0" />
          {deleteError}
          <button
            onClick={() => setDeleteError("")}
            className="ml-auto flex h-5 w-5 items-center justify-center rounded text-rose-400 hover:text-rose-700"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* ── Brand grid ───────────────────────────────────────────────────── */}
      {brands.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <GalleryHorizontal className="h-8 w-8 text-slate-300" />
          </div>
          <div>
            <p className="font-semibold text-slate-700">No brands added yet</p>
            <p className="mt-1 text-sm text-slate-400">
              Upload your first brand logo to get started.
            </p>
          </div>
          <button
            onClick={() => setDialogOpen(true)}
            className="mt-1 flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
          >
            <Plus className="h-4 w-4" />
            Add Your First Brand
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 xl:grid-cols-4 xl:gap-5">
          {brands.map((brand: Brand) => (
            <BrandCard key={brand._id} brand={brand} onDelete={handleDelete} />
          ))}

          {/* Add more tile */}
          <button
            onClick={() => setDialogOpen(true)}
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-200 bg-white py-10 text-center transition-colors hover:border-teal-300 hover:bg-teal-50/40"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-400 transition-colors group-hover:bg-teal-100 group-hover:text-teal-600">
              <Plus className="h-5 w-5" />
            </div>
            <p className="text-xs font-semibold text-slate-500">Add Brand</p>
          </button>
        </div>
      )}

      {/* ── Upload dialog ─────────────────────────────────────────────────── */}
      <AddBrandDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
}