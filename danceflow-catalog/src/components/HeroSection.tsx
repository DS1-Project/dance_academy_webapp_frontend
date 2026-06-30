import { Button } from "@/components/ui/button";
import { Play, Star } from "lucide-react";
import { Link } from "react-router-dom";

export function HeroSection() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-20">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 -right-32 w-96 h-96 rounded-full bg-primary/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 -left-32 w-80 h-80 rounded-full bg-secondary/10 blur-3xl animate-float" style={{ animationDelay: "2s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      <div className="container relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted mb-8 animate-reveal-up">
            <span className="w-2 h-2 rounded-full bg-gradient-brand" />
            <span className="label-caps text-muted-foreground text-xs">Academia de Baile Online</span>
          </div>

          {/* Headline */}
          <h1 className="mb-6 animate-reveal-up" style={{ animationDelay: "100ms" }}>
            Domina el ritmo.{" "}
            <span className="text-gradient">Conquista</span>{" "}
            el escenario.
          </h1>

          {/* Subtext */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 animate-reveal-up" style={{ animationDelay: "200ms", textWrap: "pretty" }}>
            Aprende coreografías completas de salsa, bachata, hip-hop y más con los mejores profesores. 
            Videos profesionales, a tu ritmo, desde cualquier lugar.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-reveal-up" style={{ animationDelay: "300ms" }}>
            <Button variant="hero" size="xl" asChild>
              <Link to="/catalogo">
                Explorar Catálogo
              </Link>
            </Button>
            <Button variant="outline" size="xl" className="gap-2">
              <Play className="h-5 w-5 fill-current" />
              Ver Demo
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 animate-reveal-up" style={{ animationDelay: "400ms" }}>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-display font-extrabold text-gradient">+120</p>
              <p className="text-sm text-muted-foreground mt-1">Coreografías</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-display font-extrabold">8</p>
              <p className="text-sm text-muted-foreground mt-1">Géneros</p>
            </div>
            <div className="text-center">
              <p className="text-3xl md:text-4xl font-display font-extrabold">15</p>
              <p className="text-sm text-muted-foreground mt-1">Profesores</p>
            </div>
            <div className="flex items-center gap-1 text-center">
              <div>
                <div className="flex items-center justify-center gap-1">
                  <p className="text-3xl md:text-4xl font-display font-extrabold">4.8</p>
                  <Star className="h-6 w-6 fill-primary text-primary" />
                </div>
                <p className="text-sm text-muted-foreground mt-1">Valoración</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
