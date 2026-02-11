import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Package,
  ShoppingCart,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  Calendar,
  Download,
  Eye,
  RotateCcw,
  Star,
  FileText,
  CreditCard,
  Store,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";

// Mock orders data
const allOrders = [
  {
    id: "TB-2026-0892",
    date: "2026-02-10T10:30:00",
    supplier: "Ethiopia Coffee Export",
    supplierId: 101,
    supplierAvatar: "EC",
    items: [
      { name: "Yirgacheffe Coffee", quantity: 15, unit: "kg", price: 450 },
    ],
    total: 12500,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Credit",
    tracking: "TRK-7892-01",
    estimatedDelivery: "2026-02-13",
    actualDelivery: "2026-02-12",
    rating: 5,
    review: "Excellent quality coffee, fast delivery!",
  },
  {
    id: "TB-2026-0885",
    date: "2026-02-09T14:15:00",
    supplier: "Adama Wholesalers",
    supplierId: 102,
    supplierAvatar: "AW",
    items: [
      { name: "White Teff Flour", quantity: 50, unit: "kg", price: 120 },
      { name: "Soybean Oil", quantity: 30, unit: "liter", price: 180 },
    ],
    total: 11400,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Mobile Banking",
    tracking: "TRK-7885-02",
    estimatedDelivery: "2026-02-14",
    actualDelivery: null,
    rating: null,
    review: null,
  },
  {
    id: "TB-2026-0878",
    date: "2026-02-08T09:45:00",
    supplier: "Ethiopian Textile",
    supplierId: 103,
    supplierAvatar: "ET",
    items: [
      { name: "Cotton Fabric", quantity: 100, unit: "meter", price: 320 },
    ],
    total: 32000,
    status: "processing",
    paymentStatus: "paid",
    paymentMethod: "Credit",
    tracking: "TRK-7878-03",
    estimatedDelivery: "2026-02-15",
    actualDelivery: null,
    rating: null,
    review: null,
  },
  {
    id: "TB-2026-0862",
    date: "2026-02-07T11:20:00",
    supplier: "Bahir Dar Honey",
    supplierId: 104,
    supplierAvatar: "BH",
    items: [
      { name: "Pure Honey", quantity: 24, unit: "jar", price: 280 },
    ],
    total: 6720,
    status: "pending",
    paymentStatus: "pending",
    paymentMethod: "Cash on Delivery",
    tracking: null,
    estimatedDelivery: "2026-02-16",
    actualDelivery: null,
    rating: null,
    review: null,
  },
  {
    id: "TB-2026-0851",
    date: "2026-02-06T16:30:00",
    supplier: "Mekelle Steel",
    supplierId: 105,
    supplierAvatar: "MS",
    items: [
      { name: "Steel Rebars", quantity: 10, unit: "ton", price: 8500 },
    ],
    total: 85000,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Credit",
    tracking: "TRK-7851-04",
    estimatedDelivery: "2026-02-12",
    actualDelivery: "2026-02-11",
    rating: 4,
    review: "Good quality steel, delivered on time.",
  },
  {
    id: "TB-2026-0834",
    date: "2026-02-05T13:10:00",
    supplier: "Adama Wholesalers",
    supplierId: 102,
    supplierAvatar: "AW",
    items: [
      { name: "Tomato Paste", quantity: 200, unit: "can", price: 85 },
      { name: "White Teff Flour", quantity: 25, unit: "kg", price: 120 },
    ],
    total: 20000,
    status: "cancelled",
    paymentStatus: "refunded",
    paymentMethod: "Credit",
    tracking: null,
    estimatedDelivery: "2026-02-10",
    actualDelivery: null,
    rating: null,
    review: null,
    cancellationReason: "Out of stock",
  },
  {
    id: "TB-2026-0821",
    date: "2026-02-04T10:00:00",
    supplier: "Ethiopia Coffee Export",
    supplierId: 101,
    supplierAvatar: "EC",
    items: [
      { name: "Macadamia Nuts", quantity: 40, unit: "kg", price: 650 },
    ],
    total: 26000,
    status: "delivered",
    paymentStatus: "paid",
    paymentMethod: "Mobile Banking",
    tracking: "TRK-7821-05",
    estimatedDelivery: "2026-02-09",
    actualDelivery: "2026-02-08",
    rating: 5,
    review: "Premium quality nuts, will order again!",
  },
  {
    id: "TB-2026-0810",
    date: "2026-02-03T15:45:00",
    supplier: "Mugher Cement",
    supplierId: 108,
    supplierAvatar: "MC",
    items: [
      { name: "Cement", quantity: 200, unit: "bag", price: 620 },
    ],
    total: 124000,
    status: "shipped",
    paymentStatus: "paid",
    paymentMethod: "Credit",
    tracking: "TRK-7810-06",
    estimatedDelivery: "2026-02-14",
    actualDelivery: null,
    rating: null,
    review: null,
  },
];

