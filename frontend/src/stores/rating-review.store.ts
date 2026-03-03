import { create } from 'zustand';
import ratingReviewService, {
  type CreateReviewPayload,
  type ReviewItem,
  type ReviewSummary,
  type UpdateReviewPayload,
} from '@/services/rating-review.service';

interface RatingReviewState {
  productReviews: ReviewItem[];
  myReviews: ReviewItem[];
  currentReview: ReviewItem | null;
  summary: ReviewSummary | null;
  currentProductId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchProductReviews: (productId: string) => Promise<void>;
  fetchMyReviews: () => Promise<void>;
  fetchReviewById: (id: string) => Promise<ReviewItem | null>;
  createReview: (data: CreateReviewPayload) => Promise<ReviewItem | null>;
  updateReview: (id: string, data: UpdateReviewPayload) => Promise<ReviewItem | null>;
  deleteReview: (id: string) => Promise<boolean>;
  clearCurrentReview: () => void;
  clearError: () => void;
}

export const useRatingReviewStore = create<RatingReviewState>((set, get) => ({
  productReviews: [],
  myReviews: [],
  currentReview: null,
  summary: null,
  currentProductId: null,
  isLoading: false,
  error: null,

  fetchProductReviews: async (productId: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ratingReviewService.getProductReviews(productId);
      set({
        productReviews: response.data?.reviews || [],
        summary: response.data?.summary || null,
        currentProductId: productId,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch product reviews',
        isLoading: false,
      });
    }
  },

  fetchMyReviews: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await ratingReviewService.getMyReviews();
      set({
        myReviews: response.data?.reviews || [],
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch my reviews',
        isLoading: false,
      });
    }
  },

  fetchReviewById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ratingReviewService.getReviewById(id);
      const review = response.data?.review || null;
      set({ currentReview: review, isLoading: false });
      return review;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to fetch review',
        isLoading: false,
      });
      return null;
    }
  },

  createReview: async (data: CreateReviewPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ratingReviewService.createReview(data);
      const review = response.data?.review || null;

      if (review) {
        const currentProductId = get().currentProductId;
        if (currentProductId === data.product_id) {
          await get().fetchProductReviews(data.product_id);
        } else {
          set({ isLoading: false });
        }
        await get().fetchMyReviews();
      } else {
        set({ isLoading: false });
      }

      return review;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to create review',
        isLoading: false,
      });
      return null;
    }
  },

  updateReview: async (id: string, data: UpdateReviewPayload) => {
    set({ isLoading: true, error: null });
    try {
      const response = await ratingReviewService.updateReview(id, data);
      const review = response.data?.review || null;

      const currentProductId = get().currentProductId;
      if (review?.product_id && currentProductId === review.product_id) {
        await get().fetchProductReviews(review.product_id);
      } else {
        set({ isLoading: false, currentReview: review });
      }
      await get().fetchMyReviews();

      return review;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to update review',
        isLoading: false,
      });
      return null;
    }
  },

  deleteReview: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await ratingReviewService.deleteReview(id);

      const currentProductId = get().currentProductId;
      if (currentProductId) {
        await get().fetchProductReviews(currentProductId);
      } else {
        set({ isLoading: false });
      }
      await get().fetchMyReviews();

      set((state) => ({
        currentReview: state.currentReview?.id === id ? null : state.currentReview,
      }));

      return true;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Failed to delete review',
        isLoading: false,
      });
      return false;
    }
  },

  clearCurrentReview: () => set({ currentReview: null }),
  clearError: () => set({ error: null }),
}));
