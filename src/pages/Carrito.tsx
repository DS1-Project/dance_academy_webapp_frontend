import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart as CartIcon, ArrowRight, CheckCircle2, CreditCard, FileText, User } from "lucide-react";

type Step = "carrito" | "datos" | "facturacion" | "pago" | "confirmacion";

const Carrito = () => {
  const { items, removeItem, clearCart, total } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>("carrito");
  const [paymentMethod, setPaymentMethod] = useState<string>("");

  if (step === "confirmacion") {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="pt-24 md:pt-28 pb-20">
          <div className="container max-w-lg mx-auto text-center">
            <div className="bg-card rounded-3xl shadow-card p-8 md:p-12">
              <div className="w-20 h-20 rounded-full bg-accent/15 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="h-10 w-10 text-accent" />
              </div>
              <h2 className="text-2xl md:text-3xl mb-3">¡Compra Exitosa!</h2>
              <p className="text-muted-foreground mb-6">
                Tu pago ha sido procesado. Ya puedes acceder a tus coreografías.
              </p>
              <div className="space-y-3">
                <Button className="w-full" size="lg" onClick={() => { clearCart(); navigate("/dashboard"); }}>
                  Ir a Mis Coreografías
                </Button>
                <Button variant="outline" className="w-full" size="lg" onClick={() => { clearCart(); navigate("/catalogo"); }}>
                  Seguir Explorando
                </Button>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container max-w-3xl mx-auto">
          <h1 className="text-3xl md:text-5xl mb-6">
            {step === "carrito" ? "Carrito" : step === "datos" ? "Datos Personales" : step === "facturacion" ? "Facturación" : "Pago"}
          </h1>

          {/* Steps indicator */}
          <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
            {(["carrito", "datos", "facturacion", "pago"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2 shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  step === s ? "bg-gradient-brand text-primary-foreground" :
                  (["carrito", "datos", "facturacion", "pago"] as Step[]).indexOf(step) > i ? "bg-accent text-accent-foreground" :
                  "bg-muted text-muted-foreground"
                }`}>{i + 1}</div>
                {i < 3 && <div className="w-8 h-0.5 bg-border" />}
              </div>
            ))}
          </div>

          {/* Step: Carrito */}
          {step === "carrito" && (
            <div>
              {items.length === 0 ? (
                <div className="bg-card rounded-3xl shadow-card p-12 text-center">
                  <CartIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-bold mb-2">Tu carrito está vacío</h3>
                  <p className="text-muted-foreground text-sm mb-4">Explora nuestro catálogo y agrega coreografías.</p>
                  <Button onClick={() => navigate("/catalogo")}>Ir al Catálogo</Button>
                </div>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    {items.map((item) => (
                      <div key={item.choreography.id} className="flex items-center justify-between p-4 bg-card rounded-2xl shadow-card">
                        <div className="flex items-center gap-3">
                          <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.choreography.thumbnailColor} flex items-center justify-center shrink-0`}>
                            <span className="text-primary-foreground font-display font-extrabold text-xs text-center leading-tight px-1">{item.choreography.songName.slice(0, 8)}</span>
                          </div>
                          <div>
                            <p className="font-semibold text-sm">{item.choreography.songName}</p>
                            <p className="text-xs text-muted-foreground">{item.choreography.mainTeacher} · {item.choreography.videoCount} videos</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-display font-extrabold">${item.choreography.price}</span>
                          <button onClick={() => removeItem(item.choreography.id)} className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-card rounded-2xl shadow-card p-5 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-2xl font-display font-extrabold">${total.toFixed(2)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={clearCart}>Vaciar</Button>
                      <Button size="default" className="gap-1" onClick={() => {
                        if (!isAuthenticated) { navigate("/login"); return; }
                        setStep("datos");
                      }}>
                        Continuar <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Step: Datos */}
          {step === "datos" && (
            <div className="bg-card rounded-3xl shadow-card p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <User className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Datos del Comprador</h3>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Nombre</label>
                  <input defaultValue={user?.name || ""} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Correo</label>
                  <input defaultValue={user?.email || ""} className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Teléfono</label>
                  <input placeholder="+57 300 123 4567" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("carrito")}>Atrás</Button>
                <Button className="flex-1 gap-1" onClick={() => setStep("facturacion")}>
                  Continuar <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: Facturación */}
          {step === "facturacion" && (
            <div className="bg-card rounded-3xl shadow-card p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Datos de Facturación</h3>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Documento de identidad</label>
                  <input placeholder="1.234.567.890" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div>
                  <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Dirección</label>
                  <input placeholder="Calle 123 #45-67" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Ciudad</label>
                    <input placeholder="Bogotá" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="label-caps text-xs text-muted-foreground mb-1.5 block">País</label>
                    <input defaultValue="Colombia" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("datos")}>Atrás</Button>
                <Button className="flex-1 gap-1" onClick={() => setStep("pago")}>
                  Continuar <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step: Pago */}
          {step === "pago" && (
            <div className="bg-card rounded-3xl shadow-card p-6 md:p-8">
              <div className="flex items-center gap-2 mb-6">
                <CreditCard className="h-5 w-5 text-primary" />
                <h3 className="font-bold">Forma de Pago</h3>
              </div>
              <div className="space-y-3 mb-6">
                {["Tarjeta de Crédito", "Tarjeta Débito", "PSE"].map((method) => (
                  <button
                    key={method}
                    onClick={() => setPaymentMethod(method)}
                    className={`w-full p-4 rounded-xl border-2 text-left text-sm font-semibold transition-all active:scale-[0.98] ${
                      paymentMethod === method ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>

              {paymentMethod && (
                <div className="bg-muted/50 rounded-xl p-4 mb-6">
                  <p className="text-xs text-muted-foreground mb-3">(Simulación de pago)</p>
                  <div className="space-y-3">
                    <input placeholder="Número de tarjeta" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    <div className="grid grid-cols-2 gap-3">
                      <input placeholder="MM/AA" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                      <input placeholder="CVV" className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-muted/50 rounded-xl p-4 mb-6">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                  <span className="tabular-nums">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-muted-foreground">IVA (19%)</span>
                  <span className="tabular-nums">${(total * 0.19).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold border-t border-border pt-2">
                  <span>Total</span>
                  <span className="tabular-nums">${(total * 1.19).toFixed(2)}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" onClick={() => setStep("facturacion")}>Atrás</Button>
                <Button className="flex-1 gap-1" size="lg" disabled={!paymentMethod} onClick={() => setStep("confirmacion")}>
                  Pagar ${(total * 1.19).toFixed(2)}
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Carrito;
