// ============================================================================
// Order Types
// ============================================================================

import type { User } from "@/stores/auth.store";
import type { Product } from "./product.types";

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

  export type OrderParty = {
    id: number | string;
    name: string;
    contact?: string;
    phone?: string;
    email?: string;
    location?: {
      region:string;
      city:string;
      latitude:number;
      longitude:number
    };
    rating?: number;
    verified?: boolean;
    previousOrders?: number;
  };
export type DeliveryStatus = 
  | 'pending' 
  | 'assigned' 
  | 'picked_up' 
  | 'delivered' 
  | 'failed' 
  | 'cancelled';

// ============================================================================
// Order Interfaces
// ============================================================================

export interface Order {
  id: string;
  buyer_id: string;
  supplier_id: string;
  total_price: number;
  order_status: OrderStatus;
  created_at: string;
  updated_at: string;
  buyer?: {
    id: string;
    full_name: string;
    business_name?: string;
    phone?: string;
  };
  supplier?: {
    user: User;
    id: string;
    full_name: string;
    business_name?: string;
  };
  items?: OrderItem[];
  payment?: Payment;
  delivery?: Delivery;
  driver?: OrderDriver;
  products?: Product[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  product?: Product;

}

export type OrderTimelineItem = {
  status: string;
  date?: string | null;
  completed: boolean;
};
export type OrderDriver = {
  id: number | string;
  name: string;
  vehicle?: string;
  available?: boolean;
  phone?: string;
};
export type OrderDelivery = {
  deliveryId?: string;
  address: string;
  pickupLocation?: string;
  recipient: string;
  phone: string;
  requestedDate?: string;
  estimatedDate?: string;
  actualDate?: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  status?: DeliveryStatus | string | null;
  driverId?: number | string | null;
  driverUserId?: number | string | null;
  driverName?: string | null;
  driverPhone?: string | null;
};

// UI-focused order details types
export type OrderDetailsPaymentStatus =
  | "pending"
  | "approved"
  | "paid"
  | "refunded";

export type OrderDetailsItem = {
  id: number | string;
  productId?: string;
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
  stockAvailable?: number;
  image?: string | null;
};

export type OrderDetailsData = {
  id: string;
  orderDate: string;
  status: OrderStatus;
  paymentStatus: OrderDetailsPaymentStatus;
  paymentMethod: string;
  paymentTerms: string;
  paymentId?: string;
  paymentAmount?: number;
  paymentPaid?: number;
  paymentProofUrl?: string;
  paymentProofName?: string;
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  notes?: string;
  invoice?: string;
  items: OrderDetailsItem[];
  timeline: OrderTimelineItem[];
  delivery: OrderDelivery;
  party: OrderParty;
  drivers?: OrderDriver[];
  canAssignDriver?: boolean;
  canCancel?: boolean;
  canReview?: boolean;
  canReorder?: boolean;
};

export type OrderDetailsLinks = {
  party?: (id: number | string) => string;
  product?: (id: number | string) => string;
  reorder?: (orderId: string) => string;
  message?: (partyId: number | string) => string;
};

export type OrderRole = "distributor" | "factory";

export interface IncomingOrderItem {
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

export interface IncomingOrder {
  id: string;
  deliveryId?: string;
  customerId: number;
  customerName: string;
  customerContact: string;
  customerPhone: string;
  customerLocation: string;
  orderDate: string;
  requestedDelivery: string;
  items: IncomingOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status:
    | "pending"
    | "processing"
    | "approved"
    | "shipped"
    | "delivered"
    | "closed"
    | "cancelled";
  paymentId?: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentAmount?: number;
  paymentPaid?: number;
  paymentProofUrl?: string;
  paymentProofName?: string;
  notes?: string;
  trackingNumber?: string;
  driver?: string;
  driverPhone?: string;
  driverId?: number | string;
  deliveredDate?: string;
  cancelledDate?: string;
  cancellationReason?: string;
  customerRating: number | null;
  previousOrders: number;
}

export interface IncomingOrdersConfig {
  role: OrderRole;
  title: string;
  description: string;
  customerLabel: string;
  customerPath: string;
  icon: React.ElementType;
  stats: {
    pending: number;
    processing: number;
    approved: number;
    totalRevenue: number;
  };
}
export interface Payment {
  id: string;
  order_id: string;
  payment_method: string;
  total_amount: number;
  amount_paid: number;
  payment_status: PaymentStatus;
  payment_date?: string;
}

export interface Delivery {
  id: string;
  order_id: string;
  driver_id?: string;
  pickup_location: string;
  dropoff_location: string;
  status: DeliveryStatus;
  started_at?: string;
  completed_at?: string;
  driver?: {
    id: string;
    full_name: string;
    phone?: string;
  };
}

// ============================================================================
// Create Order Types
// ============================================================================

export interface CreateOrderItem {
  product_id: string;
  quantity: number;
}

export interface CreateOrderData {
  supplier_id: string;
  items: CreateOrderItem[];
  payment_method?: string;
  delivery_address?: string;
  notes?: string;
}

// ============================================================================
// Order Filters
// ============================================================================

export interface OrderFilters {
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
    orders: Order[];
    total: number;
    page: number;
    totalPages: number;
  };
}

export interface OrderResponse {
  success: boolean;
  data: {
    order: Order;
  };
}

// ============================================================================
// Status Update Types
// ============================================================================

export interface UpdateOrderStatusData {
  status: OrderStatus;
  notes?: string;
}

export interface CancelOrderData {
  reason?: string;
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
  receipt_status: "draft" | "final";
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
  currency: "ETB";
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
  receipt_status: "draft" | "final";
  order_id: string;
  order_status: OrderStatus;
  order_date: string;
  issued_at: string;
  buyer_name: string;
  supplier_name: string;
  total: number;
  payment_status: string;
}
