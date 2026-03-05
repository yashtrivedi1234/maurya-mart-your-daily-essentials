import { Star, X } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { categories, priceRanges } from "@/data/mockProducts";

interface FilterSidebarProps {
  selectedCategories: string[];
  setSelectedCategories: (v: string[]) => void;
  selectedPriceRange: number | null;
  setSelectedPriceRange: (v: number | null) => void;
  selectedRating: number | null;
  setSelectedRating: (v: number | null) => void;
  showInStockOnly: boolean;
  setShowInStockOnly: (v: boolean) => void;
  onReset: () => void;
  onClose?: () => void;
}

const FilterSidebar = ({
  selectedCategories, setSelectedCategories,
  selectedPriceRange, setSelectedPriceRange,
  selectedRating, setSelectedRating,
  showInStockOnly, setShowInStockOnly,
  onReset, onClose,
}: FilterSidebarProps) => {
  const toggleCategory = (cat: string) => {
    setSelectedCategories(
      selectedCategories.includes(cat)
        ? selectedCategories.filter((c) => c !== cat)
        : [...selectedCategories, cat]
    );
  };

  const ratingOptions = [5, 4, 3];

  return (
    <div className="space-y-6">
      {/* Mobile close */}
      {onClose && (
        <div className="flex items-center justify-between lg:hidden">
          <h3 className="font-semibold text-foreground">Filters</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Categories */}
      <div>
        <h4 className="font-semibold text-sm text-foreground mb-3">Categories</h4>
        <div className="space-y-2.5">
          {categories.map((cat) => (
            <label key={cat} className="flex items-center gap-2.5 cursor-pointer group">
              <Checkbox
                checked={selectedCategories.includes(cat)}
                onCheckedChange={() => toggleCategory(cat)}
              />
              <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Separator />

      {/* Price Range */}
      <div>
        <h4 className="font-semibold text-sm text-foreground mb-3">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map((range, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedPriceRange(selectedPriceRange === idx ? null : idx)}
              className={`w-full text-left text-sm px-3 py-2 rounded-lg transition-colors ${
                selectedPriceRange === idx
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Rating */}
      <div>
        <h4 className="font-semibold text-sm text-foreground mb-3">Rating</h4>
        <div className="space-y-2">
          {ratingOptions.map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRating(selectedRating === r ? null : r)}
              className={`w-full flex items-center gap-2 text-sm px-3 py-2 rounded-lg transition-colors ${
                selectedRating === r
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <div className="flex">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    className={`h-3.5 w-3.5 ${s <= r ? "text-yellow-400 fill-yellow-400" : "text-muted-foreground/30"}`}
                  />
                ))}
              </div>
              <span>& up</span>
            </button>
          ))}
        </div>
      </div>

      <Separator />

      {/* Availability */}
      <div>
        <h4 className="font-semibold text-sm text-foreground mb-3">Availability</h4>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <Checkbox
            checked={showInStockOnly}
            onCheckedChange={(v) => setShowInStockOnly(!!v)}
          />
          <span className="text-sm text-muted-foreground">In Stock Only</span>
        </label>
      </div>

      <Button variant="outline" className="w-full" onClick={onReset}>
        Reset Filters
      </Button>
    </div>
  );
};

export default FilterSidebar;
