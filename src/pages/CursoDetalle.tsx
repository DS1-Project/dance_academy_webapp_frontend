import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Check,
  Loader2,
  Play,
  ShoppingCart,
  Star,
  User,
  Video,
  AlertCircle,
} from "lucide-react";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ReviewStars } from "@/components/ReviewStars";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { getApiErrorMessage } from "@/lib/api";
import { mapBackendChoreographyToCard } from "@/lib/choreographyMapper";
import { dashboardHomePath } from "@/lib/dashboardHome";
import { canPurchaseCourses } from "@/lib/purchaseAccess";
import {
  getChoreographyDetail,
  listChoreographyVideos,
} from "@/services/choreographyService";
import { createReview, getReviews, type ReviewResponse } from "@/services/reviewService";
import type { BackendChoreography, BackendVideoClip } from "@/types/backend";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function teacherLabel(teacher: BackendChoreography["main_teacher"]): string {
  if (!teacher) return "Sin profesor";
  if (typeof teacher === "string") return teacher;
  const full = `${teacher.first_name} ${teacher.last_name}`.trim();
  return full || teacher.email;
}

function styleLabel(style: BackendChoreography["dance_style"]): string {
  if (!style) return "General";
  if (typeof style === "string") return style;
  return style.name;
}

const DIFFICULTY_LABEL: Record<string, string> = {
  beginner: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzado",
};

