// types/cart.types.ts
export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    name: string;
    price: number;
    unit_type: string;
    min_order_amount: number;
    stock_quantity: number;
    images: string[];
    supplier?: {
      id: string;
      business_name: string;
      full_name: string;
      is_verified: boolean;
      rating: number;
    };
  };
}

export interface Cart {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  items?: CartItem[];
}

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

// Extended CartItem for UI with selected state
export interface CartItemWithSelection extends CartItem {
  selected: boolean;
  shippingCost?: number; // This might come from supplier or product
}

export interface SupplierGroup {
  supplierId: string;
  supplierName: string;
  supplierVerified: boolean;
  items: CartItemWithSelection[];
  subtotal: number;
  shipping: number;
}