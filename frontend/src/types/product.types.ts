// ============================================================================
// Product Types - Matching Your Backend Schema
// ============================================================================

import type { Address } from "./address.types";

export interface Product {
  id: string;
  supplier_id: string;
  name: string;
  category: string;
  sku:string;
  description: string;
  pickup_location?: string;
  specifications?: Record<string, string> | null;
  price: number;
  stock_quantity: number;
  min_order_amount: number;
  unit_type: string;
  images: string[];
  is_available: boolean; 
  rating: number;
  review_count:number;
  delivery_available?: boolean;
  delivery_pricing?: "free" | "paid" | null;
  delivery_fee_per_km?: number | null;
  free_delivery_max_distance_km?: number | null;
  reviews?: ReviewItem[];  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  
  
  supplier?: {
    id: string;
    full_name: string;
    business_name?: string;
    email?: string;
    phone?: string;
    role?: "retailer" | "distributor" | "factory" | "driver" | "admin";
    is_vat_registered?: boolean;
    vat_rate?: number;
    rating?:number;
    created_at?:Date;
    is_verified?: boolean;
    addresses?: Address[];
  };
}

export interface ReviewItem {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  updated_at: string;
}
export type CatalogRole = "retailer" | "distributor";

export interface CatalogProduct {
  id: string;
  name: string;
  sku?: string;
  supplier_id: string;
  supplier_name: string;
  supplier?: {
    id: string;
    business_name?: string;
    full_name?: string;
    role?: "retailer" | "distributor" | "factory" | "driver" | "admin";
    is_vat_registered?: boolean;
    vat_rate?: number;
    is_verified?: boolean;
    addresses?: Address[];
  };
  supplier_type?: "factory" | "distributor";
  category: string;
  subcategory?: string;
  price: number;
  original_price?: number;
  unit: string;
  min_order_amount: number;
  max_order_amount?: number;
  stock_quantity?: number;
  rating: number;
  review_count: number;
  reviews?: {
      id: string;
      user: string;
      comment: string;
  }
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  description: string;
  tags: string[];
  image?: string | null;
  images?: string[];
  volume_discount?: string;
  lead_time?: string;
  payment_terms?: string[];
  delivery_available?: boolean;
  delivery_pricing?: "free" | "paid" | null;
  delivery_fee_per_km?: number | null;
  free_delivery_max_distance_km?: number | null;
  promotion_ends_at?: string | null;
  promotion_label?: string | null;
}

export interface CatalogConfig {
  role: CatalogRole;
  title: string;
  description: string;
  supplierLabel: string;
  supplierPath: string;
  icon: React.ElementType;
  categories: string[];
  locations: string[];
  showVolumeDiscount: boolean;
  cartPath: string;
  ordersPath: string;
  productsPath: string;
  continueShoppingPath: string;
  vatPercentage?: number;
  bulkDiscountPercentage?: number;
  shippingCostPerSupplier?: number;
  bulkDiscountThreshold?: number;
}
// ============================================================================
// Filter Types
// ============================================================================

export interface ProductFilters {
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

// ============================================================================
// API Response Types
// ============================================================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface ProductResponse {
  success: boolean;
  data: {
    product: Product;
  };
}

export interface CategoriesResponse {
  success: boolean;
  data: {
    categories: string[];
  };
}

// ============================================================================
// Create/Update Types
// ============================================================================

export interface CreateProductData {
  name: string;
  category: string;
  description?: string;
  specifications?: Record<string, string> | null;
  price: number;
  stock_quantity: number;
  min_order_amount: number;
  unit_type: string;
  images?: string[];
  is_available?: boolean;
  delivery_available?: boolean;
  delivery_pricing?: "free" | "paid" | null;
  delivery_fee_per_km?: number | null;
  free_delivery_max_distance_km?: number | null;
}

export interface UpdateProductData extends Partial<CreateProductData> {
  // All fields are optional for updates
}

