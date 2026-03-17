import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, SlidersHorizontal, Flame, TrendingUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "@/components/shop/ProductCard";
import FilterSidebar from "@/components/shop/FilterSidebar";
import { useGetTrendingProductsQuery, Product } from "@/store/api/productApi";

const ITEMS_PER_PAGE = 8;

const priceRanges = [
  { label: "₹0 – ₹500", min: 0, max: 500 },
  { label: "₹500 – ₹2,000", min: 500, max: 2000 },
  { label: "₹2,000 – ₹5,000", min: 2000, max: 5000 },
  { label: "₹5,000+", min: 5000, max: Infinity },
];

const sortOptions = [
  { label: "Most Trending", value: "trending" },
  { label: "Newest", value: "newest" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Highest Rated", value: "rating" },
];

const Trending = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [sort, setSort] = useState("trending");
  const [page, setPage] = useState(1);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    searchParams.get("category") ? [searchParams.get("category")!] : []
  );
  const [selectedPriceRange, setSelectedPriceRange] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [showInStockOnly, setShowInStockOnly] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const { data: products, isLoading } = useGetTrendingProductsQuery({});

  // Dynamically get unique categories
  const categories = useMemo<string[]>(() => {
    if (!products) return [];
    return Array.from(new Set((products as Product[]).map((p) => p.category))).sort();
  }, [products]);

  // Sync URL param with search state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search) {
        setSearchParams({ q: search });
      } else {
        setSearchParams({});
      }
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, setSearchParams]);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    if (!products) return [];

    let filtered = (products as Product[]).filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(search.toLowerCase()) ||
        product.description?.toLowerCase().includes(search.toLowerCase());

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(product.category);

      const price = product.price || 0;
      const matchesPrice =
        selectedPriceRange === null ||
        (price >= priceRanges[selectedPriceRange].min && price <= priceRanges[selectedPriceRange].max);

      const rating = product.rating || 0;
      const matchesRating = selectedRating === null || rating >= selectedRating;

      const matchesStock = !showInStockOnly || product.stock > 0;

      return matchesSearch && matchesCategory && matchesPrice && matchesRating && matchesStock;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sort) {
        case "trending":
          return (b.rating || 0) - (a.rating || 0);
        case "newest":
          return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
        case "price-asc":
          return (a.price || 0) - (b.price || 0);
        case "price-desc":
          return (b.price || 0) - (a.price || 0);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, search, selectedCategories, selectedPriceRange, selectedRating, showInStockOnly, sort]);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const paginatedProducts = filteredProducts.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSelectedCategories([]);
    setSelectedPriceRange(null);
    setSelectedRating(null);
    setShowInStockOnly(true);
    setSort("trending");
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Page Header */}
      <div className="container mx-auto px-4 py-24">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Flame className="h-8 w-8 text-destructive animate-bounce" />
            <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground">
              Trending Now
            </h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Discover what's popular right now — the hottest products everyone's buying
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Desktop Sidebar Filter */}
          <div className="hidden lg:block">
            <FilterSidebar
              categories={categories}
              selectedCategories={selectedCategories}
              onCategoryToggle={handleCategoryToggle}
              priceRanges={priceRanges}
              selectedPriceRange={selectedPriceRange}
              onPriceRangeChange={setSelectedPriceRange}
              selectedRating={selectedRating}
              onRatingChange={setSelectedRating}
              showInStockOnly={showInStockOnly}
              onShowInStockChange={setShowInStockOnly}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Mobile Filter Button */}
            <div className="lg:hidden">
              <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
                <SheetTrigger asChild>
                  <Button variant="outline" className="w-full gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-full sm:w-80">
                  <FilterSidebar
                    categories={categories}
                    selectedCategories={selectedCategories}
                    onCategoryToggle={handleCategoryToggle}
                    priceRanges={priceRanges}
                    selectedPriceRange={selectedPriceRange}
                    onPriceRangeChange={setSelectedPriceRange}
                    selectedRating={selectedRating}
                    onRatingChange={setSelectedRating}
                    showInStockOnly={showInStockOnly}
                    onShowInStockChange={setShowInStockOnly}
                    onResetFilters={handleResetFilters}
                  />
                </SheetContent>
              </Sheet>
            </div>

            {/* Search and Sort Bar */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search trending products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 rounded-full h-11 bg-white border-primary/20"
                />
              </div>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="w-full sm:w-48 rounded-full h-11 bg-white">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-semibold text-foreground">{paginatedProducts.length}</span> of{" "}
                <span className="font-semibold text-foreground">{filteredProducts.length}</span> trending products
              </p>
            </div>

            {/* Products Grid */}
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="space-y-4">
                    <Skeleton className="aspect-square rounded-2xl" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            ) : paginatedProducts.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {paginatedProducts.map((product: Product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-12">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="rounded-full"
                    >
                      Previous
                    </Button>

                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        onClick={() => setPage(pageNum)}
                        className="rounded-full h-10 w-10 p-0"
                      >
                        {pageNum}
                      </Button>
                    ))}

                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="rounded-full"
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold text-foreground">No trending products found</p>
                <p className="text-muted-foreground">Try adjusting your filters or search terms</p>
                <Button onClick={handleResetFilters} variant="outline" className="mt-4 rounded-full">
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Trending;
