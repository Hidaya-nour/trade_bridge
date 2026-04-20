export type DeliveryStatus =
  | "pending"
  | "assigned"
  | "picked_up"
  | "in_transit"
  | "delivered"
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

export const DRIVER_DELIVERIES: DriverDelivery[] = [
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
    contactPerson: "Mulu Bekele",
    contactPhone: "+251 911 223 443",
    vehiclePlate: "AA-45783",
    priority: "urgent",
    distanceKm: 11.8,
    scheduledWindow: "Today, 14:00 - 15:00",
    notes: "Call buyer five minutes before arrival and unload at rear entrance.",
    issueReported: false,
    timeline: [
      { label: "Assignment confirmed", time: "Today, 12:05", complete: true },
      { label: "Pickup completed", time: "Today, 12:42", complete: true },
      { label: "In transit", time: "Today, 13:05", complete: true },
      { label: "Dropoff pending", time: "ETA 28 min", complete: false },
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
    contactPerson: "Rahel Demissie",
    contactPhone: "+251 922 558 190",
    vehiclePlate: "AA-21041",
    priority: "standard",
    distanceKm: 24.3,
    scheduledWindow: "Today, 15:30 - 17:00",
    notes: "Security gate requires order code before entry.",
    issueReported: false,
    timeline: [
      { label: "Assignment confirmed", time: "Today, 11:18", complete: true },
      { label: "Pickup completed", time: "Today, 12:15", complete: true },
      { label: "Route started", time: "Today, 12:28", complete: true },
      { label: "Customer handoff", time: "Scheduled for 15:30", complete: false },
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
    contactPerson: "Yared Solomon",
    contactPhone: "+251 933 741 024",
    vehiclePlate: "AA-77321",
    priority: "fragile",
    distanceKm: 6.7,
    scheduledWindow: "Today, 13:45 - 14:30",
    notes: "Glass bottles in the first six crates need careful handling.",
    issueReported: false,
    timeline: [
      { label: "Assignment confirmed", time: "Today, 13:10", complete: true },
      { label: "Waiting for pickup", time: "Pickup opens at 13:30", complete: false },
      { label: "Transit", time: "Pending", complete: false },
      { label: "Dropoff", time: "Pending", complete: false },
    ],
  },
  {
    id: "d-104",
    orderCode: "ORD-7810",
    supplierName: "Blue Nile Distribution",
    buyerName: "City Fresh",
    destination: "Piassa, Addis Ababa",
    pickupPoint: "Warehouse 2, Akaki",
    etaMinutes: 0,
    routeProgress: 100,
    status: "delivered",
    products: [
      { name: "Cooking Oil", quantity: 10, unit: "cartons" },
      { name: "Rice", quantity: 8, unit: "bags" },
    ],
    contactPerson: "Sara Desta",
    contactPhone: "+251 911 440 920",
    vehiclePlate: "AA-45783",
    priority: "standard",
    distanceKm: 13.2,
    scheduledWindow: "Today, 08:30 - 09:30",
    notes: "Signed by store manager at receiving dock.",
    deliveredAt: "Today, 09:15",
    issueReported: false,
    timeline: [
      { label: "Assignment confirmed", time: "Today, 07:15", complete: true },
      { label: "Pickup completed", time: "Today, 07:52", complete: true },
      { label: "In transit", time: "Today, 08:20", complete: true },
      { label: "Delivered", time: "Today, 09:15", complete: true },
    ],
  },
  {
    id: "d-105",
    orderCode: "ORD-7799",
    supplierName: "Abay Food Factory",
    buyerName: "Green Basket",
    destination: "Gurd Shola, Addis Ababa",
    pickupPoint: "Factory Gate, Kaliti",
    etaMinutes: 0,
    routeProgress: 100,
    status: "delivered",
    products: [
      { name: "Wheat Flour", quantity: 14, unit: "sacks" },
      { name: "Biscuits", quantity: 22, unit: "boxes" },
    ],
    contactPerson: "Lensa Tadesse",
    contactPhone: "+251 944 203 517",
    vehiclePlate: "AA-21041",
    priority: "urgent",
    distanceKm: 19.4,
    scheduledWindow: "Yesterday, 17:00 - 19:00",
    notes: "Late unloading due to buyer queue; issue already logged with dispatch.",
    deliveredAt: "Yesterday, 18:40",
    issueReported: true,
    timeline: [
      { label: "Assignment confirmed", time: "Yesterday, 14:05", complete: true },
      { label: "Pickup completed", time: "Yesterday, 15:11", complete: true },
      { label: "Delay reported", time: "Yesterday, 17:46", complete: true },
      { label: "Delivered", time: "Yesterday, 18:40", complete: true },
    ],
  },
  {
    id: "d-106",
    orderCode: "ORD-7788",
    supplierName: "Meskel Beverage",
    buyerName: "Lebu Market Hub",
    destination: "Lebu, Addis Ababa",
    pickupPoint: "Storefront Loading Bay",
    etaMinutes: 0,
    routeProgress: 100,
    status: "delivered",
    products: [{ name: "Soft Drinks", quantity: 20, unit: "crates" }],
    contactPerson: "Nahom Alemu",
    contactPhone: "+251 966 882 314",
    vehiclePlate: "AA-77321",
    priority: "fragile",
    distanceKm: 17.1,
    scheduledWindow: "Yesterday, 10:30 - 12:30",
    notes: "Delivery completed without issue and stock counted on site.",
    deliveredAt: "Yesterday, 12:05",
    issueReported: false,
    timeline: [
      { label: "Assignment confirmed", time: "Yesterday, 08:45", complete: true },
      { label: "Pickup completed", time: "Yesterday, 09:22", complete: true },
      { label: "In transit", time: "Yesterday, 10:10", complete: true },
      { label: "Delivered", time: "Yesterday, 12:05", complete: true },
    ],
  },
  {
    id: "d-107",
    orderCode: "ORD-7850",
    supplierName: "Ethio Flour Mill",
    buyerName: "Fresh Bakery",
    destination: "Kazanchis, Addis Ababa",
    pickupPoint: "Mill Warehouse",
    etaMinutes: 0,
    routeProgress: 0,
    status: "pending",
    products: [{ name: "Wheat Flour", quantity: 50, unit: "bags" }],
    contactPerson: "Alemayehu Tadesse",
    contactPhone: "+251 922 334 556",
    vehiclePlate: "",
    priority: "standard",
    distanceKm: 8.5,
    scheduledWindow: "Tomorrow, 09:00 - 11:00",
    notes: "Awaiting vehicle assignment.",
    issueReported: false,
    timeline: [
      { label: "Order placed", time: "Today, 10:00", complete: true },
      { label: "Pending assignment", time: "Pending", complete: false },
    ],
  },
  {
    id: "d-108",
    orderCode: "ORD-7845",
    supplierName: "Abay Dairy",
    buyerName: "City Supermarket",
    destination: "Piassa, Addis Ababa",
    pickupPoint: "Dairy Plant",
    etaMinutes: 0,
    routeProgress: 0,
    status: "cancelled",
    products: [{ name: "Milk", quantity: 30, unit: "cartons" }],
    contactPerson: "Hirut Mengistu",
    contactPhone: "+251 933 445 667",
    vehiclePlate: "",
    priority: "standard",
    distanceKm: 12.3,
    scheduledWindow: "Today, 16:00 - 18:00",
    notes: "Order cancelled by buyer due to stock availability.",
    issueReported: false,
    timeline: [
      { label: "Order placed", time: "Today, 08:00", complete: true },
      { label: "Cancelled", time: "Today, 14:30", complete: true },
    ],
  },
];

export const getDeliveryById = (id?: string) =>
  DRIVER_DELIVERIES.find((delivery) => delivery.id === id);
