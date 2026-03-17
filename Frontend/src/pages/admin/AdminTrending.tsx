import React, { useState, useMemo } from "react";
import {
  Flame,
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  MoreVertical,
  Plus,
  Toggle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  useGetProductsQuery,
  useUpdateProductStatusMutation,
} from "@/store/api/productApi";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface Product {
  _id: string;
  name: string;
  price: number;
  category: string;
  stock: number;
  image: string;
  rating: number;
  isTrending?: boolean;
}

const AdminTrending = () => {
  const { data: products, isLoading } = useGetProductsQuery({});
  const [updateProductStatus] = useUpdateProductStatusMutation();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<"name" | "price" | "rating">("name");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  // Get unique categories
  const categories = useMemo(() => {
    if (!products) return [];
    return Array.from(new Set((products as Product[]).map((p) => p.category))).sort();
  }, [products]);

  // Filter only trending products
  const trendingProducts = useMemo(() => {
    if (!products) return [];
    return (products as Product[]).filter((p) => p.isTrending === true);
  }, [products]);

  // Get all products for quick add
  const availableProducts = useMemo(() => {
    if (!products) return [];
    return (products as Product[]).filter((p) => p.isTrending !== true);
  }, [products]);

  // Filter and sort trending products
  const filteredTrendingProducts = useMemo(() => {
    let filtered = trendingProducts;

    if (searchTerm) {
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory) {
      filtered = filtered.filter((p) => p.category === filterCategory);
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.name.localeCompare(b.name);
        case "price":
          return b.price - a.price;
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [trendingProducts, searchTerm, filterCategory, sortBy]);

  // Filter available products for adding
  const filteredAvailableProducts = useMemo(() => {
    return availableProducts.filter(
      (p) =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [availableProducts, searchTerm]);

  const handleToggleTrending = async (product: Product, isTrending: boolean) => {
    try {
      await updateProductStatus({
        id: product._id,
        statusData: { isTrending },
      }).unwrap();
      toast.success(
        isTrending
          ? `"${product.name}" added to trending!`
          : `"${product.name}" removed from trending`
      );
    } catch (err) {
      toast.error("Failed to update product status");
    }
  };

  const openProductDetails = (product: Product) => {
    setSelectedProduct(product);
    setIsDetailsOpen(true);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Flame className="h-8 w-8 text-destructive animate-bounce" />
            <h1 className="text-3xl font-display font-bold text-foreground">
              Trending Products
            </h1>
          </div>
          <p className="text-muted-foreground">
            Manage products featured in the trending section
          </p>
        </div>
        <Dialog>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-xl gap-2">
              <Filter className="h-4 w-4" /> Quick Actions
            </Button>
          </div>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Total Trending</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {filteredTrendingProducts.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Flame className="h-6 w-6 text-destructive" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Available to Add</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {filteredAvailableProducts.length}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground text-sm font-medium">Avg Rating</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {filteredTrendingProducts.length > 0
                  ? (
                      filteredTrendingProducts.reduce((sum, p) => sum + (p.rating || 0), 0) /
                      filteredTrendingProducts.length
                    ).toFixed(1)
                  : "N/A"}
              </p>
            </div>
            <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center">
              <span className="text-xl">⭐</span>
            </div>
          </div>
        </div>
      </div>

      {/* Currently Trending */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trending products..."
              className="pl-10 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 rounded-xl border border-border bg-white text-foreground text-sm font-medium"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as "name" | "price" | "rating")}
            className="px-4 py-2 rounded-xl border border-border bg-white text-foreground text-sm font-medium"
          >
            <option value="name">Sort by Name</option>
            <option value="price">Sort by Price</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3].map((n) => (
                <Skeleton key={n} className="h-20 rounded-lg" />
              ))}
            </div>
          ) : filteredTrendingProducts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-muted/50 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b">
                    <th className="p-4">Product</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Stock</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTrendingProducts.map((product) => (
                    <tr key={product._id} className="group hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-lg overflow-hidden border bg-muted flex items-center justify-center">
                            <img
                              src={product.image}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div>
                            <p className="font-semibold text-sm line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                              {product._id.substring(0, 8)}...
                            </p>
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
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-1">
                          <span className="text-xl">⭐</span>
                          <span className="font-semibold text-sm">{product.rating || 0}</span>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${
                              product.stock > 10
                                ? "bg-green-500"
                                : product.stock > 0
                                ? "bg-orange-500"
                                : "bg-red-500"
                            }`}
                          />
                          <span className="text-sm font-medium">{product.stock}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => openProductDetails(product)}
                          >
                            <Edit2 className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-lg"
                            onClick={() => handleToggleTrending(product, false)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center">
              <Flame className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-lg font-semibold text-foreground">No trending products yet</p>
              <p className="text-muted-foreground text-sm mt-2">
                Add products from the available list below
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Available Products to Add */}
      {availableProducts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-display font-bold text-foreground">
            Available Products
          </h2>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <p className="text-sm text-blue-900">
              Click "Add to Trending" to feature these products
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredAvailableProducts.slice(0, 8).map((product) => (
              <div
                key={product._id}
                className="bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
              >
                <div className="aspect-square overflow-hidden bg-muted relative">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2">
                    {product.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-3">{product.category}</p>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-bold text-sm">
                      ₹{product.price.toLocaleString("en-IN")}
                    </p>
                    <div className="flex items-center gap-1">
                      <span>⭐</span>
                      <span className="text-xs font-semibold">{product.rating || 0}</span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    className="w-full rounded-lg gap-2 text-xs font-semibold"
                    onClick={() => handleToggleTrending(product, true)}
                  >
                    <Flame className="h-3 w-3" /> Add to Trending
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredAvailableProducts.length > 8 && (
            <div className="text-center pt-4">
              <p className="text-sm text-muted-foreground">
                Showing 8 of {filteredAvailableProducts.length} available products
              </p>
            </div>
          )}
        </div>
      )}

      {/* Product Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Product Details</DialogTitle>
          </DialogHeader>
          {selectedProduct && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <img
                    src={selectedProduct.image}
                    alt={selectedProduct.name}
                    className="w-full h-64 object-cover rounded-lg border"
                  />
                </div>
                <div>
                  <Label className="text-muted-foreground">Product Name</Label>
                  <p className="font-semibold text-lg mt-1">{selectedProduct.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Category</Label>
                  <p className="font-semibold text-lg mt-1">{selectedProduct.category}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Price</Label>
                  <p className="font-semibold text-lg mt-1">
                    ₹{selectedProduct.price.toLocaleString("en-IN")}
                  </p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Stock</Label>
                  <p className="font-semibold text-lg mt-1">{selectedProduct.stock} units</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rating</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-2xl">⭐</span>
                    <p className="font-semibold text-lg">{selectedProduct.rating || 0}</p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDetailsOpen(false)}
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminTrending;
