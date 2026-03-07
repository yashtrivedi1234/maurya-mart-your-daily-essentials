import { useState, useEffect, useRef } from "react";
import { Search, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { mockProducts } from "@/data/mockProducts";
import type { Product } from "@/data/mockProducts";

interface SearchOverlayProps {
  open: boolean;
  onClose: () => void;
}

const SearchOverlay = ({ open, onClose }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const q = query.toLowerCase();
    setResults(
      mockProducts.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      ).slice(0, 8)
    );
  }, [query]);

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
            className="w-full h-14 pl-12 pr-12 rounded-xl bg-background border border-border text-foreground text-lg placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
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
          <div className="mt-2 rounded-xl bg-background border border-border shadow-lg overflow-hidden max-h-[60vh] overflow-y-auto">
            {results.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                No products found for "{query}"
              </div>
            ) : (
              <ul>
                {results.map((p) => (
                  <li key={p.id}>
                    <button
                      onClick={() => handleSelect(p.id)}
                      className="w-full flex items-center gap-4 p-3 hover:bg-muted/50 transition-colors text-left"
                    >
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-12 h-12 rounded-lg object-cover bg-muted flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.category}</p>
                      </div>
                      <span className="text-sm font-semibold text-foreground whitespace-nowrap">
                        ₹{p.price.toLocaleString("en-IN")}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchOverlay;
