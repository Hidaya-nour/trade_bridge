export type OrderStatus =
  | "pending"
  | "approved"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderParty {
  id: string;
  full_name: string;
  business_name?: string;
}

export interface OrderItem {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  buyer_id: string;
  supplier_id: string;
  total_price: number;
  order_status: OrderStatus;
  created_at: string;
  supplier?: OrderParty;
  buyer?: OrderParty;
  items?: OrderItem[];
}

export interface OrderStats {
  total_orders: number;
  pending_count: number;
  approved_count: number;
  processing_count: number;
  shipped_count: number;
  delivered_count: number;
  cancelled_count: number;
  total_spent: number;
  order_growth: number;
  spent_growth: number;
}

export interface MyOrdersResult {
  orders: Order[];
  total: number;
  page: number;
  totalPages: number;
}

