import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { approveReview, getReviews, rejectReview } from "@/services/reviewService";
import type { ReviewResponse } from "@/services/reviewService";

const ReviewModeration = () => {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        const data = await getReviews(undefined, true);
        setReviews(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "No se pudieron cargar las reviews");
      } finally {
        setLoading(false);
      }
    };

    void loadReviews();
  }, []);

  const grouped = useMemo(() => ({
    pending: reviews.filter((item) => item.reviewStatus === "pending"),
    approved: reviews.filter((item) => item.reviewStatus === "approved"),
    rejected: reviews.filter((item) => item.reviewStatus === "rejected"),
  }), [reviews]);

  const handleApprove = async (reviewId: string) => {
    const updated = await approveReview(reviewId);
    setReviews((current) => current.map((item) => (item.id === reviewId ? updated : item)));
  };

  const handleReject = async (reviewId: string) => {
    const updated = await rejectReview(reviewId);
    setReviews((current) => current.map((item) => (item.id === reviewId ? updated : item)));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container space-y-6">
          <Link to="/admin" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" /> Volver al panel admin
          </Link>
          <div>
            <p className="label-caps text-primary mb-1">Moderación</p>
            <h1 className="text-3xl md:text-4xl font-bold">Gestión de reviews</h1>
            <p className="text-muted-foreground">Revisa y controla el estado de las reseñas enviadas por los usuarios.</p>
          </div>
          {loading ? <p className="text-muted-foreground">Cargando reviews…</p> : null}
          {error ? <p className="text-destructive">{error}</p> : null}
          <div className="grid gap-4 md:grid-cols-3">
            {Object.entries(grouped).map(([key, items]) => (
              <section key={key} className="rounded-2xl border border-border/70 bg-card p-4 shadow-card">
                <h2 className="text-lg font-semibold capitalize">{key === "pending" ? "Pendientes" : key === "approved" ? "Aprobadas" : "Rechazadas"}</h2>
                <p className="text-sm text-muted-foreground">{items.length} reseñas</p>
                <div className="mt-4 space-y-3">
                  {items.length === 0 ? <p className="text-sm text-muted-foreground">No hay reseñas en este estado.</p> : null}
                  {items.map((item) => (
                    <article key={item.id} className="rounded-xl border border-border/70 bg-background/70 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="font-semibold">{item.userName}</p>
                          <p className="text-sm text-muted-foreground">{item.comment}</p>
                        </div>
                        <div className="flex items-center gap-1">
                          {item.reviewStatus === "pending" ? (
                            <>
                              <Button size="sm" variant="outline" onClick={() => void handleApprove(item.id)}>
                                <CheckCircle2 className="mr-1 h-4 w-4" /> Aprobar
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => void handleReject(item.id)}>
                                <XCircle className="mr-1 h-4 w-4" /> Rechazar
                              </Button>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">Calificación: {item.rating}/5</p>
                    </article>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReviewModeration;
