// ============================================================================
// Product Types - Matching Your Backend Schema
// ============================================================================

export interface Product {
  id: string;
  supplier_id: string;
  name: string;
  category: string;
  sku:string;
  description: string;
  specifications?: Record<string, string> | null;
  price: number;
  stock_quantity: number;
  min_order_amount: number;
  unit_type: string;
  images: string[];
  is_available: boolean; 
  rating: number;
  review_count:number;
  reviews?: ReviewItem[];  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
  
  
  // Joined data (optional)
  supplier?: {
    id: string;
    full_name: string;
    business_name?: string;
    email?: string;
    phone?: string;
    rating?:number;
    created_at?:Date;
    is_verified?: boolean;
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
export interface CatalogProduct {
  id: string ;
  name: string;
  supplier: string;
  supplierId: string;
  supplierName?: string; // Alias for supplier
  price: number;
  category: string;
  image: string;
  rating: number;
  reviews: number;
  location: string;
  minOrder: number;
  unit: string;
  description: string;
  stock: number;
  isAvailable: boolean;
  deliveryTime?: string;
  tags?: string[];
}

export interface CatalogConfig {
  role: 'retailer' | 'distributor' | 'factory';
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
  price: number;
  stock_quantity: number;
  min_order_amount: number;
  unit_type: string;
  images?: string[];
  is_available?: boolean;
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