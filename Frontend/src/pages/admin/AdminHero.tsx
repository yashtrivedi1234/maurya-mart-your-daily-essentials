import React, { useState } from "react";
import { 
  Plus, 
  Trash2, 
  Edit2,
  Image as ImageIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  useGetHeroSlidesQuery, 
  useCreateHeroSlideMutation, 
  useUpdateHeroSlideMutation,
  useDeleteHeroSlideMutation 
} from "@/store/api/heroApi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";

interface HeroSlide {
  _id: string;
  image: string;
  badge: string;
  heading: string;
  highlight: string;
  sub: string;
}

const AdminHero = () => {
  const { data: slides, isLoading } = useGetHeroSlidesQuery({});
  const [createHeroSlide] = useCreateHeroSlideMutation();
  const [updateHeroSlide] = useUpdateHeroSlideMutation();
  const [deleteHeroSlide] = useDeleteHeroSlideMutation();
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState<Partial<HeroSlide>>({
    badge: "",
    heading: "",
    highlight: "",
    sub: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        e.target.value = "";
        return;
      }

      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetForm = () => {
    setCurrentSlide({
      badge: "",
      heading: "",
      highlight: "",
      sub: ""
    });
    setSelectedFile(null);
    setImagePreview(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      console.log("🚀 Creating hero slide...");
      console.log("📤 API call: POST /api/hero/");
      const formData = new FormData();
      formData.append("badge", currentSlide.badge || "");
      formData.append("heading", currentSlide.heading || "");
      formData.append("highlight", currentSlide.highlight || "");
      formData.append("sub", currentSlide.sub || "");
      if (selectedFile) {
        formData.append("image", selectedFile);
      } else {
        return toast.error("Please select an image");
      }

      await createHeroSlide(formData).unwrap();
      console.log("✅ Hero slide created successfully");
      toast.success("Hero slide added successfully");
      setIsAddDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("❌ Error:", err);
      toast.error("Failed to add hero slide");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      console.log("🚀 Updating hero slide...");
      console.log("📤 API call: PATCH /api/hero/", currentSlide._id);
      const formData = new FormData();
      formData.append("badge", currentSlide.badge || "");
      formData.append("heading", currentSlide.heading || "");
      formData.append("highlight", currentSlide.highlight || "");
      formData.append("sub", currentSlide.sub || "");
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      await updateHeroSlide({ id: currentSlide._id!, formData }).unwrap();
      console.log("✅ Hero slide updated successfully");
      toast.success("Hero slide updated successfully");
      setIsEditDialogOpen(false);
      resetForm();
    } catch (err) {
      console.error("❌ Error:", err);
      toast.error("Failed to update hero slide");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditDialog = (slide: HeroSlide) => {
    setCurrentSlide(slide);
    setImagePreview(null);
    setSelectedFile(null);
    setIsEditDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this slide?")) {
      try {
        console.log("🚀 Deleting hero slide...");
        console.log("📤 API call: DELETE /api/hero/", id);
        await deleteHeroSlide(id).unwrap();
        console.log("✅ Hero slide deleted successfully");
        toast.success("Slide deleted successfully");
      } catch (err) {
        console.error("❌ Error:", err);
        toast.error("Failed to delete slide");
      }
    }
  };

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Hero Section</h1>
          <p className="text-muted-foreground mt-1">Manage the slides on your homepage hero section.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
          setIsAddDialogOpen(open);
          if (!open) {
            resetForm();
          }
        }}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20" onClick={resetForm}>
              <Plus className="h-4 w-4" /> Add New Slide
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Hero Slide</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="badge">Badge Text</Label>
                <Input id="badge" value={currentSlide.badge} onChange={(e) => setCurrentSlide({...currentSlide, badge: e.target.value})} placeholder="e.g. 🛒 Free Delivery..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="heading">Primary Heading</Label>
                  <Input id="heading" required value={currentSlide.heading} onChange={(e) => setCurrentSlide({...currentSlide, heading: e.target.value})} placeholder="e.g. Your Daily Essentials," />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="highlight">Highlighted Text</Label>
                  <Input id="highlight" required value={currentSlide.highlight} onChange={(e) => setCurrentSlide({...currentSlide, highlight: e.target.value})} placeholder="e.g. Delivered Fast" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sub">Subtext / Description</Label>
                <Textarea id="sub" required value={currentSlide.sub} onChange={(e) => setCurrentSlide({...currentSlide, sub: e.target.value})} placeholder="Describe your shop..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="image">Background Image</Label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="w-32 h-20 rounded-lg border overflow-hidden">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-32 h-20 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-6 w-6" />
                    </div>
                  )}
                  <Input id="image" type="file" accept="image/*" required onChange={handleFileChange} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Slide"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          <p>Loading slides...</p>
        ) : slides?.map((slide: HeroSlide) => (
          <div key={slide._id} className="bg-white rounded-2xl border overflow-hidden shadow-sm group">
            <div className="aspect-[16/9] relative overflow-hidden">
              <img src={slide.image} alt={slide.heading} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="secondary" size="icon" className="rounded-full" onClick={() => openEditDialog(slide)}>
                  <Edit2 className="h-5 w-5" />
                </Button>
                <Button variant="destructive" size="icon" className="rounded-full" onClick={() => handleDelete(slide._id)}>
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <div className="p-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-2 py-0.5 rounded-full">{slide.badge}</span>
              <h3 className="font-display font-bold text-lg mt-2 line-clamp-1">{slide.heading} <span className="text-primary">{slide.highlight}</span></h3>
              <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{slide.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          resetForm();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Hero Slide</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-badge">Badge Text</Label>
              <Input id="edit-badge" value={currentSlide.badge} onChange={(e) => setCurrentSlide({...currentSlide, badge: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-heading">Primary Heading</Label>
                <Input id="edit-heading" required value={currentSlide.heading} onChange={(e) => setCurrentSlide({...currentSlide, heading: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-highlight">Highlighted Text</Label>
                <Input id="edit-highlight" required value={currentSlide.highlight} onChange={(e) => setCurrentSlide({...currentSlide, highlight: e.target.value})} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-sub">Subtext / Description</Label>
              <Textarea id="edit-sub" required value={currentSlide.sub} onChange={(e) => setCurrentSlide({...currentSlide, sub: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-image">Background Image</Label>
              <div className="flex items-center gap-4">
                <div className="w-32 h-20 rounded-lg border overflow-hidden">
                  <img src={imagePreview || currentSlide.image} alt="Preview" className="w-full h-full object-cover" />
                </div>
                <Input id="edit-image" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Updating..." : "Update Slide"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminHero;
