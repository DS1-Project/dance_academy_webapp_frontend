import { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { canPurchaseCourses } from "@/lib/purchaseAccess";
import type { Choreography } from "@/lib/mock-data";

export interface CartItem {
  choreography: Choreography;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (choreography: Choreography) => boolean;
  isInCart: (id: string) => boolean;
  removeItem: (id: string) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);

  const isInCart = (id: string) => items.some((i) => i.choreography.id === id);

  const addItem = (choreography: Choreography): boolean => {
    if (!canPurchaseCourses(user?.role)) {
      toast.error("Compra no disponible", {
        description: "Tu rol puede explorar el catálogo, pero no realizar compras.",
      });
      return false;
    }
    const exists = items.some((i) => i.choreography.id === choreography.id);
    if (exists) {
      toast.error("Ya está en tu carrito", {
        description: `"${choreography.songName}" ya fue agregado. Evitamos cobros duplicados.`,
      });
      return false;
    }
    setItems((prev) => [...prev, { choreography, quantity: 1 }]);
    toast.success("Agregado al carrito", {
      description: `"${choreography.songName}" — $${choreography.price}`,
    });
    return true;
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.choreography.id !== id));
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.choreography.price * i.quantity, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ items, addItem, isInCart, removeItem, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
