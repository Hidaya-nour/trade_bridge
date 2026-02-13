import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
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
  Store,
  User,
  Calendar,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Printer,
  MoreVertical,
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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

interface OrderItem {
  name: string;
  sku: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
}

interface Order {
  id: string;
  retailerId: number;
  retailerName: string;
  retailerContact: string;
  retailerPhone: string;
  retailerLocation: string;
  orderDate: string;
  requestedDelivery: string;
  items: OrderItem[];
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
    | "cancelled";
  paymentStatus: string;
  paymentMethod: string;
  priority: "high" | "medium" | "low";
  notes?: string;
  trackingNumber?: string;
  driver?: string;
  driverId?: number;
  deliveredDate?: string;
  cancelledDate?: string;
  cancellationReason?: string;
  customerRating: number | null;
  previousOrders: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const incomingOrders: Order[] = [
  {
    id: "ORD-2026-0245",
    retailerId: 201,
    retailerName: "ABC Retail Shop",
    retailerContact: "Hidaya Nurmeika",
    retailerPhone: "+251 91 234 5678",
    retailerLocation: "Adama, Bole Road",
    orderDate: "2026-02-12T09:30:00",
    requestedDelivery: "2026-02-15",
    items: [
      {
        name: "White Teff Flour",
        sku: "TFF-001",
        quantity: 25,
        unit: "kg",
        price: 120,
        total: 3000,
      },
      {
        name: "Soybean Oil",
        sku: "OIL-002",
        quantity: 30,
        unit: "liter",
        price: 180,
        total: 5400,
      },
      {
        name: "Tomato Paste",
        sku: "TOM-003",
        quantity: 50,
        unit: "can",
        price: 85,
        total: 4250,
      },
    ],
    subtotal: 12650,
    shipping: 350,
    tax: 1897.5,
    total: 14897.5,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Credit",
    priority: "high",
    notes: "Urgent delivery requested. Business running low on stock.",
    customerRating: 4.8,
    previousOrders: 12,
  },
  {
    id: "ORD-2026-0244",
    retailerId: 202,
    retailerName: "Mega Mart",
    retailerContact: "Tsegaye Mulugeta",
    retailerPhone: "+251 91 876 5432",
    retailerLocation: "Addis Ababa, Bole",
    orderDate: "2026-02-12T08:15:00",
    requestedDelivery: "2026-02-16",
    items: [
      {
        name: "Yirgacheffe Coffee",
        sku: "COF-004",
        quantity: 15,
        unit: "kg",
        price: 450,
        total: 6750,
      },
      {
        name: "Macadamia Nuts",
        sku: "NUT-005",
        quantity: 20,
        unit: "kg",
        price: 650,
        total: 13000,
      },
      {
        name: "Pure Honey",
        sku: "HON-009",
        quantity: 24,
        unit: "jar",
        price: 280,
        total: 6720,
      },
      {
        name: "White Teff Flour",
        sku: "TFF-001",
        quantity: 50,
        unit: "kg",
        price: 120,
        total: 6000,
      },
    ],
    subtotal: 32470,
    shipping: 800,
    tax: 4870.5,
    total: 38140.5,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Mobile Banking",
    priority: "high",
    notes: "New customer, first order. Requesting credit terms.",
    customerRating: null,
    previousOrders: 0,
  },
  {
    id: "ORD-2026-0243",
    retailerId: 203,
    retailerName: "City Supermarket",
    retailerContact: "Almaz Worku",
    retailerPhone: "+251 92 345 6789",
    retailerLocation: "Adama, Awash Sefer",
    orderDate: "2026-02-11T15:45:00",
    requestedDelivery: "2026-02-14",
    items: [
      {
        name: "Cement",
        sku: "CEM-011",
        quantity: 100,
        unit: "bag",
        price: 620,
        total: 62000,
      },
      {
        name: "Steel Rebars",
        sku: "STL-010",
        quantity: 5,
        unit: "ton",
        price: 8500,
        total: 42500,
      },
    ],
    subtotal: 104500,
    shipping: 2500,
    tax: 15675,
    total: 122675,
    status: "processing",
    paymentStatus: "approved",
    paymentMethod: "Credit",
    priority: "medium",
    notes: "Construction materials for new store branch.",
    customerRating: 4.7,
    previousOrders: 8,
  },
  {
    id: "ORD-2026-0242",
    retailerId: 204,
    retailerName: "Addis Mart",
    retailerContact: "Biruk Haile",
    retailerPhone: "+251 93 456 7890",
    retailerLocation: "Addis Ababa, Merkato",
    orderDate: "2026-02-11T11:20:00",
    requestedDelivery: "2026-02-13",
    items: [
      {
        name: "Plastic Chairs",
        sku: "CHR-006",
        quantity: 100,
        unit: "piece",
        price: 450,
        total: 45000,
      },
      {
        name: "Notebooks",
        sku: "NB-007",
        quantity: 500,
        unit: "piece",
        price: 45,
        total: 22500,
      },
    ],
    subtotal: 67500,
    shipping: 1200,
    tax: 10125,
    total: 78825,
    status: "approved",
    paymentStatus: "paid",
    paymentMethod: "Credit",
    priority: "low",
    notes: "Ready for pickup. Customer will arrange transport.",
    customerRating: 4.9,
    previousOrders: 24,
  },
  {
    id: "ORD-2026-0241",
    retailerId: 205,
    retailerName: "Bole Superstore",
    retailerContact: "Meron Assefa",
    retailerPhone: "+251 94 567 8901",
    retailerLocation: "Addis Ababa, Bole",
    orderDate: "2026-02-10T14:30:00",
    requestedDelivery: "2026-02-12",
    items: [
      {
        name: "Cotton Fabric",
        sku: "FAB-008",
        quantity: 200,
        unit: "meter",
        price: 320,
        total: 64000,
      },
      {
        name: "Yirgacheffe Coffee",
        sku: "COF-004",
        quantity: 10,
        unit: "kg",
        price: 450,
        total: 4500,
      },
    ],
    subtotal: 68500,
    shipping: 1500,
    tax: 10275,
    total: 80275,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Mobile Banking",
    priority: "medium",
    notes: "Shipped via Express Delivery. Tracking: TRK-7885-02",
    trackingNumber: "TRK-7885-02",
    driver: "Abebe Kebede",
    driverId: 301,
    customerRating: 4.6,
    previousOrders: 15,
  },
  {
    id: "ORD-2026-0240",
    retailerId: 206,
    retailerName: "Hawassa Wholesale",
    retailerContact: "Dawit Tadesse",
    retailerPhone: "+251 95 678 9012",
    retailerLocation: "Hawassa, Main Market",
    orderDate: "2026-02-09T10:00:00",
    requestedDelivery: "2026-02-11",
    items: [
      {
        name: "White Teff Flour",
        sku: "TFF-001",
        quantity: 200,
        unit: "kg",
        price: 120,
        total: 24000,
      },
      {
        name: "Soybean Oil",
        sku: "OIL-002",
        quantity: 100,
        unit: "liter",
        price: 180,
        total: 18000,
      },
      {
        name: "Tomato Paste",
        sku: "TOM-003",
        quantity: 200,
        unit: "can",
        price: 85,
        total: 17000,
      },
    ],
    subtotal: 59000,
    shipping: 1800,
    tax: 8850,
    total: 69650,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Credit",
    priority: "low",
    notes: "Delivered and signed by Dawit Tadesse.",
    deliveredDate: "2026-02-11",
    customerRating: 4.8,
    previousOrders: 32,
  },
  {
    id: "ORD-2026-0239",
    retailerId: 207,
    retailerName: "Dire Dava Traders",
    retailerContact: "Fatuma Ahmed",
    retailerPhone: "+251 96 789 0123",
    retailerLocation: "Dire Dawa, Industrial Zone",
    orderDate: "2026-02-08T13:45:00",
    requestedDelivery: "2026-02-12",
    items: [
      {
        name: "Cement",
        sku: "CEM-011",
        quantity: 200,
        unit: "bag",
        price: 620,
        total: 124000,
      },
      {
        name: "Steel Rebars",
        sku: "STL-010",
        quantity: 8,
        unit: "ton",
        price: 8500,
        total: 68000,
      },
    ],
    subtotal: 192000,
    shipping: 3500,
    tax: 28800,
    total: 224300,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "Bank Transfer",
    priority: "medium",
    notes: "Cancelled by customer - found alternative supplier.",
    cancellationReason: "Customer requested cancellation",
    cancelledDate: "2026-02-09",
    customerRating: null,
    previousOrders: 5,
  },
];

// ============================================================================
// CONSTANTS
// ============================================================================

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  processing: "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

// ============================================================================
// COMPONENT
// ============================================================================

const IncomingOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>(incomingOrders);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDialog, setShowOrderDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter orders
  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.retailerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.retailerContact.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || order.status === statusFilter;
    const matchesPriority =
      priorityFilter === "all" || order.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
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
  const processingOrders = orders.filter(
    (o) => o.status === "processing",
  ).length;
  const approvedOrders = orders.filter((o) => o.status === "approved").length;
  const totalRevenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);

  const approveOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? { ...o, status: "approved", paymentStatus: "approved" }
          : o,
      ),
    );
    setShowApproveDialog(false);
    setSelectedOrder(null);
  };

  const rejectOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId
          ? {
              ...o,
              status: "cancelled",
              paymentStatus: "refunded",
              cancellationReason: rejectionReason || "Rejected by distributor",
              cancelledDate: new Date().toISOString().split("T")[0],
            }
          : o,
      ),
    );
    setShowRejectDialog(false);
    setSelectedOrder(null);
    setRejectionReason("");
  };

  const processOrder = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "processing" } : o)),
    );
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Incoming Orders
            </h1>
            {pendingOrders > 0 && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">
                {pendingOrders} Pending
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-1">
            Review and process orders from your retail customers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Select defaultValue="today">
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID, retailer name, or contact..."
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
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
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
          {sortedOrders.length} orders
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
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No orders found</h3>
            <p className="text-muted-foreground mb-4">
              No incoming orders match your current filters
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setStatusFilter("all");
                setPriorityFilter("all");
              }}
            >
              Clear filters
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
                          : order.status === "processing"
                            ? "bg-blue-100"
                            : order.status === "approved"
                              ? "bg-green-100"
                              : order.status === "shipped"
                                ? "bg-purple-100"
                                : order.status === "delivered"
                                  ? "bg-emerald-100"
                                  : "bg-red-100",
                      )}
                    >
                      {order.status === "pending" && (
                        <Clock className="h-5 w-5 text-yellow-600" />
                      )}
                      {order.status === "processing" && (
                        <Package className="h-5 w-5 text-blue-600" />
                      )}
                      {order.status === "approved" && (
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                      )}
                      {order.status === "shipped" && (
                        <Truck className="h-5 w-5 text-purple-600" />
                      )}
                      {order.status === "delivered" && (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      )}
                      {order.status === "cancelled" && (
                        <XCircle className="h-5 w-5 text-red-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link
                          to={`/distributor/orders/${order.id}`}
                          className="text-lg font-semibold hover:text-primary"
                        >
                          {order.id}
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
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {getInitials(order.retailerName)}
                            </AvatarFallback>
                          </Avatar>
                          <Link
                            to={`/distributor/retailers/${order.retailerId}`}
                            className="text-sm font-medium hover:text-primary"
                          >
                            {order.retailerName}
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
                          {order.retailerLocation.split(",")[0]}
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
                      className={
                        order.paymentStatus === "paid"
                          ? "bg-green-100 text-green-800"
                          : order.paymentStatus === "approved"
                            ? "bg-blue-100 text-blue-800"
                            : order.paymentStatus === "refunded"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {order.paymentMethod} • {order.paymentStatus}
                    </Badge>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="bg-muted/50 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium">
                      Order Items ({order.items.length})
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Requested Delivery: {formatDate(order.requestedDelivery)}
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

                {/* Customer Notes */}
                {order.notes && (
                  <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-3 mb-4">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div>
                        <p className="text-xs font-medium text-blue-800">
                          Customer Note:
                        </p>
                        <p className="text-xs text-blue-700">{order.notes}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Info & Actions */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pt-2 border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{order.retailerContact}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{order.retailerPhone}</span>
                    </div>
                    {order.customerRating && (
                      <Badge variant="outline" className="bg-yellow-50">
                        ★ {order.customerRating} • {order.previousOrders} prev
                        orders
                      </Badge>
                    )}
                    {!order.customerRating && order.previousOrders === 0 && (
                      <Badge
                        variant="outline"
                        className="bg-blue-50 text-blue-700"
                      >
                        New Customer
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {order.status === "pending" && (
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowRejectDialog(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowApproveDialog(true);
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve Order
                        </Button>
                      </>
                    )}

                    {order.status === "approved" && (
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                        onClick={() => processOrder(order.id)}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Start Processing
                      </Button>
                    )}

                    {order.status === "processing" && (
                      <Button
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700"
                        asChild
                      >
                        <Link to={`/distributor/delivery/assign/${order.id}`}>
                          <Truck className="h-4 w-4 mr-2" />
                          Assign Driver
                        </Link>
                      </Button>
                    )}

                    {order.status === "shipped" && order.trackingNumber && (
                      <Badge variant="outline" className="bg-purple-50">
                        Tracking: {order.trackingNumber}
                      </Badge>
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

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link to={`/distributor/orders/${order.id}/edit`}>
                            <Printer className="h-4 w-4 mr-2" />
                            Print Invoice
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Mail className="h-4 w-4 mr-2" />
                          Contact Customer
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="h-4 w-4 mr-2" />
                          Cancel Order
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
            <DialogTitle>Order Details - {selectedOrder?.id}</DialogTitle>
            <DialogDescription>
              Complete order information and customer details
            </DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6 py-2">
                {/* Customer Information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Store className="h-4 w-4" />
                    Customer Information
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Business Name
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.retailerName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Contact Person
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.retailerContact}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Phone
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.retailerPhone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Location
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.retailerLocation}
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
                        Payment Method
                      </span>
                      <span className="text-xs font-medium">
                        {selectedOrder.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Payment Status
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          selectedOrder.paymentStatus === "paid"
                            ? "bg-green-100 text-green-800"
                            : selectedOrder.paymentStatus === "approved"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }
                      >
                        {selectedOrder.paymentStatus}
                      </Badge>
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
                    <h4 className="text-sm font-medium">Customer Notes</h4>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        {selectedOrder.notes}
                      </p>
                    </div>
                  </div>
                )}

                {selectedOrder.cancellationReason && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-red-600">
                      Cancellation Reason
                    </h4>
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-sm text-red-800">
                        {selectedOrder.cancellationReason}
                      </p>
                      {selectedOrder.cancelledDate && (
                        <p className="text-xs text-red-600 mt-1">
                          Cancelled on:{" "}
                          {formatDate(selectedOrder.cancelledDate)}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {selectedOrder.deliveredDate && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium text-green-600">
                      Delivery Information
                    </h4>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-sm text-green-800">
                        Delivered on: {formatDate(selectedOrder.deliveredDate)}
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
              <Link to={`/distributor/orders/${selectedOrder?.id}`}>
                View Full Order
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Order Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve order {selectedOrder?.id} for{" "}
              {selectedOrder?.retailerName}?
              <div className="mt-4 p-3 bg-green-50 rounded-lg">
                <p className="text-sm font-medium text-green-800">
                  Order Total:{" "}
                  {selectedOrder && formatPrice(selectedOrder.total)}
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Approving this order will:
                </p>
                <ul className="text-xs text-green-700 list-disc list-inside mt-1">
                  <li>Confirm the order with the retailer</li>
                  <li>Apply credit terms if applicable</li>
                  <li>Move order to processing queue</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedOrder && approveOrder(selectedOrder.id)}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Order Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Order</AlertDialogTitle>
            <AlertDialogDescription>
              Please provide a reason for rejecting this order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-4">
            <Select value={rejectionReason} onValueChange={setRejectionReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select rejection reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Out of stock">Out of stock</SelectItem>
                <SelectItem value="Unable to meet delivery date">
                  Unable to meet delivery date
                </SelectItem>
                <SelectItem value="Payment verification failed">
                  Payment verification failed
                </SelectItem>
                <SelectItem value="Customer credit limit exceeded">
                  Customer credit limit exceeded
                </SelectItem>
                <SelectItem value="Pricing discrepancy">
                  Pricing discrepancy
                </SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            {rejectionReason === "Other" && (
              <Input
                className="mt-3"
                placeholder="Enter rejection reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            )}
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedOrder && rejectOrder(selectedOrder.id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={!rejectionReason}
            >
              Reject Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IncomingOrdersPage;
