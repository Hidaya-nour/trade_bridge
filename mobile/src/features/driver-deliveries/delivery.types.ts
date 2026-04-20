export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
  | "failed"
  | "cancelled";

export type DeliveryPriority = "standard" | "urgent" | "fragile";

export interface DeliveryProduct {
  name: string;
  quantity: number;
  unit: string;
}

export interface DeliveryTimelineItem {
  label: string;
  time: string;
  complete: boolean;
}

export interface DriverDelivery {
  id: string;
  orderId: string;
  orderCode: string;
  supplierName: string;
  buyerName: string;
  destination: string;
  pickupPoint: string;
  etaMinutes: number;
  routeProgress: number;
  status: DeliveryStatus;
  products: DeliveryProduct[];
  contactPerson: string;
  contactPhone: string;
  vehiclePlate: string;
  priority: DeliveryPriority;
  distanceKm: number;
  scheduledWindow: string;
  notes: string;
  deliveredAt?: string;
  issueReported: boolean;
  timeline: DeliveryTimelineItem[];
}
