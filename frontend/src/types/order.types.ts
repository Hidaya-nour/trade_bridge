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
    location?: string;
    rating?: number;
    verified?: boolean;
    previousOrders?: number;
  };
export type DeliveryStatus = 
  | 'pending' 
  | 'assigned' 
  | 'picked_up' 
  | 'in_transit' 
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
};
export type OrderDelivery = {
  address: string;
  recipient: string;
  phone: string;
  requestedDate?: string;
  estimatedDate?: string;
  actualDate?: string;
  trackingNumber?: string | null;
  carrier?: string | null;
  driverId?: number | string | null;
  driverName?: string | null;
  driverPhone?: string | null;
};
export type OrderDetailsData = {
  order: Order;
  driver?: OrderDriver;
  canAssignDriver?: boolean;
  canCancel?: boolean;
};
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
