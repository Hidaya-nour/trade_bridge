export type OrderStatus =
  | "pending"
  | "approved"
  | "processing"
  | "shipped"
  | "delivered"
  | "closed"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "refunded";

export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "delivered"
  | "failed"
  | "cancelled";

export interface OrderParty {
  id: string;
  full_name: string;
  business_name?: string;
  email?: string;
  phone?: string;
  tin_number?: string;
}

export interface OrderItem {
  id: string;
  order_id?: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: {
    id: string;
    name: string;
    sku?: string;
    category?: string;
    unit_type?: string;
    images?: string[];
    stock_quantity?: number;
  };
}

export interface OrderPayment {
  id: string;
  order_id: string;
  payment_method: string;
  total_amount: number;
  amount_paid: number;
  payment_status: PaymentStatus;
  chapa_payment_url?: string;
  proof_document_id?: string;
  notes?: string;
  payment_date?: string;
  proofDocument?: {
    id: string;
    file_secure_url?: string;
    original_file_name?: string;
  };
}

export interface OrderDelivery {
  id: string;
  order_id: string;
  driver_id?: string;
  pickup_location: string;
  dropoff_location: string;
  status: DeliveryStatus;
  started_at?: string;
  completed_at?: string;
  driver?: {
    id?: string;
    full_name?: string;
    phone?: string;
    driverUser?: {
      id?: string;
      full_name?: string;
      phone?: string;
      email?: string;
    };
  };
}

export interface CreateOrderPayload {
  supplier_id: string;
  items: Array<{
    product_id: string;
    quantity: number;
    unit_price?: number;
  }>;
  payment_method?: string;
  delivery_address?: string;
  delivery_option?: string;
  notes?: string;
  total_price?: number;
  shipping_cost?: number;
  tax_amount?: number;
  discount_amount?: number;
}

export interface OrderFilters {
  status?: OrderStatus;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}

export interface Order {
  id: string;
  buyer_id: string;
  supplier_id: string;
  total_price: number;
  order_status: OrderStatus;
  created_at: string;
  updated_at?: string;
  supplier?: OrderParty;
  buyer?: OrderParty;
  items?: OrderItem[];
  payment?: OrderPayment;
  delivery?: OrderDelivery;
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

