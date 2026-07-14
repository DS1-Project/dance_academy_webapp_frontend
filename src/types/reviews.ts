export interface Review {
  id: string;
  userName: string;
  comment: string;
  rating: number;
  createdAt: string;
  reviewStatus?: "pending" | "approved" | "rejected";
  isPublic?: boolean;
}
