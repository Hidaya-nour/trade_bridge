export interface ICart {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
}

export interface CartItemWithProduct extends ICartItem {
  product?: {
    id: string;
    name: string;
    price: number;
    unit_type: string;
    images?: any;
    supplier_id: string;
    is_available: boolean;
    stock_quantity: number;
    min_order_amount: number;
  };
}

export interface ICart {
  id: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}

export interface ICartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
}

export interface CartItemWithProduct extends ICartItem {
  product?: {
    id: string;
    name: string;
    price: number;
    unit_type: string;
    images?: any;
    supplier_id: string;
    is_available: boolean;
    stock_quantity: number;
    min_order_amount: number;
  };
}

export interface CartWithItems {
  id: string;
  user_id: string;
  items: CartItemWithProduct[];
  total_items: number;
  original_total: number;
  discount_total: number;
  final_total: number;
  applied_promotions?: any[]; // Will be defined when promotions are implemented
  created_at: Date;
  updated_at: Date;
}

export interface AddToCartDTO {
  product_id: string;
  quantity: number;
}

export interface UpdateCartItemDTO {
  quantity: number;
}