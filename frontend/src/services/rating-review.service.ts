import api from './api';

export interface ReviewUser {
  id: string;
  full_name: string;
  profile_image?: string | null;
}

export interface ReviewProduct {
  id: string;
  name: string;
  images?: any;
}

export interface ReviewItem {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string | null;
  created_at: string;
  updated_at: string;
  User?: ReviewUser;
  Product?: ReviewProduct;
}

export interface ReviewSummary {
  average_rating: number;
  total_reviews: number;
}

export interface CreateReviewPayload {
  product_id: string;
  rating: number;
  comment?: string;
}

export interface UpdateReviewPayload {
  rating?: number;
  comment?: string;
}

class RatingReviewService {
  async getProductReviews(productId: string) {
    const response = await api.get(`/reviews/product/${productId}`);
    return response.data;
  }

  async getReviewById(id: string) {
    const response = await api.get(`/reviews/${id}`);
    return response.data;
  }

  async getMyReviews() {
    const response = await api.get('/reviews/my/list');
    return response.data;
  }

  async createReview(data: CreateReviewPayload) {
    const response = await api.post('/reviews', data);
    return response.data;
  }

  async updateReview(id: string, data: UpdateReviewPayload) {
    const response = await api.put(`/reviews/${id}`, data);
    return response.data;
  }

  async deleteReview(id: string) {
    const response = await api.delete(`/reviews/${id}`);
    return response.data;
  }
}

export default new RatingReviewService();
