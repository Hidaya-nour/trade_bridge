import React from "react";
import { OrderList } from "@/components/shared/OrderList";
import { Factory } from "lucide-react";

// ============================================================================
// MOCK DATA
// ============================================================================

const purchaseOrders = [
  {
    id: "PO-2026-0125",
    orderNumber: "PO-2026-0125",
    partyId: 501,
    partyName: "Mugher Cement",
    partyContact: "Tadesse Haile",
    partyPhone: "+251 11 234 5678",
    partyLocation: "Addis Ababa",
    orderDate: "2026-02-10T10:30:00",
    requestedDelivery: "2026-02-20",
    estimatedDelivery: "2026-02-18",
    actualDelivery: null,
    items: [
      {
        name: "Portland Cement",
        sku: "CEM-011",
        quantity: 500,
        unit: "bag",
        price: 520,
        total: 260000,
      },
    ],
    subtotal: 260000,
    shipping: 5000,
    tax: 39000,
    total: 304000,
    status: "shipped" as const,
    paymentStatus: "paid" as const,
    paymentMethod: "Credit",
    paymentTerms: "30 days",
    priority: "high" as const,
    notes: "Urgent - needed for construction project",
    trackingNumber: "FTRK-501-0125",
    carrier: "Ethiopia Logistics",
    invoiceUrl: "#",
  },
  {
    id: "PO-2026-0124",
    orderNumber: "PO-2026-0124",
    partyId: 502,
    partyName: "Mekelle Steel",
    partyContact: "Mulugeta Assefa",
    partyPhone: "+251 34 567 8901",
    partyLocation: "Mekelle",
    orderDate: "2026-02-09T14:15:00",
    requestedDelivery: "2026-02-25",
    estimatedDelivery: "2026-02-23",
    actualDelivery: null,
    items: [
      {
        name: "Steel Rebars 12mm",
        sku: "STL-010",
        quantity: 20,
        unit: "ton",
        price: 7500,
        total: 150000,
      },
      {
        name: "Steel Rebars 16mm",
        sku: "STL-011",
        quantity: 15,
        unit: "ton",
        price: 7400,
        total: 111000,
      },
    ],
    subtotal: 261000,
    shipping: 8000,
    tax: 39150,
    total: 308150,
    status: "confirmed" as const,
    paymentStatus: "approved" as const,
    paymentMethod: "Bank Transfer",
    paymentTerms: "15 days",
    priority: "medium" as const,
    invoiceUrl: "#",
  },
  {
    id: "PO-2026-0123",
    orderNumber: "PO-2026-0123",
    partyId: 504,
    partyName: "Ethiopia Coffee Export",
    partyContact: "Bereket Tesfaye",
    partyPhone: "+251 11 345 6789",
    partyLocation: "Addis Ababa",
    orderDate: "2026-02-08T09:45:00",
    requestedDelivery: "2026-02-22",
    estimatedDelivery: "2026-02-20",
    actualDelivery: null,
    items: [
      {
        name: "Yirgacheffe Coffee",
        sku: "COF-004",
        quantity: 200,
        unit: "kg",
        price: 380,
        total: 76000,
      },
      {
        name: "Macadamia Nuts",
        sku: "NUT-005",
        quantity: 150,
        unit: "kg",
        price: 580,
        total: 87000,
      },
    ],
    subtotal: 163000,
    shipping: 3500,
    tax: 24450,
    total: 190950,
    status: "processing" as const,
    paymentStatus: "approved" as const,
    paymentMethod: "Credit",
    paymentTerms: "30 days",
    priority: "medium" as const,
  },
  {
    id: "PO-2026-0122",
    orderNumber: "PO-2026-0122",
    partyId: 505,
    partyName: "Ethiopia Agri",
    partyContact: "Almaz Worku",
    partyPhone: "+251 22 456 7890",
    partyLocation: "Adama",
    orderDate: "2026-02-07T11:20:00",
    requestedDelivery: "2026-02-21",
    estimatedDelivery: "2026-02-19",
    actualDelivery: null,
    items: [
      {
        name: "White Teff Flour",
        sku: "TFF-001",
        quantity: 1000,
        unit: "kg",
        price: 95,
        total: 95000,
      },
      {
        name: "Soybean Oil",
        sku: "OIL-002",
        quantity: 500,
        unit: "liter",
        price: 145,
        total: 72500,
      },
    ],
    subtotal: 167500,
    shipping: 4500,
    tax: 25125,
    total: 197125,
    status: "pending" as const,
    paymentStatus: "pending" as const,
    paymentMethod: "Mobile Banking",
    paymentTerms: "Cash on Delivery",
    priority: "high" as const,
    notes: "Please expedite - running low on stock",
  },
  {
    id: "PO-2026-0121",
    orderNumber: "PO-2026-0121",
    partyId: 503,
    partyName: "Ethiopian Textile",
    partyContact: "Hirut Desta",
    partyPhone: "+251 11 456 7890",
    partyLocation: "Addis Ababa",
    orderDate: "2026-02-06T13:50:00",
    requestedDelivery: "2026-02-19",
    estimatedDelivery: "2026-02-18",
    actualDelivery: "2026-02-17",
    items: [
      {
        name: "Cotton Fabric",
        sku: "FAB-008",
        quantity: 500,
        unit: "meter",
        price: 280,
        total: 140000,
      },
    ],
    subtotal: 140000,
    shipping: 3000,
    tax: 21000,
    total: 164000,
    status: "delivered" as const,
    paymentStatus: "paid" as const,
    paymentMethod: "Credit",
    paymentTerms: "30 days",
    priority: "low" as const,
    trackingNumber: "FTRK-503-0121",
    carrier: "Express Delivery",
    receivedBy: "Abebe Kebede",
    receivedDate: "2026-02-17",
    invoiceUrl: "#",
    rating: 4.5,
  },
  {
    id: "PO-2026-0120",
    orderNumber: "PO-2026-0120",
    partyId: 506,
    partyName: "Adama Oil",
    partyContact: "Kebede Desta",
    partyPhone: "+251 22 567 8901",
    partyLocation: "Adama",
    orderDate: "2026-02-05T15:30:00",
    requestedDelivery: "2026-02-18",
    estimatedDelivery: "2026-02-17",
    actualDelivery: "2026-02-16",
    items: [
      {
        name: "Soybean Oil - Bulk",
        sku: "OIL-003",
        quantity: 2000,
        unit: "liter",
        price: 145,
        total: 290000,
      },
    ],
    subtotal: 290000,
    shipping: 6000,
    tax: 43500,
    total: 339500,
    status: "delivered" as const,
    paymentStatus: "paid" as const,
    paymentMethod: "Bank Transfer",
    paymentTerms: "15 days",
    priority: "medium" as const,
    trackingNumber: "FTRK-506-0120",
    carrier: "Adama Logistics",
    receivedBy: "Tigist Haile",
    receivedDate: "2026-02-16",
    invoiceUrl: "#",
    rating: 4.8,
  },
  {
    id: "PO-2026-0119",
    orderNumber: "PO-2026-0119",
    partyId: 507,
    partyName: "Adama Plastics",
    partyContact: "Solomon Ayele",
    partyPhone: "+251 22 678 9012",
    partyLocation: "Adama",
    orderDate: "2026-02-04T10:15:00",
    requestedDelivery: "2026-02-16",
    estimatedDelivery: "2026-02-15",
    actualDelivery: null,
    items: [
      {
        name: "Plastic Granules",
        sku: "PLA-012",
        quantity: 1000,
        unit: "kg",
        price: 85,
        total: 85000,
      },
    ],
    subtotal: 85000,
    shipping: 2500,
    tax: 12750,
    total: 100250,
    status: "cancelled" as const,
    paymentStatus: "refunded" as const,
    paymentMethod: "Mobile Banking",
    paymentTerms: "Prepaid",
    priority: "low" as const,
    notes: "Order cancelled due to specification change",
    cancellationReason: "Specification change requested",
    cancelledDate: "2026-02-06",
  },
];

