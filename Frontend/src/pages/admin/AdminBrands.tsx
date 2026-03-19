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
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Loader2, Trash2, Plus } from "lucide-react";

export default function AdminBrands() {
  const { data: brands = [], isLoading } = useGetBrandsQuery({});
  const [createBrand] = useCreateBrandMutation();
  const [deleteBrand] = useDeleteBrandMutation();

  const [isOpen, setIsOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) {
      alert("Please select an image");
      return;
    }

    try {
      setIsSubmitting(true);
      console.log("🚀 Uploading brand...");
      console.log("📤 API call: POST /api/brands/");
      const formData = new FormData();
      formData.append("image", imageFile);

      await createBrand(formData).unwrap();
      console.log("✅ Brand uploaded successfully");
      setImageFile(null);
      setPreview("");
      setIsOpen(false);
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert("Error uploading brand: " + (error?.data?.message || error?.message));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log("🚀 Deleting brand...");
      console.log("📤 API call: DELETE /api/brands/", id);
      await deleteBrand(id).unwrap();
      console.log("✅ Brand deleted successfully");
    } catch (error: any) {
      console.error("❌ Error:", error);
      alert("Error deleting brand: " + (error?.data?.message || error?.message));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Manage Brands</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Brand
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Brand Logo</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Brand Image</label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={isSubmitting}
                  className="cursor-pointer"
                />
              </div>

              {preview && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-2">Preview:</p>
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-40 object-contain rounded border"
                  />
                </div>
              )}

              <Button
                type="submit"
                disabled={isSubmitting || !imageFile}
                className="w-full"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  "Upload Brand"
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {brands.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No brands added yet</p>
            </CardContent>
          </Card>
        ) : (
          brands.map((brand: any) => (
            <Card key={brand._id}>
              <CardContent className="pt-6">
                <img
                  src={brand.image}
                  alt="Brand"
                  className="w-full h-32 object-contain rounded mb-4"
                />
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full gap-2">
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogTitle>Delete Brand</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this brand? This cannot be undone.
                    </AlertDialogDescription>
                    <div className="flex gap-2 justify-end">
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(brand._id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete
                      </AlertDialogAction>
                    </div>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
