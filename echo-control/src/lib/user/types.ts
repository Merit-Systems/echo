// Types for User feature

export interface UserApiResponse {
  id: string;
  email: string | null;
  name: string | null;
  createdAt: string;
  updatedAt: string;
  totalPaid: number;
  totalSpent: number;
}
