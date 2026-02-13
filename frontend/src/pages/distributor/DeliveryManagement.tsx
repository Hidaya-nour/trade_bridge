import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Truck,
  Package,
  Search,
  Filter,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Phone,
  User,
  Calendar,
  MoreVertical,
  Navigation,
  CheckCheck,
  Download,
  Eye,
  Edit,
  Plus,
  Star,
  Store,
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
  DialogTrigger,
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
import { Label } from "@/components/ui/label";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Delivery {
  id: string;
  orderId: string;
  retailerId: number;
  retailerName: string;
  retailerContact: string;
  retailerPhone: string;
  retailerLocation: string;
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
  driverId?: number;
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
}

interface Driver {
  id: number;
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

// ============================================================================
// MOCK DATA
// ============================================================================

const deliveries: Delivery[] = [
  {
    id: "DEL-2026-0892",
    orderId: "ORD-2026-0241",
    retailerId: 205,
    retailerName: "Bole Superstore",
    retailerContact: "Meron Assefa",
    retailerPhone: "+251 94 567 8901",
    retailerLocation: "Addis Ababa, Bole",
    deliveryAddress: "Bole Road, Near Edna Mall, Addis Ababa",
    items: [
      { name: "Cotton Fabric", quantity: 200, unit: "meter" },
      { name: "Yirgacheffe Coffee", quantity: 10, unit: "kg" },
    ],
    totalItems: 210,
    totalWeight: "45 kg",
    status: "in-transit",
    priority: "medium",
    scheduledDate: "2026-02-13",
    scheduledTime: "14:00",
    estimatedDelivery: "2026-02-13 16:30",
    driverId: 301,
    driverName: "Abebe Kebede",
    driverPhone: "+251 91 234 5678",
    vehicleType: "Truck",
    licensePlate: "AA-1234-AB",
    trackingNumber: "TRK-7885-02",
    currentLocation: "Bole, Addis Ababa",
    lastUpdate: "2026-02-13 14:30",
  },
  {
    id: "DEL-2026-0891",
    orderId: "ORD-2026-0238",
    retailerId: 203,
    retailerName: "City Supermarket",
    retailerContact: "Almaz Worku",
    retailerPhone: "+251 92 345 6789",
    retailerLocation: "Adama, Awash Sefer",
    deliveryAddress: "Awash Sefer, Near Bus Station, Adama",
    items: [
      { name: "Cement", quantity: 100, unit: "bag" },
      { name: "Steel Rebars", quantity: 5, unit: "ton" },
    ],
    totalItems: 105,
    totalWeight: "5,200 kg",
    status: "assigned",
    priority: "high",
    scheduledDate: "2026-02-13",
    scheduledTime: "10:00",
    estimatedDelivery: "2026-02-13 13:00",
    driverId: 302,
    driverName: "Tigist Haile",
    driverPhone: "+251 92 345 6789",
    vehicleType: "Flatbed Truck",
    licensePlate: "AA-5678-CD",
    trackingNumber: "TRK-7891-01",
  },
  {
    id: "DEL-2026-0890",
    orderId: "ORD-2026-0235",
    retailerId: 202,
    retailerName: "Mega Mart",
    retailerContact: "Tsegaye Mulugeta",
    retailerPhone: "+251 91 876 5432",
    retailerLocation: "Addis Ababa, Bole",
    deliveryAddress: "Bole, Dembel City Center, Addis Ababa",
    items: [
      { name: "Yirgacheffe Coffee", quantity: 15, unit: "kg" },
      { name: "Macadamia Nuts", quantity: 20, unit: "kg" },
      { name: "Pure Honey", quantity: 24, unit: "jar" },
      { name: "White Teff Flour", quantity: 50, unit: "kg" },
    ],
    totalItems: 109,
    totalWeight: "120 kg",
    status: "pending",
    priority: "high",
    scheduledDate: "2026-02-13",
    scheduledTime: "11:30",
    estimatedDelivery: "2026-02-13 15:00",
    notes: "Customer requested delivery to loading dock at rear of building",
  },
  {
    id: "DEL-2026-0889",
    orderId: "ORD-2026-0232",
    retailerId: 204,
    retailerName: "Addis Mart",
    retailerContact: "Biruk Haile",
    retailerPhone: "+251 93 456 7890",
    retailerLocation: "Addis Ababa, Merkato",
    deliveryAddress: "Merkato, Addis Ababa",
    items: [
      { name: "Plastic Chairs", quantity: 100, unit: "piece" },
      { name: "Notebooks", quantity: 500, unit: "piece" },
    ],
    totalItems: 600,
    totalWeight: "350 kg",
    status: "delivered",
    priority: "low",
    scheduledDate: "2026-02-12",
    scheduledTime: "09:00",
    estimatedDelivery: "2026-02-12 12:00",
    actualDelivery: "2026-02-12 11:45",
    driverId: 301,
    driverName: "Abebe Kebede",
    driverPhone: "+251 91 234 5678",
    trackingNumber: "TRK-7889-01",
    signature: "Biruk Haile",
    proofOfDelivery: "signature_7889.png",
  },
  {
    id: "DEL-2026-0888",
    orderId: "ORD-2026-0230",
    retailerId: 206,
    retailerName: "Hawassa Wholesale",
    retailerContact: "Dawit Tadesse",
    retailerPhone: "+251 95 678 9012",
    retailerLocation: "Hawassa, Main Market",
    deliveryAddress: "Main Market, Hawassa",
    items: [
      { name: "White Teff Flour", quantity: 200, unit: "kg" },
      { name: "Soybean Oil", quantity: 100, unit: "liter" },
      { name: "Tomato Paste", quantity: 200, unit: "can" },
    ],
    totalItems: 500,
    totalWeight: "450 kg",
    status: "failed",
    priority: "medium",
    scheduledDate: "2026-02-12",
    scheduledTime: "13:00",
    estimatedDelivery: "2026-02-12 16:00",
    driverId: 303,
    driverName: "Almaz Worku",
    driverPhone: "+251 93 456 7890",
    failureReason: "Customer not available at delivery location",
    notes:
      "Attempted delivery at 15:30, customer not present. Will reschedule.",
  },
  {
    id: "DEL-2026-0887",
    orderId: "ORD-2026-0228",
    retailerId: 207,
    retailerName: "Dire Dava Traders",
    retailerContact: "Fatuma Ahmed",
    retailerPhone: "+251 96 789 0123",
    retailerLocation: "Dire Dawa, Industrial Zone",
    deliveryAddress: "Industrial Zone, Dire Dawa",
    items: [
      { name: "Cement", quantity: 200, unit: "bag" },
      { name: "Steel Rebars", quantity: 8, unit: "ton" },
    ],
    totalItems: 208,
    totalWeight: "8,200 kg",
    status: "picked-up",
    priority: "high",
    scheduledDate: "2026-02-13",
    scheduledTime: "08:00",
    estimatedDelivery: "2026-02-13 18:00",
    driverId: 304,
    driverName: "Mulugeta Assefa",
    driverPhone: "+251 94 567 8901",
    vehicleType: "Heavy Truck",
    licensePlate: "DD-9012-EF",
    trackingNumber: "TRK-7887-01",
    currentLocation: "Adama, Oromia",
    lastUpdate: "2026-02-13 09:15",
  },
];

const drivers: Driver[] = [
  {
    id: 301,
    name: "Abebe Kebede",
    phone: "+251 91 234 5678",
    email: "abebe.k@tradebridge.com",
    vehicleType: "Truck",
    licensePlate: "AA-1234-AB",
    status: "on-delivery",
    currentLocation: "Bole, Addis Ababa",
    deliveriesToday: 3,
    deliveriesCompleted: 1,
    rating: 4.8,
  },
  {
    id: 302,
    name: "Tigist Haile",
    phone: "+251 92 345 6789",
    email: "tigist.h@tradebridge.com",
    vehicleType: "Flatbed Truck",
    licensePlate: "AA-5678-CD",
    status: "on-delivery",
    currentLocation: "Adama",
    deliveriesToday: 2,
    deliveriesCompleted: 0,
    rating: 4.9,
  },
  {
    id: 303,
    name: "Almaz Worku",
    phone: "+251 93 456 7890",
    email: "almaz.w@tradebridge.com",
    vehicleType: "Truck",
    licensePlate: "AA-9012-EF",
    status: "available",
    currentLocation: "Adama Depot",
    deliveriesToday: 1,
    deliveriesCompleted: 0,
    rating: 4.7,
  },
  {
    id: 304,
    name: "Mulugeta Assefa",
    phone: "+251 94 567 8901",
    email: "mulugeta.a@tradebridge.com",
    vehicleType: "Heavy Truck",
    licensePlate: "DD-9012-EF",
    status: "on-delivery",
    currentLocation: "Adama - Bishoftu",
    deliveriesToday: 2,
    deliveriesCompleted: 0,
    rating: 4.6,
  },
  {
    id: 305,
    name: "Eyerusalem Tsegaye",
    phone: "+251 95 678 9012",
    email: "eyerusalem.t@tradebridge.com",
    vehicleType: "Van",
    licensePlate: "AA-3456-GH",
    status: "off-duty",
    currentLocation: "Addis Ababa",
    deliveriesToday: 0,
    deliveriesCompleted: 0,
    rating: 4.9,
  },
];

// ============================================================================
// CONSTANTS
// ============================================================================

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  assigned: "bg-blue-100 text-blue-800 border-blue-200",
  "picked-up": "bg-indigo-100 text-indigo-800 border-indigo-200",
  "in-transit": "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
};