const getStatusConfig = (status: string) => {
  switch (status) {
    case "delivered":
      return {
        label: "Delivered",
        icon: CheckCircle2,
        color: "bg-green-100 text-green-700 border-green-200",
        progress: 100,
      };
    case "shipped":
      return {
        label: "Shipped",
        icon: Truck,
        color: "bg-blue-100 text-blue-700 border-blue-200",
        progress: 75,
      };
    case "processing":
      return {
        label: "Processing",
        icon: Clock,
        color: "bg-amber-100 text-amber-700 border-amber-200",
        progress: 50,
      };
    case "pending":
      return {
        label: "Pending",
        icon: AlertCircle,
        color: "bg-gray-100 text-gray-700 border-gray-200",
        progress: 25,
      };
    case "cancelled":
      return {
        label: "Cancelled",
        icon: XCircle,
        color: "bg-red-100 text-red-700 border-red-200",
        progress: 0,
      };
    default:
      return {
        label: status,
        icon: AlertCircle,
        color: "bg-gray-100 text-gray-700 border-gray-200",
        progress: 0,
      };
  }
};

const OrdersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Filter orders
  const filteredOrders = allOrders.filter((order) => {
    // Search filter
    const matchesSearch = searchQuery === "" ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    // Date filter (mock)
    const matchesDate = dateFilter === "all" || true;
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);

  // Stats
  const totalSpent = allOrders
    .filter(o => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  
  const pendingOrders = allOrders.filter(o => o.status === "pending").length;
  const processingOrders = allOrders.filter(o => o.status === "processing").length;
  const shippedOrders = allOrders.filter(o => o.status === "shipped").length;
  const deliveredOrders = allOrders.filter(o => o.status === "delivered").length;

  const formatPrice = (price: number) => {
    return `ETB ${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Orders</h1>
          <p className="text-muted-foreground mt-1">
            Track and manage all your orders in one place
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="px-3 py-1">
            <Package className="h-3.5 w-3.5 mr-1" />
            Total Orders: {allOrders.length}
          </Badge>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Spent</p>
                <p className="text-lg font-bold mt-1">{formatPrice(totalSpent)}</p>
              </div>
              <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Pending</p>
                <p className="text-lg font-bold mt-1">{pendingOrders}</p>
              </div>
              <div className="h-8 w-8 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Processing</p>
                <p className="text-lg font-bold mt-1">{processingOrders}</p>
              </div>
              <div className="h-8 w-8 bg-amber-100 rounded-full flex items-center justify-center">
                <Package className="h-4 w-4 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Shipped</p>
                <p className="text-lg font-bold mt-1">{shippedOrders}</p>
              </div>
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="h-4 w-4 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Delivered</p>
                <p className="text-lg font-bold mt-1">{deliveredOrders}</p>
              </div>
              <div className="h-8 w-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by order ID or supplier..."
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
                  <SelectItem value="all">All Orders</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="3months">Last 3 Months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Tabs */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Orders</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="processing">Processing</TabsTrigger>
          <TabsTrigger value="shipped">Shipped</TabsTrigger>
          <TabsTrigger value="delivered">Delivered</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {currentOrders.length === 0 ? (
            <Card className="py-12">
              <div className="text-center">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or browse products to place your first order
                </p>
                <Button asChild>
                  <Link to="/retailer/products">
                    Browse Products
                  </Link>
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {currentOrders.map((order) => {
                const status = getStatusConfig(order.status);
                const StatusIcon = status.icon;
                
                return (
                  <Card key={order.id} className="overflow-hidden hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      {/* Order Header */}
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-full ${status.color.split(" ")[0]}`}>
                            <StatusIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <Link 
                                to={`/retailer/orders/${order.id}`}
                                className="text-lg font-semibold hover:text-primary"
                              >
                                {order.id}
                              </Link>
                              <Badge variant="outline" className={status.color}>
                                {status.label}
                              </Badge>
                              <Badge variant="outline" className={
                                order.paymentStatus === "paid" 
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : order.paymentStatus === "refunded"
                                  ? "bg-gray-100 text-gray-700 border-gray-200"
                                  : "bg-amber-100 text-amber-700 border-amber-200"
                              }>
                                {order.paymentStatus === "paid" ? "Paid" : 
                                 order.paymentStatus === "refunded" ? "Refunded" : "Pending"}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6">
                                  <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                    {order.supplierAvatar}
                                  </AvatarFallback>
                                </Avatar>
                                <Link 
                                  to={`/retailer/suppliers/${order.supplierId}`}
                                  className="text-sm text-muted-foreground hover:text-primary"
                                >
                                  {order.supplier}
                                </Link>
                              </div>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground">
                                Ordered: {formatDate(order.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-primary">
                            {formatPrice(order.total)}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </p>
                        </div>
                      </div>

                      {/* Order Items Preview */}
                      <div className="bg-muted/50 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs font-medium">Order Items</span>
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
                                {formatPrice(item.price * item.quantity)}
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

                      {/* Tracking Progress */}
                      {order.status !== "cancelled" && order.status !== "delivered" && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium">Order Progress</span>
                            <span className="text-xs text-muted-foreground">
                              {status.progress}%
                            </span>
                          </div>
                          <Progress value={status.progress} className="h-2" />
                          <div className="flex justify-between mt-1">
                            <span className="text-[10px] text-muted-foreground">Ordered</span>
                            <span className="text-[10px] text-muted-foreground">Processing</span>
                            <span className="text-[10px] text-muted-foreground">Shipped</span>
                            <span className="text-[10px] text-muted-foreground">Delivered</span>
                          </div>
                        </div>
                      )}

                      {/* Tracking Info */}
                      {order.tracking && (
                        <div className="flex items-center gap-2 text-sm bg-blue-50 text-blue-700 p-3 rounded-lg mb-4">
                          <Truck className="h-4 w-4" />
                          <span className="flex-1 text-xs">
                            Tracking Number: <span className="font-mono">{order.tracking}</span>
                          </span>
                          <Button variant="link" size="sm" className="h-auto p-0 text-xs" asChild>
                            <Link to={`/retailer/tracking/${order.id}`}>
                              Track Order
                            </Link>
                          </Button>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap items-center gap-2 pt-2 border-t">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/retailer/orders/${order.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </Link>
                        </Button>
                        
                        {order.status === "delivered" && !order.rating && (
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/retailer/reviews?order=${order.id}`}>
                              <Star className="h-4 w-4 mr-2" />
                              Rate & Review
                            </Link>
                          </Button>
                        )}
                        
                        {order.status === "delivered" && (
                          <Button size="sm" variant="outline" asChild>
                            <Link to={`/retailer/reorder?order=${order.id}`}>
                              <RotateCcw className="h-4 w-4 mr-2" />
                              Reorder
                            </Link>
                          </Button>
                        )}
                        
                        {order.status === "pending" && (
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                            <XCircle className="h-4 w-4 mr-2" />
                            Cancel Order
                          </Button>
                        )}
                        
                        <Button size="sm" variant="ghost" className="ml-auto">
                          <FileText className="h-4 w-4 mr-2" />
                          Invoice
                        </Button>
                      </div>

                      {/* Rating Display */}
                      {order.rating && (
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-4 w-4 ${
                                    star <= order.rating
                                      ? 'fill-yellow-400 text-yellow-400'
                                      : 'text-gray-300'
                                  }`}
                                />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">
                              Your review: "{order.review}"
                            </span>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}

              {/* Pagination */}
              {totalPages > 1 && (
                <Pagination className="mt-6">
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setCurrentPage(prev => Math.max(prev - 1, 1));
                        }}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: totalPages }).map((_, i) => {
                      const pageNumber = i + 1;
                      if (
                        pageNumber === 1 ||
                        pageNumber === totalPages ||
                        (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
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
                          setCurrentPage(prev => Math.min(prev + 1, totalPages));
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </TabsContent>

        {/* Other tabs reuse the same data with filtering */}
        {["pending", "processing", "shipped", "delivered"].map((status) => (
          <TabsContent key={status} value={status}>
            <div className="space-y-4">
              {/* Similar content filtered by status */}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default OrdersPage;