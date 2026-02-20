// ============================================================================
// Cart Types - Matching Your Schema
// ============================================================================

export interface Cart {
  id: string; // CHAR(36)
  user_id: string; // CHAR(36) FK
  created_at: string; // TIMESTAMP
  updated_at: string; // TIMESTAMP
}

export interface CartItem {
  id: string; // CHAR(36)
  cart_id: string; // CHAR(36) FK
  product_id: string; // CHAR(36) FK
  quantity: number; // INT
  created_at?: string;
  updated_at?: string;
  
  // Relations (joined data)
  product?: {
    id: string;
    name: string;
    price: number;
    images?: string[];
    supplier_id: string;
    supplier?: {
      id: string;
      business_name?: string;
      full_name: string;
    };
    unit_type: string;
    min_order_amount: number;
  };
}

// ============================================================================
// Cart API Types
// ============================================================================

export interface CartResponse {
  success: boolean;
  data: {
    cart: Cart;
    items: CartItem[];
    total_items: number;
    total_price: number;
  };
}

export interface AddToCartData {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemData {
  quantity: number;
}

// ============================================================================
// Cart Store State
// ============================================================================

export interface CartStoreState {
  cart: Cart | null;
  items: CartItem[];
  currentItem: CartItem | null;
  totalItems: number;
  totalPrice: number;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchCart: () => Promise<void>;
  addToCart: (productId: string, quantity: number) => Promise<CartItem | null>;
  updateQuantity: (itemId: string, quantity: number) => Promise<CartItem | null>;
  removeFromCart: (itemId: string) => Promise<boolean>;
  clearCart: () => Promise<boolean>;
  clearError: () => void;
}