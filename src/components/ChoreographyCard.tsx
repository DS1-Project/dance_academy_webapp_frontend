import { Star, Play, Video, ShoppingCart, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/contexts/CartContext";
import type { Choreography } from "@/lib/mock-data";

interface ChoreographyCardProps {
  choreography: Choreography;
  featured?: boolean;
}

export function ChoreographyCard({ choreography, featured = false }: ChoreographyCardProps) {
  const { items, addItem } = useCart();
  const { songName, genre, difficulty, mainTeacher, guestTeacher, price, rating, reviewCount, videoCount, thumbnailColor } = choreography;
  const inCart = items.some((i) => i.choreography.id === choreography.id);

  const difficultyColor = {
    Principiante: "bg-accent/15 text-accent",
    Intermedio: "bg-primary/15 text-primary",
    Avanzado: "bg-secondary/15 text-secondary",
  }[difficulty];

  return (
    <div className={`group relative bg-card rounded-3xl overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 ${featured ? "md:col-span-2 md:row-span-2" : ""}`}>
      <div className="relative aspect-video overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br ${thumbnailColor} opacity-90`} />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-display font-extrabold text-primary-foreground text-2xl md:text-3xl tracking-tight text-center px-4 drop-shadow-lg" style={{ lineHeight: 1 }}>
            {songName}
          </span>
        </div>
        <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/20 transition-colors duration-300 flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-primary-foreground/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-75 group-hover:scale-100 transition-all duration-300">
            <Play className="h-6 w-6 text-foreground fill-foreground ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/70 text-primary-foreground text-xs font-semibold backdrop-blur-sm">
          <Video className="h-3.5 w-3.5" />
          {videoCount}
        </div>
      </div>

      <div className="p-4 md:p-5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-semibold">{genre}</span>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${difficultyColor}`}>{difficulty}</span>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Star className="h-4 w-4 fill-primary text-primary" />
            <span className="text-sm font-bold tabular-nums">{rating}</span>
            <span className="text-xs text-muted-foreground">({reviewCount})</span>
          </div>
        </div>

        <h3 className="text-base font-bold mb-1 line-clamp-1">{songName}</h3>
        <p className="text-sm text-muted-foreground mb-3">
          {mainTeacher}{guestTeacher ? ` · Invitado: ${guestTeacher}` : ""}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-xl font-display font-extrabold">${price}</span>
          {inCart ? (
            <Button size="sm" variant="outline" className="gap-1.5 pointer-events-none border-accent text-accent">
              <Check className="h-4 w-4" />
              En carrito
            </Button>
          ) : (
            <Button size="sm" className="gap-1.5" onClick={() => addItem(choreography)}>
              <ShoppingCart className="h-4 w-4" />
              Agregar
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
