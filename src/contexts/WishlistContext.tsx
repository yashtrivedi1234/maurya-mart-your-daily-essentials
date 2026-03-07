import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { Product } from "@/data/mockProducts";

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  totalItems: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<Product[]>([]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.some((i) => i.id === product.id)) return prev;
      return [...prev, product];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== productId));
  }, []);

  const isInWishlist = useCallback(
    (productId: string) => items.some((i) => i.id === productId),
    [items]
  );

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, isInWishlist, totalItems: items.length }}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
