import { type Product, type ProductSupplier } from "./product.types";

export interface CartItem {
  id: string;
  cart_id: string;
  product_id: string;
  quantity: number;
  created_at: string;
  updated_at: string;
  product?: Product;
  supplier?: ProductSupplier;
}

export interface Cart {
  id: string | null;
  user_id: string;
  items: CartItem[];
  total_items: number;
  original_total: number;
  discount_total: number;
  final_total: number;
  applied_promotions: string[];
  created_at: string | null;
  updated_at: string | null;
}