const CursoDetalle = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addItem, isInCart } = useCart();
  const canPurchase = canPurchaseCourses(user?.role);

  const [course, setCourse] = useState<BackendChoreography | null>(null);
  const [videos, setVideos] = useState<BackendVideoClip[]>([]);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    Promise.all([
      getChoreographyDetail(id),
      listChoreographyVideos(id).catch(() => [] as BackendVideoClip[]),
      getReviews(id, user?.id).catch(() => [] as ReviewResponse[]),
    ])
      .then(([detail, clips, courseReviews]) => {
        if (cancelled) return;
        setCourse(detail);
        const fromDetail = [...(detail.videos ?? [])].sort(
          (a, b) => a.sequence_order - b.sequence_order
        );
        const fromList = [...clips].sort((a, b) => a.sequence_order - b.sequence_order);
        setVideos(fromList.length ? fromList : fromDetail);
        setReviews(courseReviews);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(getApiErrorMessage(err, "No se pudo cargar el curso."));
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, user?.id]);

  const card = useMemo(
    () => (course ? mapBackendChoreographyToCard(course) : null),
    [course]
  );

  const averageRating = useMemo(() => {
    if (reviews.length) {
      const sum = reviews.reduce((total, review) => total + review.rating, 0);
      return Number((sum / reviews.length).toFixed(1));
    }
    if (course?.stats?.average_rating) {
      return Number(Number(course.stats.average_rating).toFixed(1));
    }
    return 0;
  }, [reviews, course]);

  const inCart = course ? isInCart(course.id) : false;
  const price = course?.stats?.actual_price ? Number(course.stats.actual_price) : 0;
  const isPurchased = Boolean(course?.is_purchased);

  async function handleBuy() {
    if (!card) return;
    if (!canPurchase) return;
    if (!isAuthenticated) {
      navigate("/login", { state: { message: "Inicia sesión para comprar este curso." } });
      return;
    }
    if (inCart) {
      navigate("/carrito");
      return;
    }
    const added = addItem(card);
    if (added) navigate("/carrito");
  }

  async function handleSubmitReview(event: React.FormEvent) {
    event.preventDefault();
    if (!course) return;
    if (rating < 1 || rating > 5) {
      setReviewError("La calificación debe estar entre 1 y 5 estrellas.");
      return;
    }
    if (!comment.trim()) {
      setReviewError("Escribe un comentario para enviar la reseña.");
      return;
    }

    setReviewError(null);
    setSubmittingReview(true);
    try {
      const created = await createReview({
        choreographyId: course.id,
        rating,
        comment: comment.trim(),
      });
      setReviews((prev) => [{ ...created, isOwner: true }, ...prev.filter((r) => r.id !== created.id)]);
      setRating(0);
      setComment("");
    } catch (err) {
      setReviewError(err instanceof Error ? err.message : "No se pudo publicar la reseña.");
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-24 md:pt-28 pb-20">
        <div className="container max-w-5xl mx-auto">
          <Link
            to="/catalogo"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al catálogo
          </Link>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-24 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              Cargando curso…
            </div>
          )}

          {!loading && error && (
            <div className="rounded-3xl bg-card shadow-card p-8 text-center space-y-4">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto" />
              <p className="text-destructive">{error}</p>
              <Button variant="outline" onClick={() => navigate("/catalogo")}>
                Ir al catálogo
              </Button>
            </div>
          )}

          {!loading && !error && course && card && (
            <div className="space-y-8">
              <section className="bg-card rounded-3xl shadow-card overflow-hidden">
                <div className="relative aspect-[21/9] min-h-[220px] bg-muted">
                  {course.thumbnail_url ? (
                    <img
                      src={course.thumbnail_url}
                      alt={course.title}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  ) : (
                    <div className={`absolute inset-0 bg-gradient-to-br ${card.thumbnailColor}`} />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/70 via-foreground/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-2.5 py-0.5 rounded-full bg-background/90 text-xs font-semibold">
                        {styleLabel(course.dance_style)}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-background/90 text-xs font-semibold">
                        {DIFFICULTY_LABEL[course.difficulty_level] ?? course.difficulty_level}
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-display font-extrabold text-primary-foreground drop-shadow-lg">
                      {course.title}
                    </h1>
                  </div>
                </div>

                <div className="p-6 md:p-8 grid md:grid-cols-[1.4fr_0.8fr] gap-8">
                  <div className="space-y-6">
                    <div className="flex flex-wrap items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-primary text-primary" />
                        <span className="font-bold tabular-nums">{averageRating.toFixed(1)}</span>
                        <span className="text-muted-foreground">({reviews.length} reseñas)</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Video className="h-4 w-4" />
                        {videos.length} {videos.length === 1 ? "video" : "videos"}
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <User className="h-4 w-4" />
                        {teacherLabel(course.main_teacher)}
                      </div>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold mb-2">Descripción</h2>
                      <p className="text-muted-foreground leading-relaxed">
                        {course.description?.trim() || "Este curso aún no tiene descripción."}
                      </p>
                    </div>

                    <div>
                      <h2 className="text-lg font-bold mb-2">Profesor</h2>
                      <p className="font-semibold">{teacherLabel(course.main_teacher)}</p>
                      {course.guest_teachers && course.guest_teachers.length > 0 && (
                        <p className="text-sm text-muted-foreground mt-1">
                          Invitados:{" "}
                          {course.guest_teachers
                            .map((guest) => teacherLabel(guest as BackendChoreography["main_teacher"]))
                            .join(", ")}
                        </p>
                      )}
                    </div>

                    <div id="videos">
                      <h2 className="text-lg font-bold mb-3">Contenido del curso</h2>
                      {videos.length === 0 ? (
                        <p className="text-sm text-muted-foreground">Aún no hay videos publicados.</p>
                      ) : (
                        <ul className="space-y-2">
                          {videos.map((clip) => (
                            <li
                              key={clip.id}
                              className="flex items-center justify-between gap-3 rounded-2xl border border-border/70 bg-muted/30 px-4 py-3"
                            >
                              <div className="min-w-0">
                                <p className="font-semibold text-sm truncate">
                                  {clip.sequence_order}. {clip.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDuration(clip.duration_seconds || 0)}
                                  {!isPurchased ? " · Disponible tras la compra" : ""}
                                </p>
                              </div>
                              {isPurchased && clip.video_url ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="gap-1 shrink-0"
                                  onClick={() =>
                                    window.open(clip.video_url, "_blank", "noopener,noreferrer")
                                  }
                                >
                                  <Play className="h-3.5 w-3.5" />
                                  Ver
                                </Button>
                              ) : (
                                <span className="text-xs text-muted-foreground shrink-0">Bloqueado</span>
                              )}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>

                  <aside className="rounded-3xl border border-border bg-muted/30 p-5 h-fit space-y-4 md:sticky md:top-28">
                    <p className="text-3xl font-display font-extrabold">${price.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      Incluye {videos.length} {videos.length === 1 ? "video" : "videos"} · Acceso
                      permanente tras la compra
                    </p>

                    {!canPurchase ? (
                      <div className="rounded-2xl border border-border bg-background/70 p-4 space-y-2">
                        <p className="text-sm font-semibold">Solo consulta</p>
                        <p className="text-sm text-muted-foreground">
                          Con tu rol puedes explorar el catálogo, pero no comprar cursos.
                        </p>
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => navigate(dashboardHomePath(user?.role))}
                        >
                          Ir al dashboard
                        </Button>
                      </div>
                    ) : isPurchased ? (
                      <Button className="w-full" onClick={() => navigate("/dashboard")}>
                        Ya lo tienes — Ir al dashboard
                      </Button>
                    ) : inCart ? (
                      <Button className="w-full gap-2" onClick={() => navigate("/carrito")}>
                        <Check className="h-4 w-4" />
                        En carrito — Ir a pagar
                      </Button>
                    ) : (
                      <Button className="w-full gap-2" size="lg" onClick={() => void handleBuy()}>
                        <ShoppingCart className="h-4 w-4" />
                        Comprar curso
                      </Button>
                    )}

                    {canPurchase && !isPurchased && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => {
                          if (!isAuthenticated) {
                            navigate("/login");
                            return;
                          }
                          addItem(card);
                        }}
                        disabled={inCart}
                      >
                        {inCart ? "Ya está en el carrito" : "Agregar al carrito"}
                      </Button>
                    )}
                  </aside>
                </div>
              </section>

              <section id="reviews" className="bg-card rounded-3xl shadow-card p-6 md:p-8 space-y-6">
                <div>
                  <h2 className="text-2xl font-display font-extrabold mb-1">Reseñas</h2>
                  <p className="text-sm text-muted-foreground">
                    {averageRating.toFixed(1)} de 5 · {reviews.length}{" "}
                    {reviews.length === 1 ? "opinión" : "opiniones"}
                  </p>
                </div>

                {isAuthenticated ? (
                  <form onSubmit={handleSubmitReview} className="rounded-2xl border border-border bg-muted/40 p-4 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <Label className="text-xs uppercase tracking-[0.2em]">Tu reseña</Label>
                        <p className="text-xs text-muted-foreground">
                          Califica el curso y comparte tu experiencia.
                        </p>
                      </div>
                      <ReviewStars value={rating} onChange={setRating} />
                    </div>
                    <Textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="¿Qué te pareció este curso?"
                      className="min-h-[90px]"
                    />
                    {reviewError && <p className="text-sm text-destructive">{reviewError}</p>}
                    <div className="flex justify-end">
                      <Button type="submit" size="sm" disabled={submittingReview}>
                        {submittingReview ? "Enviando…" : "Publicar reseña"}
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="rounded-2xl border border-border bg-muted/40 p-4 text-sm text-muted-foreground">
                    <p className="mb-3">Inicia sesión para dejar una reseña.</p>
                    <Link to="/login">
                      <Button size="sm">Iniciar sesión</Button>
                    </Link>
                  </div>
                )}

                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-sm text-muted-foreground rounded-2xl border border-dashed border-border p-4">
                      Aún no hay reseñas. Sé el primero en opinar.
                    </p>
                  ) : (
                    reviews.map((review) => (
                      <article
                        key={review.id}
                        className="rounded-2xl border border-border/70 bg-background/70 p-4"
                      >
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div>
                            <p className="font-semibold text-sm">{review.userName}</p>
                            <p className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
                              {new Date(review.createdAt).toLocaleDateString("es-ES", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })}
                            </p>
                          </div>
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }, (_, index) => (
                              <Star
                                key={`${review.id}-${index}`}
                                className={`h-3.5 w-3.5 ${
                                  index < review.rating
                                    ? "fill-primary text-primary"
                                    : "text-muted-foreground/40"
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{review.comment}</p>
                      </article>
                    ))
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CursoDetalle;
