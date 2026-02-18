export interface IProduct {
  id: string;
  supplier_id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  stock_quantity: number;
  min_order_amount: number;
  unit_type: string;
  images?: any; // JSON field
  is_available: number; // TINYINT(1) - 0 or 1
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
  description: string;
  price: number;
  stock_quantity: number;
  min_order_amount: number;
  unit_type: string;
  images?: any;
  is_available: boolean;
  supplier_name?: string;
  supplier_business?: string;
}