const PurchaseOrdersPage: React.FC = () => {
  // Calculate stats
  const totalSpent = purchaseOrders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = purchaseOrders.filter(
    (o) => o.status === "pending",
  ).length;
  const confirmedOrders = purchaseOrders.filter(
    (o) => o.status === "confirmed",
  ).length;
  const processingOrders = purchaseOrders.filter(
    (o) => o.status === "processing",
  ).length;
  const shippedOrders = purchaseOrders.filter(
    (o) => o.status === "shipped",
  ).length;
  const deliveredOrders = purchaseOrders.filter(
    (o) => o.status === "delivered",
  ).length;

  const stats = {
    totalSpent,
    pending: pendingOrders,
    processing: processingOrders + confirmedOrders, // Combine confirmed + processing
    shipped: shippedOrders,
    delivered: deliveredOrders,
  };

  const handleCancelOrder = (orderId: string, reason: string) => {
    console.log("Cancel purchase order:", orderId, reason);
    // API call would go here
  };

  const handleReorder = (orderId: string) => {
    console.log("Reorder from factory:", orderId);
    // Navigate to factory products with items from this order
  };

  const handleRate = (orderId: string, rating: number, review: string) => {
    console.log("Rate factory:", orderId, rating, review);
    // API call would go here
  };

  return (
    <OrderList
      config={{
        role: "distributor",
        type: "purchases",
        title: "Purchase Orders",
        description:
          "Track and manage orders placed with factories and manufacturers",
        partyLabel: "Factory",
        partyPath: "/factories",
        icon: Factory,
        showRating: true,
        showReorder: true,
        showCancel: true,
        stats,
      }}
      orders={purchaseOrders}
      onCancelOrder={handleCancelOrder}
      onReorder={handleReorder}
      onRate={handleRate}
    />
  );
};

export default PurchaseOrdersPage;
