import { useState, useRef, DragEvent, ChangeEvent } from "react";
import type { User } from "@/types/auth";
import { choreographies as initialChoreographies, type Choreography } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import {
  Music,
  Star,
  DollarSign,
  MessageSquare,
  Upload,
  Image as ImageIcon,
  Trash2,
  Plus,
  X,
  Video as VideoIcon,
  CheckCircle2,
} from "lucide-react";

const currencies = [
  { code: "USD", symbol: "$" },
  { code: "EUR", symbol: "€" },
  { code: "MXN", symbol: "$" },
  { code: "COP", symbol: "$" },
  { code: "ARS", symbol: "$" },
];

const gradientPool = [
  "from-primary to-secondary",
  "from-secondary to-accent",
  "from-primary to-orange-400",
  "from-fuchsia-600 to-primary",
  "from-rose-500 to-secondary",
  "from-amber-500 to-primary",
];

interface UploadFormState {
  videoFile: File | null;
  thumbnail: File | null;
  thumbnailUrl: string | null;
  title: string;
  description: string;
  price: string;
  currency: string;
}

const initialForm: UploadFormState = {
  videoFile: null,
  thumbnail: null,
  thumbnailUrl: null,
  title: "",
  description: "",
  price: "",
  currency: "USD",
};

export function ProfesorDashboard({ user }: { user: User }) {
  const [myChoreographies, setMyChoreographies] = useState<Choreography[]>(() =>
    initialChoreographies.filter((c) => c.mainTeacher === user.name || c.guestTeacher === user.name),
  );
  const [form, setForm] = useState<UploadFormState>(initialForm);
  const [dragActive, setDragActive] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Choreography | null>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const totalSales = myChoreographies.reduce((sum, c) => sum + c.salesCount, 0);
  const totalRevenue = myChoreographies.reduce((sum, c) => sum + c.salesCount * c.price, 0);
  const avgRating = myChoreographies.length
    ? (myChoreographies.reduce((sum, c) => sum + c.rating, 0) / myChoreographies.length).toFixed(1)
    : "0";

  const handleVideoFile = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("video/")) {
      toast({ title: "Archivo inválido", description: "Debe ser un archivo de video.", variant: "destructive" });
      return;
    }
    setForm((f) => ({ ...f, videoFile: file }));
  };

  const handleThumbnail = (file: File | null) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast({ title: "Archivo inválido", description: "Debe ser una imagen.", variant: "destructive" });
      return;
    }
    const url = URL.createObjectURL(file);
    setForm((f) => ({ ...f, thumbnail: file, thumbnailUrl: url }));
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    handleVideoFile(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.videoFile) return toast({ title: "Falta el video", description: "Sube un archivo de video.", variant: "destructive" });
    if (!form.thumbnail) return toast({ title: "Falta la portada", description: "Sube una imagen de portada.", variant: "destructive" });
    if (!form.title.trim()) return toast({ title: "Falta el título", variant: "destructive" });
    if (!form.description.trim()) return toast({ title: "Falta la descripción", variant: "destructive" });
    const priceNum = parseFloat(form.price);
    if (isNaN(priceNum) || priceNum <= 0) return toast({ title: "Precio inválido", variant: "destructive" });

    const newItem: Choreography = {
      id: Date.now().toString(),
      songName: form.title.trim(),
      genre: "Pop",
      difficulty: "Intermedio",
      mainTeacher: user.name,
      price: priceNum,
      description: form.description.trim(),
      videoCount: 1,
      rating: 0,
      reviewCount: 0,
      salesCount: 0,
      thumbnailColor: gradientPool[Math.floor(Math.random() * gradientPool.length)],
    };

    setMyChoreographies((prev) => [newItem, ...prev]);
    setForm(initialForm);
    if (videoInputRef.current) videoInputRef.current.value = "";
    if (thumbInputRef.current) thumbInputRef.current.value = "";
    toast({
      title: "¡Video publicado!",
      description: `"${newItem.songName}" se agregó a tu catálogo.`,
    });
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    setMyChoreographies((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    toast({ title: "Video eliminado", description: `"${deleteTarget.songName}" fue eliminado.` });
    setDeleteTarget(null);
  };

  const currencySymbol = currencies.find((c) => c.code === form.currency)?.symbol || "$";

  return (
    <div>
      <div className="mb-8">
        <p className="label-caps text-secondary mb-1">Profesor Bailarín</p>
        <h1 className="text-3xl md:text-5xl mb-2">Hola, {user.name.split(" ")[0]}</h1>
        <p className="text-muted-foreground">Tu panel de coreografías</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <div className="bg-card rounded-2xl shadow-card p-5">
          <Music className="h-5 w-5 text-secondary mb-2" />
          <p className="text-2xl font-display font-extrabold">{myChoreographies.length}</p>
          <p className="text-xs text-muted-foreground">Coreografías</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <DollarSign className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-display font-extrabold">${totalRevenue.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Ingresos Totales</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <Star className="h-5 w-5 text-primary mb-2" />
          <p className="text-2xl font-display font-extrabold">{avgRating}</p>
          <p className="text-xs text-muted-foreground">Valoración Promedio</p>
        </div>
        <div className="bg-card rounded-2xl shadow-card p-5">
          <MessageSquare className="h-5 w-5 text-accent mb-2" />
          <p className="text-2xl font-display font-extrabold">{totalSales}</p>
          <p className="text-xs text-muted-foreground">Ventas Totales</p>
        </div>
      </div>

      {/* Content management header */}
      <div className="mb-6">
        <p className="label-caps text-primary mb-2">Gestión de Contenido</p>
        <h2 className="text-2xl md:text-4xl">Tus videos</h2>
      </div>

      {/* Upload form */}
      <form
        onSubmit={handleSubmit}
        className="bg-card rounded-3xl shadow-card p-5 md:p-8 mb-8"
      >
        <div className="flex items-center gap-2 mb-6">
          <div className="w-9 h-9 rounded-xl bg-gradient-brand flex items-center justify-center">
            <Plus className="h-5 w-5 text-primary-foreground" />
          </div>
          <h3 className="font-bold">Añadir Nuevo Video</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Video drop zone */}
          <div>
            <label className="label-caps text-xs text-muted-foreground mb-2 block">Archivo de Video *</label>
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              onClick={() => videoInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all p-8 text-center ${
                dragActive
                  ? "border-primary bg-primary/5"
                  : form.videoFile
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
            >
              <input
                ref={videoInputRef}
                type="file"
                accept="video/*"
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleVideoFile(e.target.files?.[0] || null)}
                className="hidden"
              />
              {form.videoFile ? (
                <div className="flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-10 w-10 text-accent" />
                  <p className="font-semibold text-sm">{form.videoFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(form.videoFile.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm((f) => ({ ...f, videoFile: null }));
                      if (videoInputRef.current) videoInputRef.current.value = "";
                    }}
                    className="text-xs text-destructive font-semibold mt-1 hover:underline"
                  >
                    Quitar archivo
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-sm">Arrastra tu video aquí</p>
                  <p className="text-xs text-muted-foreground">o haz clic para seleccionar</p>
                  <p className="text-xs text-muted-foreground mt-1">MP4, MOV, WEBM</p>
                </div>
              )}
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="label-caps text-xs text-muted-foreground mb-2 block">Miniatura / Portada *</label>
            <div
              onClick={() => thumbInputRef.current?.click()}
              className={`relative cursor-pointer rounded-2xl border-2 border-dashed transition-all overflow-hidden ${
                form.thumbnailUrl
                  ? "border-accent"
                  : "border-border hover:border-primary/50 hover:bg-muted/30"
              }`}
              style={{ minHeight: "180px" }}
            >
              <input
                ref={thumbInputRef}
                type="file"
                accept="image/*"
                onChange={(e: ChangeEvent<HTMLInputElement>) => handleThumbnail(e.target.files?.[0] || null)}
                className="hidden"
              />
              {form.thumbnailUrl ? (
                <>
                  <img src={form.thumbnailUrl} alt="Portada" className="w-full h-full object-cover absolute inset-0" />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm((f) => ({ ...f, thumbnail: null, thumbnailUrl: null }));
                      if (thumbInputRef.current) thumbInputRef.current.value = "";
                    }}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-foreground/70 text-background flex items-center justify-center hover:bg-destructive transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center gap-2 p-8 text-center" style={{ minHeight: "180px" }}>
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-sm">Sube una portada</p>
                  <p className="text-xs text-muted-foreground">JPG, PNG, WEBP</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Título *</label>
          <input
            type="text"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            maxLength={120}
            placeholder="Ej: Bachata Sensual Avanzada"
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Description */}
        <div className="mb-4">
          <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Descripción *</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            maxLength={500}
            rows={4}
            placeholder="Describe la coreografía, lo que aprenderán y para quién es..."
            className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
          />
          <p className="text-xs text-muted-foreground mt-1 text-right">
            {form.description.length}/500
          </p>
        </div>

        {/* Price + Currency */}
        <div className="mb-6">
          <label className="label-caps text-xs text-muted-foreground mb-1.5 block">Precio del Curso *</label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-semibold">
                {currencySymbol}
              </span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                placeholder="29.99"
                className="w-full pl-8 pr-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <select
              value={form.currency}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
              className="px-4 py-3 rounded-xl border border-border bg-background text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              {currencies.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Button type="submit" size="lg" className="w-full sm:w-auto gap-2">
          <Upload className="h-4 w-4" />
          Publicar Video
        </Button>
      </form>

      {/* Videos list */}
      <div className="bg-card rounded-3xl shadow-card p-5 md:p-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <VideoIcon className="h-5 w-5 text-secondary" />
            <h3 className="font-bold">Mis Videos Publicados</h3>
          </div>
          <span className="px-3 py-1 rounded-full bg-muted text-xs font-semibold text-muted-foreground">
            {myChoreographies.length} {myChoreographies.length === 1 ? "video" : "videos"}
          </span>
        </div>

        {myChoreographies.length === 0 ? (
          <div className="text-center py-12">
            <VideoIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold mb-1">Aún no tienes videos</p>
            <p className="text-sm text-muted-foreground">Publica tu primera coreografía con el formulario de arriba.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myChoreographies.map((c) => (
              <div
                key={c.id}
                className="group relative rounded-2xl overflow-hidden bg-muted/30 hover:shadow-card-hover transition-all"
              >
                <div className={`relative aspect-video bg-gradient-to-br ${c.thumbnailColor}`}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="font-display font-extrabold text-primary-foreground text-lg text-center px-3 drop-shadow-lg leading-tight">
                      {c.songName}
                    </span>
                  </div>
                  <button
                    onClick={() => setDeleteTarget(c)}
                    className="absolute top-2 right-2 w-9 h-9 rounded-full bg-foreground/70 backdrop-blur-sm text-background flex items-center justify-center hover:bg-destructive transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                    aria-label="Eliminar video"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <div className="p-3">
                  <p className="font-semibold text-sm truncate">{c.songName}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-muted-foreground">
                      {c.salesCount} {c.salesCount === 1 ? "venta" : "ventas"}
                    </p>
                    <p className="text-sm font-display font-extrabold">${c.price}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation modal */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent className="rounded-3xl">
          <DialogHeader>
            <div className="w-12 h-12 rounded-full bg-destructive/15 flex items-center justify-center mb-2">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <DialogTitle className="text-xl">¿Eliminar este video?</DialogTitle>
            <DialogDescription className="text-sm pt-1">
              ¿Estás seguro de que deseas eliminar{" "}
              <span className="font-semibold text-foreground">"{deleteTarget?.songName}"</span>? Esta acción no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-2">
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={confirmDelete} className="gap-2">
              <Trash2 className="h-4 w-4" />
              Sí, eliminar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
