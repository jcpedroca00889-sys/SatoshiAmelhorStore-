import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import type { Product } from "../data/products";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { productsData } from "../data/products";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  isCartFullPage: boolean;
  openCartFullPage: () => void;
  closeCartFullPage: () => void;
  isCheckoutOpen: boolean;
  openCheckout: () => void;
  closeCheckout: () => void;
}

const CartContext = createContext<CartContextType>({} as CartContextType);

const STORAGE_KEY = "satoshi-cart";

function loadCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

function saveCart(items: CartItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {}
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCartFullPage, setIsCartFullPage] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const { user } = useAuth();

  // Persist on change
  useEffect(() => { saveCart(items); }, [items]);

  // Sync from Supabase when user logs in
  useEffect(() => {
    if (user) {
      supabase
        .from("carts")
        .select("product_id, quantity")
        .eq("user_id", user.id)
        .then(({ data }) => {
          if (data && data.length > 0) {
            const serverItems = data
              .map((row: any) => ({
                product: productsData.find((p: Product) => p.id === String(row.product_id)),
                quantity: row.quantity,
              }))
              .filter((item): item is { product: Product; quantity: number } => !!item.product);
            if (serverItems.length > 0) setItems(serverItems as CartItem[]);
          }
        });
    }
  }, [user]);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.product.priceNumber * i.quantity, 0);

  const syncToSupabase = useCallback(async (newItems: CartItem[]) => {
    if (!user) return;
    await supabase.from("carts").delete().eq("user_id", user.id);
    if (newItems.length > 0) {
      await supabase.from("carts").insert(
        newItems.map((item) => ({
          user_id: user.id,
          product_id: Number(item.product.id),
          quantity: item.quantity,
        }))
      );
    }
  }, [user]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      const updated = existing
        ? prev.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: Math.min(i.quantity + quantity, 99) }
              : i
          )
        : [...prev, { product, quantity }];
      syncToSupabase(updated);
      return updated;
    });
  }, [syncToSupabase]);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => {
      const updated = prev.filter((i) => i.product.id !== productId);
      syncToSupabase(updated);
      return updated;
    });
  }, [syncToSupabase]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => {
        const updated = prev.filter((i) => i.product.id !== productId);
        syncToSupabase(updated);
        return updated;
      });
      return;
    }
    setItems((prev) => {
      const updated = prev.map((i) =>
        i.product.id === productId ? { ...i, quantity: Math.min(quantity, 99) } : i
      );
      syncToSupabase(updated);
      return updated;
    });
  }, [syncToSupabase]);

  const clearCart = useCallback(() => {
    setItems([]);
    localStorage.removeItem(STORAGE_KEY);
    syncToSupabase([]);
  }, [syncToSupabase]);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const openCartFullPage = useCallback(() => setIsCartFullPage(true), []);
  const closeCartFullPage = useCallback(() => setIsCartFullPage(false), []);
  const openCheckout = useCallback(() => setIsCheckoutOpen(true), []);
  const closeCheckout = useCallback(() => setIsCheckoutOpen(false), []);

  return (
    <CartContext.Provider
      value={{
        items, addItem, removeItem, updateQuantity, clearCart,
        totalItems, totalPrice,
        isCartOpen, openCart, closeCart,
        isCartFullPage, openCartFullPage, closeCartFullPage,
        isCheckoutOpen, openCheckout, closeCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