// ============================================================================
// Stock Management Types
// ============================================================================

export interface StockUpdateData {
  quantity: number;
}

export interface StockUpdateResponse {
  success: boolean;
  data: {
    productId: string;
    stock_quantity: number;
  };
}

// ============================================================================
// Availability Types
// ============================================================================

export interface AvailabilityToggleResponse {
  success: boolean;
  data: {
    productId: string;
    is_available: boolean;
  };
}

// ============================================================================
// Form Types (for React Hook Form)
// ============================================================================

export interface ProductFormData {
  name: string;
  category: string;
  description: string;
  price: number;
  stock_quantity: number;
  min_order_amount: number;
  unit_type: string;
  images?: string[];
  is_available: boolean;
  delivery_available: boolean;
  delivery_pricing: "free" | "paid" | null;
  delivery_fee_per_km?: number | null;
  free_delivery_max_distance_km?: number | null;
}

// ============================================================================
// Store State Types
// ============================================================================

export interface ProductStoreState {
  // Data
  products: Product[];
  totalProducts: number;
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: ProductFilters;
  categories: string[];
  
  // Actions
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchCategories: () => Promise<void>;
  createProduct: (data: CreateProductData) => Promise<Product | null>;
  updateProduct: (id: string, data: UpdateProductData) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  updateStock: (id: string, quantity: number) => Promise<boolean>;
  toggleAvailability: (id: string) => Promise<boolean>;
  setFilters: (filters: ProductFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface ProductCardProps {
  product: Product;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddToCart?: (product: Product) => void;
  showActions?: boolean;
  className?: string;
}

export interface ProductGridProps {
  products: Product[];
  loading?: boolean;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onAddToCart?: (product: Product) => void;
  showActions?: boolean;
  emptyMessage?: string;
}

export interface ProductFiltersProps {
  categories: string[];
  onFilterChange: (filters: ProductFilters) => void;
  initialFilters?: ProductFilters;
  className?: string;
}

export interface ProductFormProps {
  initialData?: Partial<ProductFormData>;
  onSubmit: (data: ProductFormData) => Promise<void>;
  onCancel?: () => void;
  isLoading?: boolean;
}

// ============================================================================
// Product Detail Types (UI)
// ============================================================================

export type ProductDetailRole = "retailer" | "distributor" | "factory";

export interface ProductDetailData {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  original_price?: number;
  promotion_label?: string | null;
  promotion_ends_at?: string | null;
  unit_type: string;
  min_order_amount: number;
  maxOrder?: number;
  stock_quantity: number;
  reserved?: number;
  is_available?: boolean;
  description: string;
  specifications?: Record<string, string> | null;
  images?: string[];
  created_at: string;
  updated_at: string;
  pickup_location?: string;
  supplierId?: string;
  supplierName?: string;
  supplierType?: "factory" | "distributor";
  supplierRating?: number;
  supplierVerified?: boolean;
  supplierLocation?: string;
  supplierEstablished?: Date;
  productionTime?: string;
  batchSize?: number;
  rawMaterials?: { name: string; quantity: number; unit: string }[];
  deliveryOptions?: {
    offered: boolean;
    cost?: number;
    freeThreshold?: number;
    estimatedDays: string;
    pickupAvailable: boolean;
  };
  bulkDiscounts?: {
    quantity: number;
    discount: number;
  }[];
  rating: number;
  review_count: number;
  reviews?: {
    id: string;
    user: string;
    rating: number;
    comment: string;
    date: string;
  }[];
  relatedProducts?: {
    id: number;
    name: string;
    price: number;
    unit: string;
    rating: number;
  }[];
}

export interface ProductDetailProps {
  role: ProductDetailRole;
  product: ProductDetailData;
  onAddToCart: (quantity: number) => void;
  cartQuantity?: number;
  onSetCartQuantity?: (quantity: number) => void;
  onViewSupplier?: () => void;
  onCompare?: () => void;
}
