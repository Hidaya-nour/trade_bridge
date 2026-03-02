export interface IProduct {
  id: string;
  supplier_id: string;
  name: string;
  category: string;
    sku: string; 
  description: string;
  specifications?: string;
  price: number;
  stock_quantity: number;
  min_order_amount: number;
  unit_type: string;
  images?: any; // JSON field
  is_available: boolean;
  rating?: number;
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
  price: number;
  stock_quantity: number;
  min_order_amount: number;
  unit_type: string;
  images?: any;
  is_available: boolean;
  supplier_name?: string;
  supplier_business?: string;
}