// Tipos que reflejan las respuestas del backend Django (rama develop)

export interface BackendEnrollment {
  id: string;
  choreography: string; // UUID
  choreography_title: string;
  acquired_at: string;
}

export interface BackendVideoClip {
  id: string;
  title: string;
  video_url: string;
  sequence_order: number;
  duration_seconds: number;
}

export interface BackendChoreography {
  id: string;
  title: string;
  description: string;
  difficulty_level: "beginner" | "intermediate" | "advanced";
  thumbnail_url: string;
  is_approved: boolean;
  created_at: string;
  main_teacher: string;
  dance_style: string;
  guest_teachers?: string[];
  videos?: BackendVideoClip[];
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