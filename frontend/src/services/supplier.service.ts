// services/supplier.service.ts
import type { ApiResponse } from '@/types/product.types';
import api from './api';

export interface PublicSupplier {
  id: string;
  business_name: string;
  full_name?: string;
  role: 'factory' | 'distributor';
  is_vat_registered?: boolean;
  vat_rate?: number;
  country?: string;
  profile_image?: string;
  is_verified: boolean;
  total_products: number;
  total_orders: number;
  joined_date: string;
  payment_terms?: string[];
  delivery_options?: string[];
  created_at: string;
  updated_at: string;
}

export interface SupplierProduct {
  id: string;
  name: string;
  category: string;
  price: number;
  unit_type: string;
  min_order_amount: number;
  stock_quantity: number;
  images: string[];
  rating: number;
  review_count: number;
  is_available: boolean;
  created_at: string;
}

export interface SupplierStats {
  total_products: number;
  total_orders: number;
  total_revenue: number;
  average_rating: number;
  fulfillment_rate: number;
  response_time: string;
  joined_date: string;
  monthly_sales: {
    month: string;
    orders: number;
    revenue: number;
  }[];
  top_products: {
    id: string;
    name: string;
    sales: number;
    revenue: number;
  }[];
}

export interface SupplierReview {
  id: string;
  user_id: string;
  user_name: string;
  rating: number;
  comment: string;
  date: string;
  helpful_count: number;
  verified_purchase: boolean;
}

export interface SupplierAddressSummary {
  id: string;
  region: string;
  city: string;
  subcity?: string | null;
  common_name?: string | null;
}

export interface SupplierListItem {
  id: string;
  business_name?: string;
  full_name?: string;
  role?: 'factory' | 'distributor';
  verified?: boolean;
  profile_image?: string;
  created_at?: string;
  addresses?: SupplierAddressSummary[];
}

export interface SearchSuppliersParams {
  query?: string;
  category?: string;
  min_rating?: number;
  is_verified?: boolean;
  page?: number;
  limit?: number;
  sort_by?: 'rating' | 'orders' | 'joined_date';
  sort_order?: 'asc' | 'desc';
}

