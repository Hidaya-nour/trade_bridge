export type DeliveryRole = "distributor" | "factory";

export interface Delivery {
  id: string;
  orderId: string;
  customerId: number;
  customerName: string;
  customerContact: string;
  customerPhone: string;
  customerLocation: string;
  deliveryAddress: string;
  items: {
    name: string;
    quantity: number;
    unit: string;
  }[];
  totalItems: number;
  totalWeight: string;
  status:
    | "pending"
    | "assigned"
    | "picked-up"
    | "in-transit"
    | "delivered"
    | "failed"
    | "cancelled";
  priority: "high" | "medium" | "low";
  scheduledDate: string;
  scheduledTime: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  driverId?: number | string;
  driverName?: string;
  driverPhone?: string;
  vehicleType?: string;
  licensePlate?: string;
  trackingNumber?: string;
  currentLocation?: string;
  lastUpdate?: string;
  notes?: string;
  signature?: string;
  proofOfDelivery?: string;
  failureReason?: string;
  deliveryType: "free" | "paid";
  deliveryCost?: number;
  paymentCollected?: boolean;
  customerPickedUp?: boolean;
}

export interface Driver {
  id: string;
  name: string;
  phone: string;
  email: string;
  vehicleType: string;
  licensePlate: string;
  status: "available" | "on-delivery" | "off-duty" | "on-break";
  currentLocation: string;
  deliveriesToday: number;
  deliveriesCompleted: number;
  rating: number;
  avatar?: string;
}

export interface DeliveryConfig {
  role: DeliveryRole;
  hasDrivers: boolean;
  offersDelivery: boolean;
  defaultDeliveryCost?: number;
  customerLabel: string;
  customerPath: string;
}
