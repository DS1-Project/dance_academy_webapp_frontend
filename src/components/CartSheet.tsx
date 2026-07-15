import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart as CartIcon, ArrowRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext";

interface CartSheetProps {
  children: ReactNode;
}

export function CartSheet({ children }: CartSheetProps) {
  const { items, removeItem, clearCart, total, itemCount } = useCart();
  const navigate = useNavigate();

  return (
    <Sheet>
      <SheetTrigger asChild>{children}</SheetTrigger>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="p-6 pb-4 border-b border-border">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <CartIcon className="h-5 w-5" />
            Tu Carrito
            {itemCount > 0 && (
              <span className="ml-auto text-xs font-semibold px-2.5 py-1 rounded-full bg-primary/10 text-primary">
                {itemCount} {itemCount === 1 ? "ítem" : "ítems"}
              </span>
            )}
          </SheetTitle>
          <SheetDescription>
            Revisa tus coreografías antes de continuar al pago.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto p-6">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <CartIcon className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-bold mb-1">Carrito vacío</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Agrega coreografías desde el catálogo.
              </p>
              <SheetClose asChild>
                <Button variant="outline" onClick={() => navigate("/catalogo")}>
                  Ir al Catálogo
                </Button>
              </SheetClose>
            </div>
          ) : (
            <ul className="space-y-3">
              {items.map((item) => (
                <li
                  key={item.choreography.id}
                  className="flex items-center gap-3 p-3 bg-card rounded-2xl border border-border"
                >
                  <div
                    className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.choreography.thumbnailColor} flex items-center justify-center shrink-0 overflow-hidden`}
                  >
                    {item.choreography.thumbnailUrl ? (
                      <img
                        src={item.choreography.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-primary-foreground font-display font-extrabold text-[10px] text-center leading-tight px-1">
                        {item.choreography.songName.slice(0, 10)}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-sm truncate">
                      {item.choreography.songName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.choreography.mainTeacher} · {item.choreography.videoCount} videos
                    </p>
                    <p className="text-sm font-display font-extrabold mt-0.5">
                      ${item.choreography.price.toFixed(2)}
                    </p>
                  </div>
                  <button
                    onClick={() => removeItem(item.choreography.id)}
                    aria-label={`Eliminar ${item.choreography.songName}`}
                    className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {items.length > 0 && (
          <SheetFooter className="p-6 pt-4 border-t border-border flex-col sm:flex-col gap-3 sm:space-x-0">
            <div className="w-full flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total</span>
              <span
                key={total}
                className="text-2xl font-display font-extrabold tabular-nums transition-all"
              >
                ${total.toFixed(2)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 w-full">
              <Button variant="outline" onClick={clearCart}>
                Vaciar
              </Button>
              <SheetClose asChild>
                <Button className="gap-1" onClick={() => navigate("/carrito")}>
                  Checkout <ArrowRight className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}