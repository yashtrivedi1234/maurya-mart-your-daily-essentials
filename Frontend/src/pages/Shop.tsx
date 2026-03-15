import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/shop/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { useGetProductsQuery, useSeedProductsMutation, Product } from "@/store/api/productApi";

const ITEMS_PER_PAGE = 8;

const priceRanges = [
  { label: "₹0 – ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹2,000", min: 500, max: 2000 },
  { label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
  { label: "₹5,000+", min: 5000, max: Infinity },
];

const sortOptions = [
  { label: "Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

const Shop = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("popular");
  const [page, setPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showInStockOnly, setShowInStockOnly] = useState(false);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { data: productsData, isLoading, refetch } = useGetProductsQuery({});
  const [seedProducts, { isLoading: isSeeding }] = useSeedProductsMutation();

  // Dynamically get unique categories
  const categories = useMemo<string[]>(() => {
    if (!productsData) return [];
    return Array.from(new Set((productsData as Product[]).map((p) => p.category))).sort();
  }, [productsData]);

  // Sync URL param with search state
  useEffect(() => {
    const q = searchParams.get("q") || "";
    if (q !== search) {
      setSearch(q);
    }
    
    const cat = searchParams.get("category");
    if (cat) {
      if (selectedCategories.length !== 1 || selectedCategories[0] !== cat) {
        setSelectedCategories([cat]);
      }
    } else if (searchParams.has("category") === false && selectedCategories.length > 0) {
      // If we want to clear selected category when URL is cleared
      // setSelectedCategories([]);
    }
  }, [searchParams, search, selectedCategories]);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
    if (val) {
      setSearchParams({ q: val });
    } else {
      searchParams.delete("q");
      setSearchParams(searchParams);
    }
  };

  const resetFilters = () => {
    setSelectedCategories([]);
    setSelectedPriceRange(null);
    setSelectedRating(null);
    setShowInStockOnly(false);
    setSearch("");
    setPage(1);
    setSearchParams({}); // Clear all URL params
  };

  const filtered = useMemo(() => {
    if (!productsData) return [];
    let products = [...productsData];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      products = products.filter(
        (p: Product) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q)
      );
    }

    // Categories
    if (selectedCategories.length > 0) {
      products = products.filter((p: Product) => selectedCategories.includes(p.category));
    }

    // Price range
    if (selectedPriceRange !== null) {
      const range = priceRanges[selectedPriceRange];
      products = products.filter((p: Product) => p.price >= range.min && p.price <= range.max);
    }

    // Rating
    if (selectedRating !== null) {
      products = products.filter((p: Product) => p.rating >= selectedRating);
    }

    // Stock
    if (showInStockOnly) {
      products = products.filter((p: Product) => p.stock > 0);
    }

    // Sort
    switch (sort) {
      case "price-asc": products.sort((a: Product, b: Product) => a.price - b.price); break;
      case "price-desc": products.sort((a: Product, b: Product) => b.price - a.price); break;
      case "newest": products.sort((a: Product, b: Product) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); break;
      case "popular": products.sort((a: Product, b: Product) => (b.reviews || 0) - (a.reviews || 0)); break;
    }

    return products;
  }, [search, selectedCategories, selectedPriceRange, selectedRating, showInStockOnly, sort, productsData]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const activeFilterCount =
    selectedCategories.length +
    (selectedPriceRange !== null ? 1 : 0) +
    (selectedRating !== null ? 1 : 0) +
    (showInStockOnly ? 1 : 0);

  const filterProps = {
    categories,
    priceRanges,
    selectedCategories, setSelectedCategories,
    selectedPriceRange, setSelectedPriceRange,
    selectedRating, setSelectedRating,
    showInStockOnly, setShowInStockOnly,
    onReset: resetFilters,
  };

  return (
    <>
      {/* Page Banner */}
      <section className="bg-gradient-to-br from-secondary via-accent to-secondary py-14 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-3">
            Shop Our Products
          </h1>
          <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto">
            Discover daily essentials and electronics at the best prices.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="container mx-auto px-4 py-8">
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="space-y-3">
                <Skeleton className="aspect-square rounded-xl" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>
        )}
        {/* Search + Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            {/* Mobile filter toggle */}
            <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="lg:hidden gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80 p-6 overflow-y-auto">
                <FilterSidebar {...filterProps} onClose={() => setMobileFiltersOpen(false)} />
              </SheetContent>
            </Sheet>

            <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                {sortOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-card border border-border rounded-xl p-5">
              <FilterSidebar {...filterProps} />
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {/* Results count */}
            <p className="text-sm text-muted-foreground mb-4">
              Showing {paginated.length} of {filtered.length} products
            </p>

            {paginated.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
                {paginated.map((product: Product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <Package className="h-16 w-16 text-muted-foreground/40 mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">No products found</h3>
                <p className="text-muted-foreground text-sm mb-4">
                  {productsData?.length === 0 ? "No products in database." : "Try adjusting your search or filters."}
                </p>
                {productsData?.length === 0 ? (
                  <Button onClick={async () => { await seedProducts({}).unwrap(); refetch(); }} disabled={isSeeding}>
                    {isSeeding ? "Seeding..." : "Seed Initial Products"}
                  </Button>
                ) : (
                  <Button variant="outline" onClick={resetFilters}>
                    Reset Filters
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-10">
                <Button
                  variant="outline" size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ← Prev
                </Button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                    className="w-9"
                  >
                    {p}
                  </Button>
                ))}
                <Button
                  variant="outline" size="sm"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next →
                </Button>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Shop;
