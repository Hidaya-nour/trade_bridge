import api from "@/lib/api";

export interface CreateReviewPayload {
  product_id: string;
  rating: number;
  comment?: string;
}

const reviewService = {
  async createReview(data: CreateReviewPayload) {
    const response = await api.post("/reviews", data);
    return response.data;
  },
};

export default reviewService;
