// Tipos que reflejan las respuestas del backend Django

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";

export interface TeacherBrief {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
}

export interface DanceStyle {
  id: string;
  name: string;
  description?: string | null;
}

export interface ChoreographyStats {
  actual_price: string;
  total_views: number;
  total_sales_count: number;
  average_rating: string;
  last_updated: string;
}

export interface BackendEnrollment {
  id: string;
  choreography: string;
  choreography_title: string;
  acquired_at: string;
}

export interface BackendVideoClip {
  id: string;
  title: string;
  video_url?: string;
  choreography?: string;
  sequence_order: number;
  duration_seconds: number;
}

export interface BackendChoreography {
  id: string;
  title: string;
  description: string;
  difficulty_level: DifficultyLevel;
  thumbnail_url: string;
  is_approved: boolean;
  created_at: string;
  main_teacher: TeacherBrief | string;
  dance_style: DanceStyle | string;
  guest_teachers?: TeacherBrief[] | string[];
  stats?: ChoreographyStats;
  video_count?: number;
  videos?: BackendVideoClip[];
  is_purchased?: boolean;
}

export interface CreateChoreographyPayload {
  title: string;
  description: string;
  difficulty_level: DifficultyLevel;
  thumbnail_url: string;
  dance_style: string;
  guest_teachers?: string[];
  main_teacher?: string;
  actual_price?: number | string;
}

export interface CreateVideoPayload {
  title: string;
  video_url: string;
  sequence_order: number;
  duration_seconds: number;
}

export interface BackendSaleDetail {
  id: string;
  choreography: string | null;
  choreography_title: string | null;
  unit_price: string;
}

export type PaymentStatus = "pending" | "completed" | "failed";

export interface BackendSale {
  id: string;
  client: string;
  client_email: string;
  total_amount: string;
  payment_status: PaymentStatus;
  billing_address: string;
  created_at: string;
  details: BackendSaleDetail[];
}

export interface BackendReview {
  id: string;
  client: string;
  client_email: string;
  client_name: string;
  choreography: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface PlaybackHistoryItem {
  id: string;
  client: string;
  video_clip: string;
  video_title?: string;
  choreography_title?: string;
  created_at: string;
}

export interface MediaUploadResponse {
  url: string;
}
