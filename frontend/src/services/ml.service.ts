import mlApi from "@/services/mlApi";

export type MlSupplierRecommendation = {
  seller_id: string;
  name?: string;
  city?: string;
  state?: string;
  recommendation_score: number;
  product_count?: number;
};

export type MlRecommendMeta = {
  personalization?: { retailer_id?: boolean; product_id?: boolean };
  filters?: { seller_state?: boolean; product_category_name?: boolean };
  candidates?: { before_filters?: number; after_filters?: number };
  scoring?: { strategy?: string; cold_start_rows?: number; ml_rows?: number };
};

export type MlRecommendRequest = {
  top_k?: number;
  retailer_id?: string | null;
  product_id?: string | null;
  seller_state?: string | null;
  product_category_name?: string | null;
};

export type MlRecommendResponse = {
  recommendations: MlSupplierRecommendation[];
  meta?: MlRecommendMeta;
};

class MlService {
  async recommendSuppliers(payload: MlRecommendRequest): Promise<MlRecommendResponse> {
    const res = await mlApi.post<MlRecommendResponse>("/recommend-supplier", payload);
    return res.data;
  }
}

export const mlService = new MlService();
export default mlService;
