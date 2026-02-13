import React from "react";
import { OrderList } from "@/components/shared/OrderList";
import { Store } from "lucide-react";

// ============================================================================
// MOCK DATA
// ============================================================================

const orders = [
  {
    id: "TB-2026-0892",
    orderNumber: "TB-2026-0892",
    partyId: 101,
    partyName: "Ethiopia Coffee Export",
    partyContact: "Bereket Tesfaye",
    partyPhone: "+251 11 345 6789",
    partyLocation: "Addis Ababa",
    orderDate: "2026-02-10T10:30:00",
    requestedDelivery: "2026-02-13",
    estimatedDelivery: "2026-02-12",
    actualDelivery: "2026-02-12",
    items: [
      {
        name: "Yirgacheffe Coffee",
        sku: "COF-004",
        quantity: 15,
        unit: "kg",
        price: 450,
        total: 6750,
      },
    ],
    subtotal: 6750,
    shipping: 250,
    tax: 1012.5,
    total: 8012.5,
    status: "delivered" as const,
    paymentStatus: "paid" as const,
    paymentMethod: "Credit",
    paymentTerms: "30 days",
    priority: "medium" as const,
    trackingNumber: "TRK-7892-01",
    carrier: "Ethiopia Logistics",
    receivedBy: "Hidaya Nurmeika",
    receivedDate: "2026-02-12",
    invoiceUrl: "#",
    rating: 5,
    review: "Excellent quality coffee, fast delivery!",
  },
  {
    id: "TB-2026-0885",
    orderNumber: "TB-2026-0885",
    partyId: 102,
    partyName: "Adama Wholesalers",
    partyContact: "Almaz Worku",
    partyPhone: "+251 22 456 7890",
    partyLocation: "Adama",
    orderDate: "2026-02-09T14:15:00",
    requestedDelivery: "2026-02-14",
    estimatedDelivery: "2026-02-14",
    actualDelivery: null,
    items: [
      {
        name: "White Teff Flour",
        sku: "TFF-001",
        quantity: 50,
        unit: "kg",
        price: 120,
        total: 6000,
      },
      {
        name: "Soybean Oil",
        sku: "OIL-002",
        quantity: 30,
        unit: "liter",
        price: 180,
        total: 5400,
      },
    ],
    subtotal: 11400,
    shipping: 350,
    tax: 1710,
    total: 13460,
    status: "shipped" as const,
    paymentStatus: "paid" as const,
    paymentMethod: "Mobile Banking",
    paymentTerms: "15 days",
    priority: "medium" as const,
    trackingNumber: "TRK-7885-02",
    carrier: "Express Delivery",
  },
  {
    id: "TB-2026-0878",
    orderNumber: "TB-2026-0878",
    partyId: 103,
    partyName: "Ethiopian Textile",
    partyContact: "Hirut Desta",
    partyPhone: "+251 11 456 7890",
    partyLocation: "Addis Ababa",
    orderDate: "2026-02-08T09:45:00",
    requestedDelivery: "2026-02-15",
    estimatedDelivery: "2026-02-15",
    actualDelivery: null,
    items: [
      {
        name: "Cotton Fabric",
        sku: "FAB-008",
        quantity: 100,
        unit: "meter",
        price: 320,
        total: 32000,
      },
    ],
    subtotal: 32000,
    shipping: 500,
    tax: 4800,
    total: 37300,
    status: "processing" as const,
    paymentStatus: "paid" as const,
    paymentMethod: "Credit",
    paymentTerms: "30 days",
    priority: "medium" as const,
    trackingNumber: "TRK-7878-03",
  },
  {
    id: "TB-2026-0862",
    orderNumber: "TB-2026-0862",
    partyId: 104,
    partyName: "Bahir Dar Honey",
    partyContact: "Tigist Haile",
    partyPhone: "+251 58 234 5678",
    partyLocation: "Bahir Dar",
    orderDate: "2026-02-07T11:20:00",
    requestedDelivery: "2026-02-16",
    estimatedDelivery: "2026-02-16",
    actualDelivery: null,
    items: [
      {
        name: "Pure Honey",
        sku: "HON-009",
        quantity: 24,
        unit: "jar",
        price: 280,
        total: 6720,
      },
    ],
    subtotal: 6720,
    shipping: 300,
    tax: 1008,
    total: 8028,
    status: "pending" as const,
    paymentStatus: "pending" as const,
    paymentMethod: "Cash on Delivery",
    paymentTerms: "COD",
    priority: "low" as const,
    notes: "Please deliver during business hours",
  },
  {
    id: "TB-2026-0851",
    orderNumber: "TB-2026-0851",
    partyId: 105,
    partyName: "Mekelle Steel",
    partyContact: "Mulugeta Assefa",
    partyPhone: "+251 34 567 8901",
    partyLocation: "Mekelle",
    orderDate: "2026-02-06T16:30:00",
    requestedDelivery: "2026-02-12",
    estimatedDelivery: "2026-02-11",
    actualDelivery: "2026-02-11",
    items: [
      {
        name: "Steel Rebars",
        sku: "STL-010",
        quantity: 10,
        unit: "ton",
        price: 8500,
        total: 85000,
      },
    ],
    subtotal: 85000,
    shipping: 1500,
    tax: 12750,
    total: 99250,
    status: "delivered" as const,
    paymentStatus: "paid" as const,
    paymentMethod: "Credit",
    paymentTerms: "30 days",
    priority: "high" as const,
    trackingNumber: "TRK-7851-04",
    carrier: "Mekelle Logistics",
    receivedBy: "Hidaya Nurmeika",
    receivedDate: "2026-02-11",
    invoiceUrl: "#",
    rating: 4,
    review: "Good quality steel, delivered on time.",
  },
  {
    id: "TB-2026-0834",
    orderNumber: "TB-2026-0834",
    partyId: 102,
    partyName: "Adama Wholesalers",
    partyContact: "Almaz Worku",
    partyPhone: "+251 22 456 7890",
    partyLocation: "Adama",
    orderDate: "2026-02-05T13:10:00",
    requestedDelivery: "2026-02-10",
    estimatedDelivery: "2026-02-10",
    actualDelivery: null,
    items: [
      {
        name: "Tomato Paste",
        sku: "TOM-003",
        quantity: 200,
        unit: "can",
        price: 85,
        total: 17000,
      },
      {
        name: "White Teff Flour",
        sku: "TFF-001",
        quantity: 25,
        unit: "kg",
        price: 120,
        total: 3000,
      },
    ],
    subtotal: 20000,
    shipping: 400,
    tax: 3000,
    total: 23400,
    status: "cancelled" as const,
    paymentStatus: "refunded" as const,
    paymentMethod: "Credit",
    paymentTerms: "30 days",
    priority: "low" as const,
    cancellationReason: "Out of stock",
    cancelledDate: "2026-02-06",
  },
  {
    id: "TB-2026-0821",
    orderNumber: "TB-2026-0821",
    partyId: 101,
    partyName: "Ethiopia Coffee Export",
    partyContact: "Bereket Tesfaye",
    partyPhone: "+251 11 345 6789",
    partyLocation: "Addis Ababa",
    orderDate: "2026-02-04T10:00:00",
    requestedDelivery: "2026-02-09",
    estimatedDelivery: "2026-02-08",
    actualDelivery: "2026-02-08",
    items: [
      {
        name: "Macadamia Nuts",
        sku: "NUT-005",
        quantity: 40,
        unit: "kg",
        price: 650,
        total: 26000,
      },
    ],
    subtotal: 26000,
    shipping: 300,
    tax: 3900,
    total: 30200,
    status: "delivered" as const,
    paymentStatus: "paid" as const,
    paymentMethod: "Mobile Banking",
    paymentTerms: "15 days",
    priority: "medium" as const,
    trackingNumber: "TRK-7821-05",
    carrier: "Express Delivery",
    receivedBy: "Hidaya Nurmeika",
    receivedDate: "2026-02-08",
    invoiceUrl: "#",
    rating: 5,
    review: "Premium quality nuts, will order again!",
  },
  {
    id: "TB-2026-0810",
    orderNumber: "TB-2026-0810",
    partyId: 108,
    partyName: "Mugher Cement",
    partyContact: "Tadesse Haile",
    partyPhone: "+251 11 234 5678",
    partyLocation: "Addis Ababa",
    orderDate: "2026-02-03T15:45:00",
    requestedDelivery: "2026-02-14",
    estimatedDelivery: "2026-02-14",
    actualDelivery: null,
    items: [
      {
        name: "Cement",
        sku: "CEM-011",
        quantity: 200,
        unit: "bag",
        price: 620,
        total: 124000,
      },
    ],
    subtotal: 124000,
    shipping: 2000,
    tax: 18600,
    total: 144600,
    status: "shipped" as const,
    paymentStatus: "paid" as const,
    paymentMethod: "Credit",
    paymentTerms: "30 days",
    priority: "high" as const,
    trackingNumber: "TRK-7810-06",
    carrier: "Mugher Logistics",
  },
];