const priorityColors = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-green-100 text-green-800 border-green-200",
};

const driverStatusColors = {
  available: "bg-green-100 text-green-800",
  "on-delivery": "bg-blue-100 text-blue-800",
  "off-duty": "bg-gray-100 text-gray-800",
  "on-break": "bg-amber-100 text-amber-800",
};

// ============================================================================
// COMPONENT
// ============================================================================

const DeliveryManagementPage: React.FC = () => {
  const [deliveryList, setDeliveryList] = useState<Delivery[]>(deliveries);
  const [driverList] = useState<Driver[]>(drivers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null,
  );
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("deliveries");
  const itemsPerPage = 5;

  // Filter deliveries
  const filteredDeliveries = deliveryList.filter((delivery) => {
    const matchesSearch =
      searchQuery === "" ||
      delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.retailerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.driverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      false;

    const matchesStatus =
      statusFilter === "all" || delivery.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Sort deliveries by scheduled date
  const sortedDeliveries = [...filteredDeliveries].sort(
    (a, b) =>
      new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime(),
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentDeliveries = sortedDeliveries.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(sortedDeliveries.length / itemsPerPage);

  // Stats
  const pendingDeliveries = deliveryList.filter(
    (d) => d.status === "pending",
  ).length;
  const inTransitDeliveries = deliveryList.filter((d) =>
    ["assigned", "picked-up", "in-transit"].includes(d.status),
  ).length;
  const completedToday = deliveryList.filter(
    (d) =>
      d.status === "delivered" &&
      d.actualDelivery?.startsWith(new Date().toISOString().split("T")[0]),
  ).length;
  const availableDrivers = driverList.filter(
    (d) => d.status === "available",
  ).length;

  const assignDriver = (deliveryId: string) => {
    const driver = driverList.find((d) => d.id.toString() === selectedDriver);
    if (!driver) return;

    setDeliveryList((prev) =>
      prev.map((d) =>
        d.id === deliveryId
          ? {
              ...d,
              status: "assigned",
              driverId: driver.id,
              driverName: driver.name,
              driverPhone: driver.phone,
              vehicleType: driver.vehicleType,
              licensePlate: driver.licensePlate,
            }
          : d,
      ),
    );
    setShowAssignDialog(false);
    setSelectedDriver("");
    setSelectedDelivery(null);
  };

  const updateDeliveryStatus = (
    deliveryId: string,
    status: Delivery["status"],
  ) => {
    setDeliveryList((prev) =>
      prev.map((d) =>
        d.id === deliveryId
          ? {
              ...d,
              status,
              lastUpdate: new Date().toISOString(),
              ...(status === "delivered"
                ? {
                    actualDelivery: new Date().toISOString(),
                  }
                : {}),
            }
          : d,
      ),
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatTime = (timeString: string) => {
    return timeString;
  };

  const formatDateTime = (dateTimeString: string) => {
    return new Date(dateTimeString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
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
              Delivery Management
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <Truck className="h-3 w-3 mr-1" />
              {deliveryList.length} Deliveries
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Track, assign, and manage all deliveries to retailers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Delivery
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          <TabsTrigger value="drivers">Drivers</TabsTrigger>
          <TabsTrigger value="tracking">Live Tracking</TabsTrigger>
        </TabsList>

        {/* ===== DELIVERIES TAB ===== */}
        <TabsContent value="deliveries" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by delivery ID, order ID, retailer..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Delivery Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="assigned">Assigned</SelectItem>
                      <SelectItem value="picked-up">Picked Up</SelectItem>
                      <SelectItem value="in-transit">In Transit</SelectItem>
                      <SelectItem value="delivered">Delivered</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
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
              {Math.min(indexOfLastItem, sortedDeliveries.length)} of{" "}
              {sortedDeliveries.length} deliveries
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Truck className="h-3 w-3 mr-1" />
              {sortedDeliveries.length} deliveries
            </Badge>
          </div>

          {/* Deliveries List */}
          {sortedDeliveries.length === 0 ? (
            <Card className="py-12">
              <div className="text-center">
                <Truck className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No deliveries found
                </h3>
                <p className="text-muted-foreground mb-4">
                  No deliveries match your current filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-4">
              {currentDeliveries.map((delivery) => (
                <Card
                  key={delivery.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    {/* Delivery Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            delivery.status === "pending"
                              ? "bg-yellow-100"
                              : delivery.status === "assigned"
                                ? "bg-blue-100"
                                : delivery.status === "picked-up"
                                  ? "bg-indigo-100"
                                  : delivery.status === "in-transit"
                                    ? "bg-purple-100"
                                    : delivery.status === "delivered"
                                      ? "bg-green-100"
                                      : "bg-red-100",
                          )}
                        >
                          <Truck
                            className={cn(
                              "h-5 w-5",
                              delivery.status === "pending"
                                ? "text-yellow-600"
                                : delivery.status === "assigned"
                                  ? "text-blue-600"
                                  : delivery.status === "picked-up"
                                    ? "text-indigo-600"
                                    : delivery.status === "in-transit"
                                      ? "text-purple-600"
                                      : delivery.status === "delivered"
                                        ? "text-green-600"
                                        : "text-red-600",
                            )}
                          />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/distributor/delivery/${delivery.id}`}
                              className="text-lg font-semibold hover:text-primary"
                            >
                              {delivery.id}
                            </Link>
                            <Badge
                              variant="outline"
                              className={statusColors[delivery.status]}
                            >
                              {delivery.status.charAt(0).toUpperCase() +
                                delivery.status.slice(1)}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={priorityColors[delivery.priority]}
                            >
                              {delivery.priority.charAt(0).toUpperCase() +
                                delivery.priority.slice(1)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-sm font-medium">
                              Order: {delivery.orderId}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <Store className="h-3 w-3 mr-1" />
                              {delivery.retailerName}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {delivery.retailerLocation}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 lg:flex-col lg:items-end">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDate(delivery.scheduledDate)}{" "}
                            {delivery.scheduledTime}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Delivery Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">
                          Items
                        </p>
                        <p className="text-sm font-medium">
                          {delivery.totalItems} units
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {delivery.totalWeight}
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">
                          Driver
                        </p>
                        {delivery.driverName ? (
                          <>
                            <p className="text-sm font-medium">
                              {delivery.driverName}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {delivery.vehicleType}
                            </p>
                          </>
                        ) : (
                          <p className="text-sm text-yellow-600">
                            Not assigned
                          </p>
                        )}
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">
                          Contact
                        </p>
                        <p className="text-sm font-medium">
                          {delivery.retailerContact}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {delivery.retailerPhone}
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-xs text-muted-foreground mb-1">
                          Est. Delivery
                        </p>
                        <p className="text-sm font-medium">
                          {formatDateTime(delivery.estimatedDelivery)}
                        </p>
                        {delivery.actualDelivery && (
                          <p className="text-xs text-green-600 mt-1">
                            Delivered: {formatDateTime(delivery.actualDelivery)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Current Location (if in transit) */}
                    {delivery.currentLocation && (
                      <div className="bg-purple-50 border border-purple-100 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2">
                          <Navigation className="h-4 w-4 text-purple-600" />
                          <div className="flex-1">
                            <p className="text-xs font-medium text-purple-800">
                              Current Location
                            </p>
                            <p className="text-xs text-purple-700">
                              {delivery.currentLocation}
                            </p>
                          </div>
                          <span className="text-xs text-purple-600">
                            Last update:{" "}
                            {formatDateTime(delivery.lastUpdate || "")}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Failure Reason */}
                    {delivery.status === "failed" && delivery.failureReason && (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600 mt-0.5" />
                          <div>
                            <p className="text-xs font-medium text-red-800">
                              Delivery Failed
                            </p>
                            <p className="text-xs text-red-700">
                              {delivery.failureReason}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t">
                      <div className="flex items-center gap-2">
                        {delivery.trackingNumber && (
                          <Badge variant="outline" className="bg-purple-50">
                            Tracking: {delivery.trackingNumber}
                          </Badge>
                        )}
                        {delivery.licensePlate && (
                          <Badge variant="outline" className="bg-blue-50">
                            {delivery.licensePlate}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {delivery.status === "pending" && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setShowAssignDialog(true);
                            }}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Assign Driver
                          </Button>
                        )}

                        {delivery.status === "assigned" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateDeliveryStatus(delivery.id, "picked-up")
                            }
                          >
                            <Package className="h-4 w-4 mr-2" />
                            Mark Picked Up
                          </Button>
                        )}

                        {delivery.status === "picked-up" && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              updateDeliveryStatus(delivery.id, "in-transit")
                            }
                          >
                            <Truck className="h-4 w-4 mr-2" />
                            Start Transit
                          </Button>
                        )}

                        {["assigned", "picked-up", "in-transit"].includes(
                          delivery.status,
                        ) && (
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() =>
                              updateDeliveryStatus(delivery.id, "delivered")
                            }
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Mark Delivered
                          </Button>
                        )}

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedDelivery(delivery);
                            setShowDeliveryDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Details
                        </Button>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit Delivery
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Phone className="h-4 w-4 mr-2" />
                              Contact Driver
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <MapPin className="h-4 w-4 mr-2" />
                              Live Tracking
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              <XCircle className="h-4 w-4 mr-2" />
                              Cancel Delivery
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
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages),
                          );
                        }}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              )}
            </div>
          )}
        </TabsContent>

        {/* ===== DRIVERS TAB ===== */}
        <TabsContent value="drivers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {driverList.map((driver) => (
              <Card
                key={driver.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {getInitials(driver.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{driver.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={driverStatusColors[driver.status]}>
                            {driver.status.replace("-", " ")}
                          </Badge>
                          <div className="flex items-center">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs ml-1">
                              {driver.rating}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{driver.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {driver.vehicleType} • {driver.licensePlate}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{driver.currentLocation}</span>
                    </div>
                  </div>

                  <div className="bg-muted/50 rounded-lg p-3 mb-4">
                    <div className="flex justify-between mb-2">
                      <span className="text-xs text-muted-foreground">
                        Today's Deliveries
                      </span>
                      <span className="text-sm font-medium">
                        {driver.deliveriesCompleted}/{driver.deliveriesToday}
                      </span>
                    </div>
                    <Progress
                      value={
                        driver.deliveriesToday > 0
                          ? (driver.deliveriesCompleted /
                              driver.deliveriesToday) *
                            100
                          : 0
                      }
                      className="h-1.5"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Phone className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1">
                      <Navigation className="h-4 w-4 mr-2" />
                      Track
                    </Button>
                    {driver.status === "available" && (
                      <Button
                        size="sm"
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Assign
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* ===== LIVE TRACKING TAB ===== */}
        <TabsContent value="tracking" className="space-y-4">
          <Card className="p-6">
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center">
                  <Navigation className="h-10 w-10 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Live Tracking Map</h3>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Real-time GPS tracking for all active deliveries. View driver
                locations, routes, and estimated arrival times.
              </p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Open Live Tracking Map
              </Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assign Driver Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
            <DialogDescription>
              Select a driver to assign to delivery {selectedDelivery?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Available Drivers</Label>
              <Select value={selectedDriver} onValueChange={setSelectedDriver}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a driver" />
                </SelectTrigger>
                <SelectContent>
                  {driverList
                    .filter((d) => d.status === "available")
                    .map((driver) => (
                      <SelectItem key={driver.id} value={driver.id.toString()}>
                        <div className="flex items-center justify-between w-full">
                          <span>{driver.name}</span>
                          <span className="text-xs text-muted-foreground ml-2">
                            {driver.vehicleType} • {driver.licensePlate}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {selectedDriver && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-blue-800 mb-1">
                  Delivery Summary
                </p>
                <p className="text-xs text-blue-700">
                  Order: {selectedDelivery?.orderId}
                  <br />
                  Retailer: {selectedDelivery?.retailerName}
                  <br />
                  Address: {selectedDelivery?.deliveryAddress}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedDelivery && assignDriver(selectedDelivery.id)
              }
              disabled={!selectedDriver}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Assign Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Details Dialog */}
      <Dialog open={showDeliveryDialog} onOpenChange={setShowDeliveryDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Delivery Details - {selectedDelivery?.id}</DialogTitle>
            <DialogDescription>Complete delivery information</DialogDescription>
          </DialogHeader>

          {selectedDelivery && (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6 py-2">
                {/* Order Information */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Package className="h-4 w-4" />
                    Order Information
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Order ID
                      </span>
                      <span className="text-xs font-medium">
                        {selectedDelivery.orderId}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Items
                      </span>
                      <span className="text-xs font-medium">
                        {selectedDelivery.totalItems} units
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Total Weight
                      </span>
                      <span className="text-xs font-medium">
                        {selectedDelivery.totalWeight}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Delivery Address
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-3">
                    <p className="text-sm">
                      {selectedDelivery.deliveryAddress}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedDelivery.retailerContact} •{" "}
                      {selectedDelivery.retailerPhone}
                    </p>
                  </div>
                </div>

                {/* Items List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Items</h4>
                  <div className="space-y-2">
                    {selectedDelivery.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="bg-muted/50 rounded-lg p-2 flex justify-between"
                      >
                        <span className="text-sm">{item.name}</span>
                        <span className="text-sm font-medium">
                          {item.quantity} {item.unit}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Timeline */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Timeline</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Scheduled</span>
                      <span>
                        {formatDate(selectedDelivery.scheduledDate)}{" "}
                        {selectedDelivery.scheduledTime}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">
                        Estimated Delivery
                      </span>
                      <span>
                        {formatDateTime(selectedDelivery.estimatedDelivery)}
                      </span>
                    </div>
                    {selectedDelivery.actualDelivery && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Delivered</span>
                        <span>
                          {formatDateTime(selectedDelivery.actualDelivery)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeliveryDialog(false)}
            >
              Close
            </Button>
            <Button asChild>
              <Link to={`/distributor/delivery/${selectedDelivery?.id}`}>
                View Full Details
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DeliveryManagementPage;
