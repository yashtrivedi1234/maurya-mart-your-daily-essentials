import React, { useState } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye,
  ArrowUpDown,
  Laptop
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  useGetProductsQuery, 
  useDeleteProductMutation,
  useCreateProductMutation,
  useUpdateProductMutation 
} from "@/store/api/productApi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Product {
  _id: string;
  name: string;
  price: number;
  originalPrice: number;
  category: string;
  stock: number;
  image: string;
  description: string;
}

const AdminProducts = () => {
  const { data: products, isLoading } = useGetProductsQuery({});
  const [deleteProduct] = useDeleteProductMutation();
  const [createProduct] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({});
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteProduct(id).unwrap();
        toast.success("Product deleted successfully");
      } catch (err) {
        toast.error("Failed to delete product");
      }
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(currentProduct).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      await createProduct(formData).unwrap();
      toast.success("Product created successfully");
      setIsAddDialogOpen(false);
      setCurrentProduct({});
      setSelectedFile(null);
      setImagePreview(null);
    } catch (err) {
      toast.error("Failed to create product");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(currentProduct).forEach(([key, value]) => {
        if (key !== "_id" && key !== "image") {
          formData.append(key, String(value));
        }
      });
      if (selectedFile) {
        formData.append("image", selectedFile);
      }

      await updateProduct({ id: currentProduct._id!, formData }).unwrap();
      toast.success("Product updated successfully");
      setIsEditDialogOpen(false);
      setCurrentProduct({});
      setSelectedFile(null);
      setImagePreview(null);
    } catch (err) {
      toast.error("Failed to update product");
    }
  };

  const openEditDialog = (product: Product) => {
    setCurrentProduct(product);
    setIsEditDialogOpen(true);
  };

  const filteredProducts = products?.filter((p: Product) => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Products</h1>
          <p className="text-muted-foreground mt-1">Manage your store's inventory and details.</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" /> Add New Product
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Product</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreate} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" required value={currentProduct.name || ""} onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input id="category" required value={currentProduct.category || ""} onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Price (₹)</Label>
                  <Input id="price" type="number" required value={currentProduct.price || ""} onChange={(e) => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="originalPrice">MRP (₹)</Label>
                  <Input id="originalPrice" type="number" value={currentProduct.originalPrice || ""} onChange={(e) => setCurrentProduct({...currentProduct, originalPrice: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stock">Stock Available</Label>
                  <Input id="stock" type="number" required value={currentProduct.stock || ""} onChange={(e) => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})} />
                </div>
                <div className="space-y-2 col-span-2">
                  <Label htmlFor="image">Product Image</Label>
                  <div className="flex items-center gap-4">
                    {imagePreview ? (
                      <div className="w-20 h-20 rounded-lg border overflow-hidden">
                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-lg border bg-muted flex items-center justify-center text-muted-foreground text-[10px] text-center p-2">
                        No image selected
                      </div>
                    )}
                    <div className="flex-1">
                      <Input id="image" type="file" accept="image/*" onChange={handleFileChange} className="rounded-xl" />
                      <p className="text-[10px] text-muted-foreground mt-1">Select a high-quality product image.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" rows={4} value={currentProduct.description || ""} onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})} />
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Create Product</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
        <div className="p-4 border-b flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl gap-2">
              <Filter className="h-4 w-4" /> Filter
            </Button>
            <Button variant="outline" className="rounded-xl gap-2">
              <ArrowUpDown className="h-4 w-4" /> Sort
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">Loading products...</td>
                </tr>
              ) : filteredProducts?.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-muted-foreground">No products found.</td>
                </tr>
              ) : filteredProducts?.map((product: Product) => (
                <tr key={product._id} className="group hover:bg-muted/30 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg overflow-hidden border bg-muted flex items-center justify-center text-xl">
                        <img src={product.image} alt="" className="w-full h-full object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm line-clamp-1">{product.name}</p>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{product._id.substring(0, 8)}...</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-bold uppercase">
                      {product.category}
                    </span>
                  </td>
                  <td className="p-4">
                    <p className="font-bold text-sm">₹{product.price.toLocaleString("en-IN")}</p>
                    {product.originalPrice > product.price && (
                      <p className="text-[10px] text-muted-foreground line-through">₹{product.originalPrice.toLocaleString("en-IN")}</p>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${
                        product.stock > 10 ? "bg-green-500" : product.stock > 0 ? "bg-orange-500" : "bg-red-500"
                      }`} />
                      <span className="text-sm font-medium">{product.stock} in stock</span>
                    </div>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => openEditDialog(product)}>
                        <Edit2 className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => handleDelete(product._id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Product Name</Label>
                <Input id="edit-name" required value={currentProduct.name || ""} onChange={(e) => setCurrentProduct({...currentProduct, name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-category">Category</Label>
                <Input id="edit-category" required value={currentProduct.category || ""} onChange={(e) => setCurrentProduct({...currentProduct, category: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price (₹)</Label>
                <Input id="edit-price" type="number" required value={currentProduct.price || ""} onChange={(e) => setCurrentProduct({...currentProduct, price: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-originalPrice">MRP (₹)</Label>
                <Input id="edit-originalPrice" type="number" value={currentProduct.originalPrice || ""} onChange={(e) => setCurrentProduct({...currentProduct, originalPrice: Number(e.target.value)})} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-stock">Stock Available</Label>
                <Input id="edit-stock" type="number" required value={currentProduct.stock || ""} onChange={(e) => setCurrentProduct({...currentProduct, stock: Number(e.target.value)})} />
              </div>
              <div className="space-y-2 col-span-2">
                <Label htmlFor="edit-image">Product Image</Label>
                <div className="flex items-center gap-4">
                  <div className="w-20 h-20 rounded-lg border overflow-hidden">
                    <img src={imagePreview || currentProduct.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <Input id="edit-image" type="file" accept="image/*" onChange={handleFileChange} className="rounded-xl" />
                    <p className="text-[10px] text-muted-foreground mt-1">Upload a new image to replace the current one.</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea id="edit-description" rows={4} value={currentProduct.description || ""} onChange={(e) => setCurrentProduct({...currentProduct, description: e.target.value})} />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
              <Button type="submit">Update Product</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AdminProducts;