export interface SuppliersResponse {
  suppliers: PublicSupplier[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SupplierProductsResponse {
  products: SupplierProduct[];
  total: number;
  page: number;
  totalPages: number;
}

export interface SupplierReviewsResponse {
  reviews: SupplierReview[];
  total: number;
  average_rating: number;
  total_reviews: number;
}

class SupplierService {
  private readonly BASE_PATH = '/suppliers';

  /**
   * Get supplier by ID
   */
  async getSupplierById(supplierId: string): Promise<ApiResponse<{ supplier: PublicSupplier }>> {
    try {
      const response = await api.get(`${this.BASE_PATH}/${supplierId}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Get multiple suppliers by IDs
   */
  async getSuppliersByIds(supplierIds: string[]): Promise<ApiResponse<{ suppliers: PublicSupplier[] }>> {
    try {
      const response = await api.post(`${this.BASE_PATH}/batch`, { supplierIds });
      return response.data;
    } catch (error) {
      console.error('Error fetching suppliers batch:', error);
      throw error;
    }
  }

  /**
   * Get supplier products
   */
  async getSupplierProducts(
    supplierId: string,
    params: {
      page?: number;
      limit?: number;
      category?: string;
      is_available?: boolean;
      sort_by?: 'price' | 'rating' | 'created_at';
      sort_order?: 'asc' | 'desc';
    } = {}
  ): Promise<ApiResponse<SupplierProductsResponse>> {
    try {
      const response = await api.get(`${this.BASE_PATH}/${supplierId}/products`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          category: params.category,
          is_available: params.is_available,
          sort_by: params.sort_by,
          sort_order: params.sort_order,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching products for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Get supplier statistics
   */
  async getSupplierStats(supplierId: string): Promise<ApiResponse<{ stats: SupplierStats }>> {
    try {
      const response = await api.get(`${this.BASE_PATH}/${supplierId}/stats`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching stats for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Get supplier reviews
   */
  async getSupplierReviews(
    supplierId: string,
    params: {
      page?: number;
      limit?: number;
      rating?: number;
      sort_by?: 'date' | 'rating' | 'helpful';
    } = {}
  ): Promise<ApiResponse<SupplierReviewsResponse>> {
    try {
      const response = await api.get(`${this.BASE_PATH}/${supplierId}/reviews`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 10,
          rating: params.rating,
          sort_by: params.sort_by,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching reviews for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Search suppliers
   */
  async searchSuppliers(params: SearchSuppliersParams = {}): Promise<ApiResponse<SuppliersResponse>> {
    try {
      const response = await api.get(`${this.BASE_PATH}/search`, {
        params: {
          query: params.query,
          category: params.category,
          min_rating: params.min_rating,
          is_verified: params.is_verified,
          page: params.page || 1,
          limit: params.limit || 20,
          sort_by: params.sort_by,
          sort_order: params.sort_order,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw error;
    }
  }

  /**
   * Get top rated suppliers
   */
  async getTopSuppliers(limit: number = 10): Promise<ApiResponse<{ suppliers: PublicSupplier[] }>> {
    try {
      const response = await api.get(`${this.BASE_PATH}/top`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching top suppliers:', error);
      throw error;
    }
  }

  /**
   * Get all suppliers (directory)
   */
  async getAllSuppliers(): Promise<ApiResponse<{ suppliers: SupplierListItem[] }>> {
    try {
      const response = await api.get(`${this.BASE_PATH}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching all suppliers:', error);
      throw error;
    }
  }

  /**
   * Get suppliers by category
   */
  async getSuppliersByCategory(
    category: string,
    params: {
      page?: number;
      limit?: number;
      min_rating?: number;
    } = {}
  ): Promise<ApiResponse<SuppliersResponse>> {
    try {
      const response = await api.get(`${this.BASE_PATH}/category/${category}`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          min_rating: params.min_rating,
        },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching suppliers in category ${category}:`, error);
      throw error;
    }
  }

  /**
   * Get suppliers by location
   */
  // async getSuppliersByLocation(
  //   params: {
  //     page?: number;
  //     limit?: number;
  //     category?: string;
  //     min_rating?: number;
  //   } = {}
  // ): Promise<ApiResponse<SuppliersResponse>> {
  //   try {
  //     const response = await api.get(`${this.BASE_PATH}/location/${city}`, {
  //       params: {
  //         page: params.page || 1,
  //         limit: params.limit || 20,
  //         category: params.category,
  //         min_rating: params.min_rating,
  //       },
  //     });
  //     return response.data;
  //   } catch (error) {
  //     console.error(`Error fetching suppliers in ${city}:`, error);
  //     throw error;
  //   }
  // }

  /**
   * Get verified suppliers
   */
  async getVerifiedSuppliers(params: {
    page?: number;
    limit?: number;
    category?: string;
  } = {}): Promise<ApiResponse<SuppliersResponse>> {
    try {
      const response = await api.get(`${this.BASE_PATH}/verified`, {
        params: {
          page: params.page || 1,
          limit: params.limit || 20,
          category: params.category,
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching verified suppliers:', error);
      throw error;
    }
  }

  /**
   * Check if supplier is available/active
   */
  async checkSupplierAvailability(supplierId: string): Promise<ApiResponse<{ is_available: boolean }>> {
    try {
      const response = await api.get(`${this.BASE_PATH}/${supplierId}/availability`);
      return response.data;
    } catch (error) {
      console.error(`Error checking availability for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Get supplier payment terms
   */
  async getSupplierPaymentTerms(supplierId: string): Promise<ApiResponse<{ payment_terms: string[] }>> {
    try {
      const response = await api.get(`${this.BASE_PATH}/${supplierId}/payment-terms`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching payment terms for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Get delivery options
   */
  async getSupplierDeliveryOptions(supplierId: string): Promise<ApiResponse<{ delivery_options: string[] }>> {
    try {
      const response = await api.get(`${this.BASE_PATH}/${supplierId}/delivery-options`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching delivery options for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Check whether the current user can review this supplier
   */
  async getReviewEligibility(
    supplierId: string,
  ): Promise<ApiResponse<{ can_review: boolean }>> {
    try {
      const response = await api.get(
        `${this.BASE_PATH}/${supplierId}/review-eligibility`,
      );
      return response.data;
    } catch (error) {
      console.error(`Error checking review eligibility for ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Submit a review for a supplier
   */
  async submitReview(
    supplierId: string,
    data: { rating: number; comment: string }
  ): Promise<ApiResponse<{ review: SupplierReview }>> {
    try {
      const response = await api.post(`${this.BASE_PATH}/${supplierId}/reviews`, data);
      return response.data;
    } catch (error) {
      console.error(`Error submitting review for supplier ${supplierId}:`, error);
      throw error;
    }
  }

  /**
   * Mark a review as helpful
   */
  async markReviewHelpful(supplierId: string, reviewId: string): Promise<ApiResponse<{ success: boolean }>> {
    try {
      const response = await api.post(`${this.BASE_PATH}/${supplierId}/reviews/${reviewId}/helpful`);
      return response.data;
    } catch (error) {
      console.error(`Error marking review ${reviewId} as helpful:`, error);
      throw error;
    }
  }

  /**
   * Get similar suppliers (for recommendations)
   */
  async getSimilarSuppliers(
    supplierId: string,
    limit: number = 5
  ): Promise<ApiResponse<{ suppliers: PublicSupplier[] }>> {
    try {
      const response = await api.get(`${this.BASE_PATH}/${supplierId}/similar`, {
        params: { limit },
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching similar suppliers for ${supplierId}:`, error);
      throw error;
    }
  }
}

export const supplierService = new SupplierService();
export default supplierService;
