import { createContext, useContext, useState, ReactNode } from "react";
import type { Choreography } from "@/lib/mock-data";

export interface CartItem {
  choreography: Choreography;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (choreography: Choreography) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = (choreography: Choreography) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.choreography.id === choreography.id);
      if (exists) return prev;
      return [...prev, { choreography, quantity: 1 }];
    });
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.choreography.id !== id));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.choreography.price * i.quantity, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
