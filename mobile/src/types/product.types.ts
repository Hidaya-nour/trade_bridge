export interface ProductSupplier {
  id: string;
  full_name: string;
  business_name?: string;
  email?: string;
  phone?: string;
  rating?: number;
  is_verified?: boolean;
  created_at?: string;
}

export interface ProductReview {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  supplier_id: string;
  name: string;
  sku?: string;
  category: string;
  description: string;
  specifications?: Record<string, unknown> | string | null;
  price: number;
  stock_quantity: number;
  min_order_amount: number;
  unit_type: string;
  images?: string[];
  is_available: boolean;
  rating?: number;
  review_count?: number;
  reviews?: ProductReview[];
  created_at: string;
  updated_at: string;
  supplier?: ProductSupplier;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  supplier_id?: string;
  search?: string;
  is_available?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface ProductsPayload {
  products: Product[];
  total: number;
  page: number;
  totalPages: number;
}

