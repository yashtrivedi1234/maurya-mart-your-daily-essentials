import { useState, useEffect, useRef, useMemo } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetProductsQuery } from "@/store/api/productApi";

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

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SearchOverlay = ({ open, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();
  const { data: products } = useGetProductsQuery({});
  const productsArray = useMemo(() => products || [], [products]);

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      if (results.length > 0) setResults([]);
      return;
    }
    const q = query.toLowerCase();
    const filtered = (productsArray as Product[])
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
      .slice(0, 8);
    
    // Check if results actually changed to prevent infinite loop
    if (JSON.stringify(filtered) !== JSON.stringify(results)) {
      setResults(filtered);
    }
  }, [query, productsArray, results]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSelect = (id: string) => {
    onClose();
    navigate(`/shop/${id}`);
  };

  return (
    <div className="fixed inset-0 z-[60] bg-foreground/50 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="container mx-auto px-4 pt-20 md:pt-28 max-w-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, categories..."
            className="w-full h-14 pl-12 pr-12 rounded-xl bg-background border border-border text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xl"
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Results */}
        {query.trim() && (
          <div className="mt-2 rounded-xl bg-background border border-border shadow-2xl overflow-hidden max-h-[60vh] overflow-y-auto animate-in slide-in-from-top-2 duration-200">
            {results.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                <div className="text-4xl mb-4">🔍</div>
                No products found for "{query}"
              </div>
            ) : (
              <div className="divide-y divide-border">
                {results.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => handleSelect(p._id)}
                    className="w-full flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-14 h-14 rounded-lg bg-muted flex-shrink-0 overflow-hidden border border-border">
                      <img
                        src={p.image ?? "https://via.placeholder.com/56?text=No+Image"}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-base truncate">{p.name}</p>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{p.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-bold text-primary whitespace-nowrap">
                        ₹{p.price.toLocaleString("en-IN")}
                      </span>
                      {p.originalPrice && p.originalPrice > p.price && (
                        <p className="text-[10px] text-muted-foreground line-through">
                          ₹{p.originalPrice.toLocaleString("en-IN")}
                        </p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
