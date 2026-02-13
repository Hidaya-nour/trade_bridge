import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Factory,
  Package,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
  Truck,
  AlertCircle,
  ChevronRight,
  Download,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Printer,
  MoreVertical,
  FileText,
  Repeat,
  Star,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface FactoryOrderItem {
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

interface FactoryOrder {
  id: string;
  poNumber: string;
  factoryId: number;
  factoryName: string;
  factoryContact: string;
  factoryPhone: string;
  factoryLocation: string;
  orderDate: string;
  requestedDelivery: string;
  estimatedDelivery: string;
  actualDelivery?: string;
  items: FactoryOrderItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  status:
    | "pending"
    | "confirmed"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled";
  paymentStatus: "pending" | "paid" | "approved" | "refunded";
  paymentMethod: string;
  paymentTerms: string;
  priority: "high" | "medium" | "low";
  notes?: string;
  trackingNumber?: string;
  carrier?: string;
  cancellationReason?: string;
  cancelledDate?: string;
  receivedBy?: string;
  receivedDate?: string;
  invoiceUrl?: string;
  rating?: number | null;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const factoryOrders: FactoryOrder[] = [
  {
    id: "PO-2026-0125",
    poNumber: "PO-2026-0125",
    factoryId: 501,
    factoryName: "Mugher Cement",
    factoryContact: "Tadesse Haile",
    factoryPhone: "+251 11 234 5678",
    factoryLocation: "Addis Ababa",
    orderDate: "2026-02-10T10:30:00",
    requestedDelivery: "2026-02-20",
    estimatedDelivery: "2026-02-18",
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
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Credit",
    paymentTerms: "30 days",
    priority: "high",
    notes: "Urgent - needed for construction project",
    trackingNumber: "FTRK-501-0125",
    carrier: "Ethiopia Logistics",
    invoiceUrl: "#",
  },
  {
    id: "PO-2026-0124",
    poNumber: "PO-2026-0124",
    factoryId: 502,
    factoryName: "Mekelle Steel",
    factoryContact: "Mulugeta Assefa",
    factoryPhone: "+251 34 567 8901",
    factoryLocation: "Mekelle",
    orderDate: "2026-02-09T14:15:00",
    requestedDelivery: "2026-02-25",
    estimatedDelivery: "2026-02-23",
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
    status: "confirmed",
    paymentStatus: "approved",
    paymentMethod: "Bank Transfer",
    paymentTerms: "15 days",
    priority: "medium",
    invoiceUrl: "#",
  },
  {
    id: "PO-2026-0123",
    poNumber: "PO-2026-0123",
    factoryId: 504,
    factoryName: "Ethiopia Coffee Export",
    factoryContact: "Bereket Tesfaye",
    factoryPhone: "+251 11 345 6789",
    factoryLocation: "Addis Ababa",
    orderDate: "2026-02-08T09:45:00",
    requestedDelivery: "2026-02-22",
    estimatedDelivery: "2026-02-20",
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
    status: "processing",
    paymentStatus: "approved",
    paymentMethod: "Credit",
    paymentTerms: "30 days",
    priority: "medium",
  },
  {
    id: "PO-2026-0122",
    poNumber: "PO-2026-0122",
    factoryId: 505,
    factoryName: "Ethiopia Agri",
    factoryContact: "Almaz Worku",
    factoryPhone: "+251 22 456 7890",
    factoryLocation: "Adama",
    orderDate: "2026-02-07T11:20:00",
    requestedDelivery: "2026-02-21",
    estimatedDelivery: "2026-02-19",
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
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Mobile Banking",
    paymentTerms: "Cash on Delivery",
    priority: "high",
    notes: "Please expedite - running low on stock",
  },
  {
    id: "PO-2026-0121",
    poNumber: "PO-2026-0121",
    factoryId: 503,
    factoryName: "Ethiopian Textile",
    factoryContact: "Hirut Desta",
    factoryPhone: "+251 11 456 7890",
    factoryLocation: "Addis Ababa",
    orderDate: "2026-02-06T13:50:00",
    requestedDelivery: "2026-02-19",
    estimatedDelivery: "2026-02-18",
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
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Credit",
    paymentTerms: "30 days",
    priority: "low",
    trackingNumber: "FTRK-503-0121",
    carrier: "Express Delivery",
    receivedBy: "Abebe Kebede",
    receivedDate: "2026-02-17",
    invoiceUrl: "#",
    rating: 4.5,
  },
  {
    id: "PO-2026-0120",
    poNumber: "PO-2026-0120",
    factoryId: 506,
    factoryName: "Adama Oil",
    factoryContact: "Kebede Desta",
    factoryPhone: "+251 22 567 8901",
    factoryLocation: "Adama",
    orderDate: "2026-02-05T15:30:00",
    requestedDelivery: "2026-02-18",
    estimatedDelivery: "2026-02-17",
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
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Bank Transfer",
    paymentTerms: "15 days",
    priority: "medium",
    trackingNumber: "FTRK-506-0120",
    carrier: "Adama Logistics",
    receivedBy: "Tigist Haile",
    receivedDate: "2026-02-16",
    invoiceUrl: "#",
    rating: 4.8,
  },
  {
    id: "PO-2026-0119",
    poNumber: "PO-2026-0119",
    factoryId: 507,
    factoryName: "Adama Plastics",
    factoryContact: "Solomon Ayele",
    factoryPhone: "+251 22 678 9012",
    factoryLocation: "Adama",
    orderDate: "2026-02-04T10:15:00",
    requestedDelivery: "2026-02-16",
    estimatedDelivery: "2026-02-15",
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
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "Mobile Banking",
    paymentTerms: "Prepaid",
    priority: "low",
    notes: "Order cancelled due to specification change",
    cancellationReason: "Specification change requested",
    cancelledDate: "2026-02-06",
  },
];

// ============================================================================
// CONSTANTS
// ============================================================================

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

const paymentStatusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  refunded: "bg-gray-100 text-gray-800",
};

// ============================================================================
// COMPONENT
// ============================================================================

const FactoryOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<FactoryOrder[]>(factoryOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [factoryFilter, setFactoryFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<FactoryOrder | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Get unique factories for filter
  const factories = Array.from(
    new Set(orders.map((o) => o.factoryName)),
  ).sort();

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.poNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.factoryName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesFactory =
      factoryFilter === "all" || order.factoryName === factoryFilter;

    return matchesSearch && matchesStatus && matchesFactory;
  });

  // Sort orders by date (newest first)
  const sortedOrders = [...filteredOrders].sort(
    (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime(),
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = sortedOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedOrders.length / itemsPerPage);

  // Stats
  const pendingOrders = orders.filter((o) => o.status === "pending").length;
  const confirmedOrders = orders.filter((o) => o.status === "confirmed").length;
  const shippedOrders = orders.filter((o) => o.status === "shipped").length;
  const totalSpent = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const cancelOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "cancelled",
              paymentStatus: "refunded",
              cancellationReason:
                cancellationReason || "Cancelled by distributor",
              cancelledDate: new Date().toISOString().split("T")[0],
            }
          : o,
      ),
    );
    setShowCancelDialog(false);
    setSelectedOrder(null);
    setCancellationReason("");
  };

  const formatPrice = (price: number) => {
    return `ETB ${price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getStatusProgress = (status: string) => {
    switch (status) {
      case "pending":
        return 20;
      case "confirmed":
        return 40;
      case "processing":
        return 60;
      case "shipped":
        return 80;
      case "delivered":
        return 100;
      case "cancelled":
        return 0;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Factory Orders
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <Factory className="h-3 w-3 mr-1" />
              {orders.length} Total Orders
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Track and manage orders placed with factories and manufacturers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button asChild>
            <Link to="/distributor/factory-products">
              <Factory className="h-4 w-4 mr-2" />
              Order More
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by PO number, factory name..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Order Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={factoryFilter} onValueChange={setFactoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Factories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Factories</SelectItem>
                  {factories.map((factory) => (
                    <SelectItem key={factory} value={factory}>
                      {factory}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Showing {indexOfFirstItem + 1}-
          {Math.min(indexOfLastItem, sortedOrders.length)} of{" "}
          {sortedOrders.length} factory orders
        </div>
        <Badge variant="outline" className="px-3 py-1">
          <Package className="h-3 w-3 mr-1" />
          {sortedOrders.length} orders
        </Badge>
      </div>

      {/* Orders List */}
      {sortedOrders.length === 0 ? (
        <Card className="py-12">
          <div className="text-center">
            <Factory className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No factory orders found
            </h3>
            <p className="text-muted-foreground mb-4">
              You haven't placed any orders with factories yet
            </p>
            <Button asChild>
              <Link to="/distributor/factory-products">
                Browse Factory Products
              </Link>
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {currentOrders.map((order) => (
            <Card
              key={order.id}
              className="overflow-hidden hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                {/* Order Header */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        order.status === "pending"
                          ? "bg-yellow-100"
                          : order.status === "confirmed"
                            ? "bg-blue-100"
                            : order.status === "processing"
                              ? "bg-indigo-100"
                              : order.status === "shipped"
                                ? "bg-purple-100"
                                : order.status === "delivered"
                                  ? "bg-green-100"
                                  : "bg-red-100",
                      )}
                    >
                      {order.status === "pending" && (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      {order.status === "confirmed" && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
                      )}
                      {order.status === "processing" && (
                        <Package className="h-5 w-5 text-indigo-600" />
                      )}
                      {order.status === "shipped" && (
                        <Truck className="h-5 w-5 text-purple-600" />
                      )}
                      {order.status === "delivered" && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {order.status === "cancelled" && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/distributor/factory-orders/${order.id}`}
                          className="text-lg font-semibold hover:text-primary"
                        >
                          {order.poNumber}
                        </Link>
                        <Badge
                          variant="outline"
                          className={statusColors[order.status]}
                        >
                          {order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={priorityColors[order.priority]}
                        >
                          {order.priority.charAt(0).toUpperCase() +
                            order.priority.slice(1)}{" "}
                          Priority
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex items-center gap-2">
                          <div className="h-6 w-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <Factory className="h-3 w-3 text-blue-600" />
                          </div>
                          <Link
                            to={`/distributor/factories/${order.factoryId}`}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {order.factoryName}
                          </Link>
                        </div>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Ordered: {formatDate(order.orderDate)}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground flex items-center">
                          <MapPin className="h-3 w-3 mr-1" />
                          {order.factoryLocation}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(order.total)}
                    </p>
                    <Badge
                      variant="outline"
                      className={paymentStatusColors[order.paymentStatus]}
                    >
                      {order.paymentMethod} • {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Order Progress */}
                {order.status !== "cancelled" &&
                  order.status !== "delivered" && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">
                          Order Progress
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {getStatusProgress(order.status)}%
                        </span>
                      </div>
                      <Progress
                        value={getStatusProgress(order.status)}
                        className="h-2"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-muted-foreground">
                          Pending
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Confirmed
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Processing
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Shipped
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          Delivered
                        </span>
                      </div>
                    </div>
                  )}

                {/* Order Items Preview */}
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">
                      Order Items ({order.items.length})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Est. Delivery: {formatDate(order.estimatedDelivery)}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <div key={idx} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {item.name} x{item.quantity} {item.unit}
                        </span>
                        <span className="font-medium">
                          {formatPrice(item.total)}
                        </span>
                      </div>
                    ))}
                    {order.items.length > 2 && (
                      <p className="text-xs text-muted-foreground">
                        +{order.items.length - 2} more items
                      </p>
                    )}
                  </div>
                </div>

                {/* Tracking Info */}
                {order.trackingNumber && (
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Truck className="h-4 w-4 text-purple-600" />
                        <div>
                          <p className="text-xs font-medium text-purple-800">
                            Tracking Number
                          </p>
                          <p className="text-xs text-purple-600 font-mono">
                            {order.trackingNumber}
                          </p>
                          {order.carrier && (
                            <p className="text-xs text-purple-600">
                              Carrier: {order.carrier}
                            </p>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs bg-white"
                      >
                        Track Shipment
                      </Button>
                    </div>
                  </div>
                )}

                {/* Delivery Confirmation */}
                {order.status === "delivered" && (
                  <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <div>
                          <p className="text-xs font-medium text-green-800">
                            Delivered
                          </p>
                          <p className="text-xs text-green-700">
                            Received by: {order.receivedBy} on{" "}
                            {formatDate(order.receivedDate || "")}
                          </p>
                        </div>
                      </div>
                      {order.rating ? (
                        <div className="flex items-center gap-1 bg-white px-2 py-1 rounded">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs font-medium">
                            {order.rating}
                          </span>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs bg-white"
                        >
                          Rate Order
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Cancellation Info */}
                {order.status === "cancelled" && (
                  <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <XCircle className="h-4 w-4 text-red-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-red-800">
                          Order Cancelled
                        </p>
                        <p className="text-xs text-red-700">
                          Reason: {order.cancellationReason}
                        </p>
                        {order.cancelledDate && (
                          <p className="text-xs text-red-600 mt-1">
                            Cancelled on: {formatDate(order.cancelledDate)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50">
                      Payment: {order.paymentTerms}
                    </Badge>
                    {order.notes && (
                      <Badge variant="outline" className="bg-amber-50">
                        Has Notes
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === "pending" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowCancelDialog(true);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Cancel Order
                      </Button>
                    )}

                    {order.status === "delivered" && !order.rating && (
                      <Button size="sm" variant="outline">
                        <Star className="h-4 w-4 mr-2" />
                        Rate & Review
                      </Button>
                    )}

                    {order.status === "delivered" && (
                      <Button size="sm" variant="outline" asChild>
                        <Link
                          to={`/distributor/factory-products?reorder=${order.id}`}
                        >
                          <Repeat className="h-4 w-4 mr-2" />
                          Reorder
                        </Link>
                      </Button>
                    )}

                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowOrderDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>

                    {order.invoiceUrl && (
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                        <FileText className="h-4 w-4" />
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Printer className="h-4 w-4 mr-2" />
                          Print Order
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Download className="h-4 w-4 mr-2" />
                          Download Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Phone className="h-4 w-4 mr-2" />
                          Contact Factory
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-6">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((prev) => Math.max(prev - 1, 1));
                    }}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }).map((_, i) => {
                  const pageNumber = i + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 &&
                      pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationLink
                          href="#"
                          isActive={currentPage === pageNumber}
                          onClick={(e) => {
                            e.preventDefault();
                            setCurrentPage(pageNumber);
                          }}
                        >
                          {pageNumber}
                        </PaginationLink>
                      </PaginationItem>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return (
                      <PaginationItem key={pageNumber}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }
                  return null;
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages));
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      )}

      {/* Order Details Dialog */}
      <Dialog open={showOrderDialog} onOpenChange={setShowOrderDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Factory Order Details - {selectedOrder?.poNumber}
            </DialogTitle>
            <DialogDescription>
              Complete order information and factory details
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6 py-2">
                {/* Factory Information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Factory className="h-4 w-4" />
                    Factory Information
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Factory Name
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.factoryName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Contact Person
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.factoryContact}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Phone
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.factoryPhone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Location
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.factoryLocation}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Information
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        PO Number
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.poNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Order Date
                      </span>
                      <span className="text-xs font-medium">
                        {formatDateTime(selectedOrder.orderDate)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Requested Delivery
                      </span>
                      <span className="text-xs font-medium">
                        {formatDate(selectedOrder.requestedDelivery)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Estimated Delivery
                      </span>
                      <span className="text-xs font-medium">
                        {formatDate(selectedOrder.estimatedDelivery)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Payment Terms
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.paymentTerms}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Items
                  </h4>
                  <div className="space-y-2">
                    {selectedOrder.items.map((item, idx) => (
                      <div key={idx} className="bg-muted/50 rounded-lg p-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                          <span className="text-sm font-bold">
                            {formatPrice(item.total)}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>SKU: {item.sku}</span>
                          <span>
                            {item.quantity} {item.unit} ×{" "}
                            {formatPrice(item.price)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Order Summary</h4>
                  <div className="bg-primary/5 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span>{formatPrice(selectedOrder.shipping)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">VAT (15%)</span>
                      <span>{formatPrice(selectedOrder.tax)}</span>
                    </div>
                    <Separator className="my-2" />
                    <div className="flex justify-between text-base font-bold">
                      <span>Total</span>
                      <span className="text-primary">
                        {formatPrice(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedOrder.notes && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Notes</h4>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowOrderDialog(false)}>
              Close
            </Button>
            <Button asChild>
              <Link to={`/distributor/factory-orders/${selectedOrder?.id}`}>
                View Full Order
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Order Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Factory Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel order {selectedOrder?.poNumber}{" "}
              from {selectedOrder?.factoryName}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select
              value={cancellationReason}
              onValueChange={setCancellationReason}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select cancellation reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Changed requirements">
                  Changed requirements
                </SelectItem>
                <SelectItem value="Found better price">
                  Found better price
                </SelectItem>
                <SelectItem value="Delivery too late">
                  Delivery too late
                </SelectItem>
                <SelectItem value="Ordered by mistake">
                  Ordered by mistake
                </SelectItem>
                <SelectItem value="Supplier issue">Supplier issue</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {cancellationReason === "Other" && (
              <Input
                className="mt-3"
                placeholder="Enter cancellation reason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
              />
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Order</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedOrder && cancelOrder(selectedOrder.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={!cancellationReason}
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FactoryOrdersPage;
