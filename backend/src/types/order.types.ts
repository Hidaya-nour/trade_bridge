// ============================================================================
// Order Status Types
// ============================================================================

// ============================================================================
// Order Status Types
// ============================================================================

export type OrderStatus = 
  | 'pending' 
  | 'approved' 
  | 'processing' 
  | 'shipped' 
  | 'delivered' 
  | 'closed'
  | 'cancelled';

export type PaymentStatus = 
  | 'pending' 
  | 'processing' 
  | 'completed' 
  | 'failed' 
  | 'refunded';

export type DeliveryStatus = 
  | 'pending' 
  | 'assigned' 
  | 'picked_up' 
  | 'in_transit' 
  | 'delivered' 
  | 'failed' 
  | 'cancelled';
// ============================================================================
// Order Interface (Matches your schema)
// ============================================================================

export interface IOrder {
  id: string;
  buyer_id: string;
  supplier_id: string;
  total_price: number;
  delivery_fee: number;
  order_status: OrderStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface IOrderItems {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// ============================================================================
// Order with Relations (for API responses)
// ============================================================================

export interface OrderWithDetails extends IOrder {
  buyer?: {
    id: string;
    full_name: string;
    email: string;
    business_name?: string;
  };
  supplier?: {
    id: string;
    full_name: string;
    business_name?: string;
  };
  items?: OrderItemWithProduct[];
  payment?: IPayment;
  delivery?: IDelivery;
}

export interface OrderItemWithProduct extends IOrderItems {
  product?: {
    id: string;
    name: string;
    category: string;
    unit_type: string;
    images?: string[];
  };
}

// ============================================================================
// Payment Interface
// ============================================================================

export interface IPayment {
  id: string;
  order_id: string;
  payment_method:  'mobile_banking' | 'chapa';
  total_amount: number;
  amount_paid: number;
  payment_status: PaymentStatus;
  cheque_number?: string;
  cheque_bank?: string;
  cheque_date?: Date;
  cheque_status?: string;
  chapa_transaction_id?: string;
  chapa_payment_url?: string;
  proof_document_id?: string;
  refund_amount?: number;
  refund_reason?: string;
  refund_date?: Date;
  refunded_by?: string;
  payment_date?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

// ============================================================================
// Delivery Interface
// ============================================================================

export interface IDelivery {
  id: string;
  order_id: string;
  driver_id?: string;
  pickup_location: string;
  dropoff_location: string;
  status: 'pending' | 'assigned' | 'picked_up' | 'in_transit' | 'delivered' | 'failed' | 'cancelled';
  started_at?: Date;
  completed_at?: Date;
  notes?: string;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date;
}

export interface IDeliveryEvent {
  id: string;
  delivery_id: string;
  event_type: string;
  latitude?: number;
  longitude?: number;
  note?: string;
  created_at: Date;
}

// ============================================================================
// Create Order DTOs
// ============================================================================

export interface CreateOrderItemDTO {
  product_id: string;
  quantity: number;
}

export interface CreateOrderDTO {
  supplier_id: string;
  items: CreateOrderItemDTO[];
  payment_method?: string;
  delivery_address?: string;
  notes?: string;
}

export interface UpdateOrderStatusDTO {
  status: OrderStatus;
  notes?: string;
}

// ============================================================================
// Order Filters
// ============================================================================

export interface OrderFilters {
  buyer_id?: string;
  supplier_id?: string;
  status?: OrderStatus;
  from_date?: string;
  to_date?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// ============================================================================
// API Response Types
// ============================================================================

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: OrderWithDetails[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface OrderResponse {
  success: boolean;
  data: {
    order: OrderWithDetails;
  };
}

// ============================================================================
// Order Summary Types
// ============================================================================

export interface OrderSummary {
  id: string;
  order_number?: string;
  buyer_name: string;
  supplier_name: string;
  total_items: number;
  total_price: number;
  status: OrderStatus;
  created_at: Date;
  payment_status?: string;
  delivery_status?: string;
}

export interface OrderReceiptItem {
  product_id: string;
  product_name: string;
  unit_type: string;
  quantity: number;
  unit_price: number;
  line_total: number;
}

export interface OrderReceipt {
  receipt_number: string;
  receipt_status: 'draft' | 'final';
  issued_at: string;
  order_id: string;
  order_date: string;
  buyer: {
    id: string;
    name: string;
    business_name?: string;
    tin_number?: string;
  };
  supplier: {
    id: string;
    name: string;
    business_name?: string;
    tin_number?: string;
  };
  payment: {
    method: string;
    status: string;
    amount_paid: number;
    payment_date?: string;
  };
  currency: 'ETB';
  subtotal: number;
  shipping: number;
  discount: number;
  tax: number;
  total: number;
  items: OrderReceiptItem[];
}

export interface OrderReceiptVerification {
  valid: boolean;
  receipt_number: string;
  receipt_status: 'draft' | 'final';
  order_id: string;
  order_status: OrderStatus;
  order_date: string;
  issued_at: string;
  buyer_name: string;
  supplier_name: string;
  total: number;
  payment_status: string;
}