const OrdersPage: React.FC = () => {
  // Calculate stats
  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const processingOrders = orders.filter(
    (o) => o.status === "processing",
  ).length;
  const shippedOrders = orders.filter((o) => o.status === "shipped").length;
  const deliveredOrders = orders.filter((o) => o.status === "delivered").length;

  const stats = {
    totalSpent,
    pending: pendingOrders,
    processing: processingOrders,
    shipped: shippedOrders,
    delivered: deliveredOrders,
  };

  const handleCancelOrder = (orderId: string, reason: string) => {
    console.log("Cancel order:", orderId, reason);
    // API call would go here
  };

  const handleReorder = (orderId: string) => {
    console.log("Reorder:", orderId);
    // Navigate to cart with items from this order
  };

  const handleRate = (orderId: string, rating: number, review: string) => {
    console.log("Rate order:", orderId, rating, review);
    // API call would go here
  };

  return (
    <OrderList
      config={{
        role: "retailer",
        type: "sales",
        title: "My Orders",
        description: "Track and manage all your orders in one place",
        partyLabel: "Supplier",
        partyPath: "/suppliers",
        icon: Store,
        showRating: true,
        showReorder: true,
        showCancel: true,
        stats,
      }}
      orders={orders}
      onCancelOrder={handleCancelOrder}
      onReorder={handleReorder}
      onRate={handleRate}
    />
  );
};

export default OrdersPage;
