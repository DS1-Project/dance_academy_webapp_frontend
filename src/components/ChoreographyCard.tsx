import { useEffect, useMemo, useState } from "react";
import { Star, Play, Video, ShoppingCart, Check, MessageSquareText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCart } from "@/contexts/CartContext";
import type { Choreography } from "@/lib/mock-data";
import { createReview } from "@/services/reviewService";
import { ReviewStars } from "@/components/ReviewStars";
import type { Review } from "@/types/reviews";

interface ChoreographyCardProps {
  choreography: Choreography;
  featured?: boolean;
}

export function ChoreographyCard({ choreography, featured = false }: ChoreographyCardProps) {
  const { items, addItem } = useCart();
  const { songName, genre, difficulty, mainTeacher, guestTeacher, price, videoCount, thumbnailColor } = choreography;
  const inCart = items.some((i) => i.choreography.id === choreography.id);
  const [reviews, setReviews] = useState<Review[]>(() => choreography.reviews ?? []);
  const [selectedRating, setSelectedRating] = useState(0);
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviews, setShowReviews] = useState(false);

  useEffect(() => {
    setReviews(choreography.reviews ?? []);
  }, [choreography.id, choreography.reviews]);

  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return Number(choreography.rating.toFixed(1));
    }

    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    return Number((sum / reviews.length).toFixed(1));
  }, [choreography.rating, reviews]);

  const difficultyColor = {
    Principiante: "bg-accent/15 text-accent",
    Intermedio: "bg-primary/15 text-primary",
    Avanzado: "bg-secondary/15 text-secondary",
  }[difficulty];

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const cleanedComment = comment.trim();

    if (selectedRating < 1 || selectedRating > 5) {
      setValidationError("La calificación debe estar entre 1 y 5 estrellas.");
      setFeedbackMessage(null);
      return;
    }

    if (!cleanedComment) {
      setValidationError("Escribe un comentario para enviar la review.");
      setFeedbackMessage(null);
      return;
    }

    setValidationError(null);
    setIsSubmitting(true);
    setFeedbackMessage(null);

    const localReview: Review = {
      id: `${choreography.id}-${Date.now()}`,
      userName: "Tú",
      comment: cleanedComment,
      rating: selectedRating,
      createdAt: new Date().toISOString(),
    };

    try {
      const serverReview = await createReview({ rating: selectedRating, comment: cleanedComment });
      const mergedReview: Review = {
        id: serverReview.id ?? localReview.id,
        userName: serverReview.userName || localReview.userName,
        comment: serverReview.comment || cleanedComment,
        rating: serverReview.rating || selectedRating,
        createdAt: serverReview.createdAt || localReview.createdAt,
      };
      setReviews((current) => [mergedReview, ...current.filter((review) => review.id !== mergedReview.id)]);
      setComment("");
      setSelectedRating(0);
      setFeedbackMessage("Review enviada correctamente.");
    } catch (error) {
      setReviews((current) => [localReview, ...current.filter((review) => review.id !== localReview.id)]);
      setComment("");
      setSelectedRating(0);
      setFeedbackMessage(error instanceof Error ? error.message : "No se pudo sincronizar con el backend; la review quedó registrada en la vista local.");
    } finally {
      setIsSubmitting(false);
      setShowReviews(true);
    }
  };

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
            <span className="text-sm font-bold tabular-nums">{averageRating.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">({reviews.length})</span>
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

        <div className="mt-4 border-t border-border/70 pt-4">
          <button
            type="button"
            onClick={() => setShowReviews((current) => !current)}
            className="flex w-full items-center justify-between text-left text-sm font-semibold"
          >
            <span className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-primary" />
              Reviews y comentarios
            </span>
            <span className="text-xs text-muted-foreground">{reviews.length} opiniones</span>
          </button>

          {showReviews && (
            <div className="mt-3 space-y-3">
              <form onSubmit={handleSubmit} className="rounded-2xl border border-border/70 bg-muted/40 p-3 space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <Label htmlFor={`review-comment-${choreography.id}`} className="text-xs uppercase tracking-[0.2em]">
                      Tu comentario
                    </Label>
                    <p className="text-xs text-muted-foreground">Selecciona de 1 a 5 estrellas y deja tu feedback.</p>
                  </div>
                  <ReviewStars value={selectedRating} onChange={setSelectedRating} />
                </div>

                <Textarea
                  id={`review-comment-${choreography.id}`}
                  placeholder="Cuéntanos qué te pareció este video..."
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  className="min-h-[90px]"
                />

                {validationError ? <p className="text-sm text-destructive">{validationError}</p> : null}
                {feedbackMessage ? (
                  <p className={`text-sm ${feedbackMessage.includes("correctamente") ? "text-emerald-600" : "text-destructive"}`}>
                    {feedbackMessage}
                  </p>
                ) : null}

                <div className="flex items-center justify-end">
                  <Button type="submit" size="sm" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Enviar review"}
                  </Button>
                </div>
              </form>

              <div className="space-y-2">
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <div key={review.id} className="rounded-2xl border border-border/70 bg-background/70 p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{review.userName}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }, (_, index) => (
                            <Star key={`${review.id}-${index}`} className={`h-3.5 w-3.5 ${index < review.rating ? "fill-primary text-primary" : "text-muted-foreground/50"}`} />
                          ))}
                        </div>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">{review.comment}</p>
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-border/70 p-3 text-sm text-muted-foreground">
                    Aún no hay reviews para esta coreografía.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
