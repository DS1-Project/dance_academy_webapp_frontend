import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="relative overflow-hidden bg-foreground text-background pt-20 pb-8">
      {/* Giant DANCE text */}
      <div className="absolute bottom-0 left-0 right-0 pointer-events-none select-none overflow-hidden">
        <p
          className="font-display font-extrabold text-background/5 leading-none whitespace-nowrap"
          style={{ fontSize: "clamp(8rem, 20vw, 24rem)" }}
        >
          DANCE FLOW
        </p>
      </div>

      <div className="container relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-16">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-brand flex items-center justify-center">
                <span className="text-primary-foreground font-display font-extrabold text-lg">D</span>
              </div>
              <span className="font-display font-extrabold text-xl">DanceFlow</span>
            </div>
            <p className="text-background/60 text-sm max-w-xs">
              La academia de baile online más completa. Aprende a tu ritmo con los mejores profesores.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="label-caps text-background/40 mb-4">Plataforma</p>
              <ul className="space-y-2">
                <li><Link to="/catalogo" className="text-sm text-background/60 hover:text-background transition-colors">Catálogo</Link></li>
                <li><Link to="/profesores" className="text-sm text-background/60 hover:text-background transition-colors">Profesores</Link></li>
                <li><Link to="/precios" className="text-sm text-background/60 hover:text-background transition-colors">Precios</Link></li>
              </ul>
            </div>
            <div>
              <p className="label-caps text-background/40 mb-4">Soporte</p>
              <ul className="space-y-2">
                <li><a href="#" className="text-sm text-background/60 hover:text-background transition-colors">FAQ</a></li>
                <li><a href="#" className="text-sm text-background/60 hover:text-background transition-colors">Contacto</a></li>
                <li><a href="#" className="text-sm text-background/60 hover:text-background transition-colors">Términos</a></li>
              </ul>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <p className="label-caps text-background/40 mb-4">Newsletter</p>
            <p className="text-sm text-background/60 mb-4">Recibe novedades y coreografías exclusivas.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-2.5 rounded-full bg-background/10 border border-background/20 text-background placeholder:text-background/40 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button className="px-5 py-2.5 rounded-full bg-gradient-brand text-primary-foreground text-sm font-semibold hover:brightness-110 transition-all active:scale-[0.97]">
                Unirme
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-background/10 pt-6 text-center">
          <p className="text-xs text-background/40">
            © 2026 DanceFlow. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
