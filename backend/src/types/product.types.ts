export interface IProduct {
  id: string;
  supplier_id: string;
  name: string;
  category: string;
  sku: string;
  description: string;
  pickup_location: string;
  specifications?: Record<string, string> | null;
  price: number;
  stock_quantity: number;
  min_order_amount: number;
  unit_type: string;
  images?: any; // JSON field
  is_available: boolean;
  rating: number;
  review_count?: number;
  delivery_available?: boolean;
  delivery_pricing?: 'free' | 'paid' | null;
  delivery_fee_per_km?: number | null;
  free_delivery_max_distance_km?: number | null;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface IProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  supplier_id?: string;
  search?: string;
  exclude_supplier_id?: string;
  is_available?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface IProductResponse {
  id: string;
  supplier_id: string;
  name: string;
  category: string;
  sku: string;
  description: string;
  pickup_location: string;
  specifications?: Record<string, string> | null;
  price: number;
  stock_quantity: number;
  min_order_amount: number;
  unit_type: string;
  images?: any;
  is_available: boolean;
  rating: number;
  review_count?: number;
  delivery_available?: boolean;
  delivery_pricing?: 'free' | 'paid' | null;
  delivery_fee_per_km?: number | null;
  free_delivery_max_distance_km?: number | null;
  supplier_name?: string;
  supplier_business?: string;
}
