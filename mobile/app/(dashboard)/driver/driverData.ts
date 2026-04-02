export type DeliveryStatus = "assigned" | "picked_up" | "in_transit" | "delivered";
export type IssueType = "damaged_products" | "delivery_delay" | "failed_attempt" | "vehicle_breakdown";

export interface DeliveryProduct {
  name: string;
  quantity: number;
  unit: string;
}

export interface AssignedDelivery {
  id: string;
  orderCode: string;
  supplierName: string;
  buyerName: string;
  destination: string;
  pickupPoint: string;
  etaMinutes: number;
  routeProgress: number;
  status: DeliveryStatus;
  products: DeliveryProduct[];
}

export interface DriverNotification {
  id: string;
  title: string;
  detail: string;
  time: string;
  unread: boolean;
}

export interface DeliveryHistoryItem {
  id: string;
  orderCode: string;
  destination: string;
  deliveredAt: string;
  issueReported: boolean;
}

export const ISSUE_LABELS: Record<IssueType, string> = {
  damaged_products: "Damaged Products",
  delivery_delay: "Delivery Delay",
  failed_attempt: "Failed Attempt",
  vehicle_breakdown: "Vehicle Breakdown",
};

export const ACTIVE_DELIVERIES: AssignedDelivery[] = [
  {
    id: "d-101",
    orderCode: "ORD-7834",
    supplierName: "Blue Nile Distribution",
    buyerName: "Selam Supermarket",
    destination: "Bole, Addis Ababa",
    pickupPoint: "Warehouse 2, Akaki",
    etaMinutes: 28,
    routeProgress: 62,
    status: "in_transit",
    products: [
      { name: "Sunflower Oil", quantity: 18, unit: "cartons" },
      { name: "Sugar", quantity: 25, unit: "bags" },
    ],
  },
  {
    id: "d-102",
    orderCode: "ORD-7841",
    supplierName: "Abay Food Factory",
    buyerName: "Tena Mart",
    destination: "CMC, Addis Ababa",
    pickupPoint: "Factory Gate, Kaliti",
    etaMinutes: 54,
    routeProgress: 24,
    status: "picked_up",
    products: [
      { name: "Bottled Water", quantity: 50, unit: "packs" },
      { name: "Flour", quantity: 12, unit: "sacks" },
    ],
  },
  {
    id: "d-103",
    orderCode: "ORD-7856",
    supplierName: "Meskel Beverage",
    buyerName: "Family Choice",
    destination: "Megenagna, Addis Ababa",
    pickupPoint: "Storefront Loading Bay",
    etaMinutes: 16,
    routeProgress: 0,
    status: "assigned",
    products: [{ name: "Soft Drinks", quantity: 30, unit: "crates" }],
  },
];

export const DELIVERY_HISTORY: DeliveryHistoryItem[] = [
  {
    id: "h-1",
    orderCode: "ORD-7810",
    destination: "Piassa, Addis Ababa",
    deliveredAt: "Today, 09:15",
    issueReported: false,
  },
  {
    id: "h-2",
    orderCode: "ORD-7799",
    destination: "Gurd Shola, Addis Ababa",
    deliveredAt: "Yesterday, 18:40",
    issueReported: true,
  },
  {
    id: "h-3",
    orderCode: "ORD-7788",
    destination: "Lebu, Addis Ababa",
    deliveredAt: "Yesterday, 12:05",
    issueReported: false,
  },
];

export const NOTIFICATIONS: DriverNotification[] = [
  {
    id: "n-1",
    title: "New delivery assigned",
    detail: "ORD-7856 was assigned to you by Blue Nile Distribution.",
    time: "5 min ago",
    unread: true,
  },
  {
    id: "n-2",
    title: "Delivery destination updated",
    detail: "ORD-7841 dropoff note has been updated by buyer.",
    time: "22 min ago",
    unread: true,
  },
  {
    id: "n-3",
    title: "Status received",
    detail: "ORD-7834 status changed to In Transit successfully.",
    time: "1 hr ago",
    unread: false,
  },
];
