import { Link } from "react-router-dom";
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
  const {
    id,
    songName,
    genre,
    difficulty,
    mainTeacher,
    guestTeacher,
    price,
    videoCount,
    thumbnailColor,
    thumbnailUrl,
    rating,
    reviewCount,
  } = choreography;
  const inCart = items.some((i) => i.choreography.id === choreography.id);

  const difficultyColor = {
    Principiante: "bg-accent/15 text-accent",
    Intermedio: "bg-primary/15 text-primary",
    Avanzado: "bg-secondary/15 text-secondary",
  }[difficulty];

  const displayRating = Number(rating.toFixed(1));
  const displayReviews = reviewCount || choreography.reviews?.length || 0;

  return (
    <article
      className={`group flex flex-col bg-card rounded-3xl overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:-translate-y-1 ${
        featured ? "md:col-span-2 md:row-span-2" : ""
      }`}
    >
      <Link
        to={`/curso/${id}`}
        className="relative block aspect-[16/10] overflow-hidden shrink-0"
        aria-label={`Ver curso ${songName}`}
      >
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${thumbnailColor}`} />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/50 via-transparent to-transparent" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-foreground/15">
          <div className="w-12 h-12 rounded-full bg-primary-foreground/95 flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform">
            <Play className="h-5 w-5 text-foreground fill-foreground ml-0.5" />
          </div>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <span className="px-2.5 py-1 rounded-full bg-background/90 text-foreground text-xs font-semibold backdrop-blur-sm">
            {genre}
          </span>
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-foreground/75 text-primary-foreground text-xs font-semibold backdrop-blur-sm">
            <Video className="h-3.5 w-3.5" />
            {videoCount}
          </span>
        </div>
      </Link>

      <div className="flex flex-1 flex-col gap-3 p-4 md:p-5">
        <div className="flex items-center justify-between gap-3">
          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${difficultyColor}`}>
            {difficulty}
          </span>
          <div className="flex items-center gap-1 text-sm shrink-0">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span className="font-semibold tabular-nums">{displayRating.toFixed(1)}</span>
            <span className="text-muted-foreground text-xs">({displayReviews})</span>
          </div>
        </div>

        <div className="min-w-0 space-y-1">
          <Link to={`/curso/${id}`} className="block hover:text-primary transition-colors">
            <h3 className="text-base font-bold leading-snug line-clamp-2 tracking-normal">
              {songName}
            </h3>
          </Link>
          <p className="text-sm text-muted-foreground line-clamp-1">
            {mainTeacher}
            {guestTeacher ? ` · ${guestTeacher}` : ""}
          </p>
        </div>

        <div className="mt-auto space-y-3 pt-1">
          <p className="text-2xl font-semibold tabular-nums tracking-tight">
            ${Number(price).toFixed(2)}
          </p>
          <div className="grid grid-cols-2 gap-2">
            <Button size="sm" variant="outline" className="w-full" asChild>
              <Link to={`/curso/${id}`}>Ver curso</Link>
            </Button>
            {inCart ? (
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1.5 pointer-events-none border-accent text-accent"
              >
                <Check className="h-4 w-4" />
                En carrito
              </Button>
            ) : (
              <Button
                size="sm"
                className="w-full gap-1.5"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addItem(choreography);
                }}
              >
                <ShoppingCart className="h-4 w-4" />
                Agregar
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
