import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp, Play, Loader2, AlertCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ReviewStars } from "@/components/ReviewStars";
import { toast } from "@/hooks/use-toast";
import { getApiErrorMessage } from "@/lib/api";
import { canLeaveReview } from "@/lib/reviewAccess";
import { useAuth } from "@/contexts/AuthContext";
import { playVideo } from "@/services/videoService";
import { createReview, getReviews, type ReviewResponse } from "@/services/reviewService";
import type { BackendChoreography } from "@/types/backend";

function formatDuration(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface PurchasedChoreographyCardProps {
  choreography: BackendChoreography;
  currentUserId?: string;
  onPlayed?: () => void;
}

export function PurchasedChoreographyCard({
  choreography,
  currentUserId,
  onPlayed,
}: PurchasedChoreographyCardProps) {
  const { user } = useAuth();
  const canReview = canLeaveReview(user?.role, true);
  const [expanded, setExpanded] = useState(false);
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsError, setReviewsError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [playingVideoId, setPlayingVideoId] = useState<string | null>(null);

  useEffect(() => {
    if (!expanded) return;
    setReviewsLoading(true);
    setReviewsError(null);
    getReviews(choreography.id, currentUserId)
      .then(setReviews)
      .catch((err) => setReviewsError(getApiErrorMessage(err, "No se pudieron cargar las reseñas")))
      .finally(() => setReviewsLoading(false));
  }, [expanded, choreography.id, currentUserId]);

  const videos = [...(choreography.videos ?? [])].sort((a, b) => a.sequence_order - b.sequence_order);
  const myReview = reviews.find((r) => r.isOwner);

  async function handlePlay(videoId: string, url?: string) {
    setPlayingVideoId(videoId);
    try {
      await playVideo(videoId);
      onPlayed?.();
    } catch (err) {
      toast({
        title: "No se pudo registrar la reproducción",
        description: getApiErrorMessage(err),
        variant: "destructive",
      });
    } finally {
      setPlayingVideoId(null);
    }
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!canReview) return;
    if (rating < 1) {
      toast({ title: "Selecciona una calificación", variant: "destructive" });
      return;
    }
    setSubmittingReview(true);
    try {
      const created = await createReview({ choreographyId: choreography.id, rating, comment: comment.trim() });
      setReviews((prev) => [{ ...created, isOwner: true }, ...prev.filter((r) => r.id !== created.id)]);
      setRating(0);
      setComment("");
      toast({ title: "Reseña publicada", description: "Gracias por tu opinión." });
    } catch (err) {
      toast({
        title: "No se pudo publicar la reseña",
        description: err instanceof Error ? err.message : undefined,
        variant: "destructive",
      });
    } finally {
      setSubmittingReview(false);
    }
  }

  return (
    <div className="rounded-xl bg-muted/50 overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/70 transition-colors"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-12 h-12 rounded-xl bg-gradient-brand flex items-center justify-center shrink-0 overflow-hidden">
            {choreography.thumbnail_url ? (
              <img src={choreography.thumbnail_url} alt="" className="w-full h-full object-cover" />
            ) : (
              <Play className="h-5 w-5 text-primary-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{choreography.title}</p>
            <p className="text-xs text-muted-foreground">
              {videos.length} {videos.length === 1 ? "video" : "videos"}
            </p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 shrink-0" /> : <ChevronDown className="h-4 w-4 shrink-0" />}
      </button>

      {expanded && (
        <div className="border-t border-border/50 p-4 space-y-4">
          {choreography.description && <p className="text-xs text-muted-foreground">{choreography.description}</p>}

          {videos.length === 0 ? (
            <p className="text-xs text-muted-foreground">Esta coreografía aún no tiene videos publicados.</p>
          ) : (
            <ul className="space-y-1.5">
              {videos.map((v) => (
                <li key={v.id}>
                  <button
                    type="button"
                    onClick={() => handlePlay(v.id, v.video_url)}
                    disabled={playingVideoId === v.id}
                    className="w-full flex items-center justify-between gap-3 p-2.5 rounded-lg bg-background hover:bg-primary/5 border border-border/50 transition-colors text-left disabled:opacity-60"
                  >
                    <span className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-md bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                        {v.sequence_order}
                      </span>
                      <span className="text-sm font-medium truncate">{v.title}</span>
                    </span>
                    <span className="flex items-center gap-2 text-xs text-muted-foreground shrink-0">
                      {formatDuration(v.duration_seconds)}
                      {playingVideoId === v.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Play className="h-3.5 w-3.5" />
                      )}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="border-t border-border/50 pt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Reseñas</p>

            {reviewsLoading ? (
              <div className="flex items-center text-xs text-muted-foreground">
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                Cargando reseñas...
              </div>
            ) : reviewsError ? (
              <div className="flex items-start gap-2 text-xs text-destructive">
                <AlertCircle className="h-3.5 w-3.5 shrink-0 mt-0.5" />
                <span>{reviewsError}</span>
              </div>
            ) : (
              <div className="space-y-2 mb-3">
                {reviews.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Aún no has dejado una reseña.</p>
                ) : (
                  reviews.map((r) => (
                    <div key={r.id} className="rounded-lg bg-background border border-border/50 p-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold">
                          {r.userName}
                          {r.isOwner ? " (tú)" : ""}
                        </span>
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }, (_, i) => (
                            <Star
                              key={i}
                              className={`h-3 w-3 ${i < r.rating ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
                            />
                          ))}
                        </span>
                      </div>
                      {r.comment && <p className="text-xs text-muted-foreground mt-1">{r.comment}</p>}
                    </div>
                  ))
                )}
              </div>
            )}

            {!myReview && !reviewsLoading && canReview && (
              <form onSubmit={handleSubmitReview} className="rounded-lg border border-border/50 bg-background p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold">Deja tu reseña</span>
                  <ReviewStars value={rating} onChange={setRating} disabled={submittingReview} />
                </div>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Cuéntanos qué te pareció..."
                  className="min-h-[70px] text-xs"
                  disabled={submittingReview}
                />
                <div className="flex justify-end">
                  <Button type="submit" size="sm" disabled={submittingReview}>
                    {submittingReview ? "Enviando..." : "Publicar reseña"}
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
