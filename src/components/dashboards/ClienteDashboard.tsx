import type { User } from "@/types/auth";
import { useCart } from "@/contexts/CartContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Play, BookOpen, Star } from "lucide-react";
import { choreographies } from "@/lib/mock-data";

export function ClienteDashboard({ user }: { user: User }) {
  const { items } = useCart();

  // Simulated purchased choreographies
  const purchased = choreographies.slice(0, 3);
  const suggestions = choreographies.slice(3, 7);

  return (
    <div>
      <div className="mb-8">
        <p className="label-caps text-accent mb-1">Alumno</p>
        <h1 className="text-3xl md:text-5xl mb-2">Hola, {user.name.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Tu espacio de aprendizaje</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="bg-card rounded-2xl shadow-card p-5">
          <BookOpen className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-display font-extrabold">{purchased.length}</p>
          <p className="text-xs text-muted-foreground">Compradas</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <ShoppingCart className="h-5 w-5 text-secondary mb-2" />
          <p className="text-2xl font-display font-extrabold">{items.length}</p>
          <p className="text-xs text-muted-foreground">En Carrito</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <Star className="h-5 w-5 text-accent mb-2" />
          <p className="text-2xl font-display font-extrabold">4.8</p>
          <p className="text-xs text-muted-foreground">Mi Valoración</p>
        </div>
      </div>

      {/* Purchased */}
      <div className="bg-card rounded-2xl shadow-card p-5 md:p-6 mb-8">
        <h3 className="font-bold mb-4">🎬 Mis Coreografías Compradas</h3>
        <div className="space-y-3">
          {purchased.map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4 rounded-xl bg-muted/50 group">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${c.thumbnailColor} flex items-center justify-center`}>
                  <Play className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">{c.songName}</p>
                  <p className="text-xs text-muted-foreground">{c.mainTeacher} · {c.videoCount} videos</p>
                </div>
              </div>
              <Button size="sm" variant="outline">
                Ver Videos
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Suggestions */}
      <div className="bg-card rounded-2xl shadow-card p-5 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold">✨ Sugerencias para ti</h3>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/catalogo">Ver catálogo</Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {suggestions.map((c) => (
            <div key={c.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${c.thumbnailColor} shrink-0`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold truncate">{c.songName}</p>
                <p className="text-xs text-muted-foreground">{c.genre} · ${c.price}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
