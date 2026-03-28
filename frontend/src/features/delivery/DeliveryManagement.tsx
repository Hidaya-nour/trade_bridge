import React, { useEffect, useMemo, useState } from "react";
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
  Download,
  Eye,
  Edit,
  Plus,
  Star,
  Store,
  Factory,
  DollarSign,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import {
  StatusBadge,
  EmptyState,
  PaginationBar,
  SearchFilter,
} from "@/components";
import { formatDate, formatDateTime, formatPrice } from "@/lib/formatters";
import { getInitials, cn } from "@/lib/utils";
import { useDriverStore } from "@/stores/driver.store";
import deliveryService from "@/services/delivery.service";
import DriverService, { type DriverUser } from "@/services/driver.service";
import toast from "react-hot-toast";
import type { Delivery, Driver, DeliveryConfig } from "@/types/delivery.types";

// ============================================================================\n// TYPES\n// ============================================================================\n\n// ============================================================================\n// MOCK DATA\n// ============================================================================

const deliveries: Delivery[] = [
  {
    id: "DEL-2026-0892",
    orderId: "ORD-2026-0241",
    customerId: 205,
    customerName: "Bole Superstore",
    customerContact: "Meron Assefa",
    customerPhone: "+251 94 567 8901",
    customerLocation: "Addis Ababa, Bole",
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
    deliveryType: "paid",
    deliveryCost: 500,
    paymentCollected: false,
    customerPickedUp: false,
  },
  {
    id: "DEL-2026-0891",
    orderId: "ORD-2026-0238",
    customerId: 203,
    customerName: "City Supermarket",
    customerContact: "Almaz Worku",
    customerPhone: "+251 92 345 6789",
    customerLocation: "Adama, Awash Sefer",
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
    deliveryType: "free",
    paymentCollected: false,
    customerPickedUp: false,
  },
  {
    id: "DEL-2026-0890",
    orderId: "ORD-2026-0235",
    customerId: 202,
    customerName: "Mega Mart",
    customerContact: "Tsegaye Mulugeta",
    customerPhone: "+251 91 876 5432",
    customerLocation: "Addis Ababa, Bole",
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
    deliveryType: "paid",
    deliveryCost: 350,
    paymentCollected: false,
    customerPickedUp: false,
  },
  {
    id: "DEL-2026-0889",
    orderId: "ORD-2026-0232",
    customerId: 204,
    customerName: "Addis Mart",
    customerContact: "Biruk Haile",
    customerPhone: "+251 93 456 7890",
    customerLocation: "Addis Ababa, Merkato",
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
    deliveryType: "paid",
    deliveryCost: 400,
    paymentCollected: true,
    customerPickedUp: false,
  },
  {
    id: "DEL-2026-0888",
    orderId: "ORD-2026-0230",
    customerId: 206,
    customerName: "Hawassa Wholesale",
    customerContact: "Dawit Tadesse",
    customerPhone: "+251 95 678 9012",
    customerLocation: "Hawassa, Main Market",
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
    deliveryType: "free",
    paymentCollected: false,
    customerPickedUp: false,
  },
  {
    id: "DEL-2026-0887",
    orderId: "ORD-2026-0228",
    customerId: 207,
    customerName: "Dire Dava Traders",
    customerContact: "Fatuma Ahmed",
    customerPhone: "+251 96 789 0123",
    customerLocation: "Dire Dawa, Industrial Zone",
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
    deliveryType: "paid",
    deliveryCost: 1200,
    paymentCollected: false,
    customerPickedUp: false,
  },
];

// NOTE: Driver list will be loaded from backend via DriverStore.

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
// PROPS
// ============================================================================

interface DeliveryManagementProps {
  config: DeliveryConfig;
  initialDeliveries?: Delivery[];
  initialDrivers?: Driver[];
}

// ============================================================================
// COMPONENT
// ============================================================================

export const DeliveryManagement: React.FC<DeliveryManagementProps> = ({
  config,
  initialDeliveries = deliveries,
  initialDrivers = [],
}) => {
  const {
    drivers: Drivers,
    fetchMyDrivers,
    addDriver: addDriverToStore,
    removeDriver: removeDriverFromStore,
    isLoading: driversLoading,
    error: driversError,
    clearError: clearDriversError,
  } = useDriverStore();
  const [deliveryList, setDeliveryList] =
    useState<Delivery[]>(initialDeliveries);
  const [driverList, setDriverList] = useState<Driver[]>(initialDrivers);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(
    null,
  );
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showDeliveryDialog, setShowDeliveryDialog] = useState(false);
  const [showCostDialog, setShowCostDialog] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState<string>("");
  const [deliveryCost, setDeliveryCost] = useState<number>(
    config.defaultDeliveryCost || 0,
  );
  const [isFreeDelivery, setIsFreeDelivery] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("deliveries");
  const itemsPerPage = 5;

  // Add Driver dialog (link a driver user to this supplier)
  const [showAddDriverDialog, setShowAddDriverDialog] = useState(false);
  const [availableDriversList, setAvailableDriversList] = useState<
    DriverUser[]
  >([]);
  const [addDriverSearch, setAddDriverSearch] = useState("");
  const [selectedDriverIdToAdd, setSelectedDriverIdToAdd] =
    useState<string>("");
  const [addDriverVehicleType, setAddDriverVehicleType] = useState("");
  const [addDriverLicensePlate, setAddDriverLicensePlate] = useState("");
  const [addDriverLoading, setAddDriverLoading] = useState(false);

  // Load real drivers for the logged-in supplier/factory
  useEffect(() => {
    if (!config.hasDrivers) return;
    fetchMyDrivers();
  }, [config.hasDrivers, fetchMyDrivers]);

  // Map API drivers into Driver shape for list and assign dropdown
  useEffect(() => {
    if (!config.hasDrivers) return;
    const mapped: Driver[] = Drivers.filter((d) => d.active).map((d) => ({
      id: d.id,
      name: d.driver?.full_name ?? "Driver",
      phone: d.driver?.phone ?? "",
      email: d.driver?.email ?? "",
      vehicleType: d.vehicle_type || "Vehicle",
      licensePlate: d.license_plate || "",
      status: "available",
      currentLocation: "",
      deliveriesToday: 0,
      deliveriesCompleted: 0,
      rating: 0,
    }));
    setDriverList(mapped);
  }, [Drivers, config.hasDrivers]);

  // Filter deliveries
  const filteredDeliveries = deliveryList.filter((delivery) => {
    const matchesSearch =
      searchQuery === "" ||
      delivery.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.orderId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      delivery.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
  const availableDrivers = useMemo(
    () => driverList.filter((d) => d.status === "available").length,
    [driverList],
  );

  const openAddDriverDialog = async () => {
    setShowAddDriverDialog(true);
    setSelectedDriverIdToAdd("");
    setAddDriverVehicleType("");
    setAddDriverLicensePlate("");
    setAddDriverSearch("");
    setAvailableDriversList([]);
    clearDriversError();
    try {
      const list = await DriverService.getAvailableDrivers();
      setAvailableDriversList(list);
    } catch {
      setAvailableDriversList([]);
    }
  };

  const searchAvailableDrivers = async () => {
    setAddDriverLoading(true);
    try {
      const list = await DriverService.getAvailableDrivers(addDriverSearch);
      setAvailableDriversList(list);
    } finally {
      setAddDriverLoading(false);
    }
  };

  const submitAddDriver = async () => {
    if (!selectedDriverIdToAdd) {
      toast.error("Please select a driver.");
      return;
    }
    const added = await addDriverToStore({
      driver_id: selectedDriverIdToAdd,
      vehicle_type: addDriverVehicleType.trim() || undefined,
      license_plate: addDriverLicensePlate.trim() || undefined,
    });
    if (added) {
      toast.success(
        "Driver linked to your account. You can now assign them to deliveries.",
      );
      setShowAddDriverDialog(false);
    } else if (driversError) {
      toast.error(driversError);
    }
  };

  const handleRemoveDriver = async (DriverId: string) => {
    const ok = await removeDriverFromStore(DriverId);
    if (ok) toast.success("Driver removed from your list.");
    else if (driversError) toast.error(driversError);
  };

  const assignDriver = async (deliveryId: string) => {
    const driver = driverList.find((d) => d.id === selectedDriver);
    if (!driver) return;
    const driverId = selectedDriver; // delivery driver record id

    // Update UI immediately so the button "works" even if the delivery is mock
    setDeliveryList((prev) =>
      prev.map((d) =>
        d.id === deliveryId
          ? {
              ...d,
              status: "assigned",
              driverId: driverId,
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

    try {
      await deliveryService.assignDriver(deliveryId, driverId);
      toast.success(`Driver ${driver.name} assigned to delivery.`);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ??
          "Driver shown as assigned here, but the server could not be updated. If this is a real delivery, check that it exists.",
      );
    }
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

  const updateDeliveryCost = (deliveryId: string) => {
    setDeliveryList((prev) =>
      prev.map((d) =>
        d.id === deliveryId
          ? {
              ...d,
              deliveryType: isFreeDelivery ? "free" : "paid",
              deliveryCost: isFreeDelivery ? 0 : deliveryCost,
            }
          : d,
      ),
    );
    setShowCostDialog(false);
    setSelectedDelivery(null);
  };

  const markPaymentCollected = (deliveryId: string) => {
    setDeliveryList((prev) =>
      prev.map((d) =>
        d.id === deliveryId
          ? {
              ...d,
              paymentCollected: true,
            }
          : d,
      ),
    );
  };

  const markCustomerPickedUp = (deliveryId: string) => {
    setDeliveryList((prev) =>
      prev.map((d) =>
        d.id === deliveryId
          ? {
              ...d,
              customerPickedUp: true,
              status: "delivered",
              actualDelivery: new Date().toISOString(),
            }
          : d,
      ),
    );
  };

  const CustomerIcon = config.role === "distributor" ? Store : Factory;

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
            Track, assign, and manage all deliveries to your{" "}
            {config.customerLabel.toLowerCase()}s
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          {config.offersDelivery && (
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Schedule Delivery
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Pending Assignments
                </p>
                <p className="text-2xl font-bold mt-1">{pendingDeliveries}</p>
                <p className="text-xs text-yellow-600 mt-1">Awaiting driver</p>
              </div>
              <div className="h-10 w-10 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">In Transit</p>
                <p className="text-2xl font-bold mt-1">{inTransitDeliveries}</p>
                <p className="text-xs text-blue-600 mt-1">On the road</p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Truck className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Completed Today</p>
                <p className="text-2xl font-bold mt-1">{completedToday}</p>
                <p className="text-xs text-green-600 mt-1">
                  Successfully delivered
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Available Drivers
                </p>
                <p className="text-2xl font-bold mt-1">{availableDrivers}</p>
                <p className="text-xs text-green-600 mt-1">Ready to dispatch</p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-2 lg:w-[300px]">
          <TabsTrigger value="deliveries">Deliveries</TabsTrigger>
          {config.hasDrivers && (
            <TabsTrigger value="drivers">Drivers</TabsTrigger>
          )}
        </TabsList>

        {/* ===== DELIVERIES TAB ===== */}
        <TabsContent value="deliveries" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <SearchFilter
                placeholder={`Search by delivery ID, order ID, ${config.customerLabel.toLowerCase()}...`}
                onSearch={setSearchQuery}
                filterComponent={
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
                }
              />
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
            <EmptyState
              icon={Truck}
              title="No deliveries found"
              description="No deliveries match your current filters"
              actionLabel="Clear filters"
              onAction={() => {
                setSearchQuery("");
                setStatusFilter("all");
              }}
            />
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
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              to={`/${config.role}/delivery/${delivery.id}`}
                              className="text-lg font-semibold hover:text-primary"
                            >
                              {delivery.id}
                            </Link>
                            <StatusBadge status={delivery.status} />
                            <StatusBadge status={delivery.priority} />

                            {/* Delivery Type Badge */}
                            {delivery.deliveryType === "free" ? (
                              <Badge
                                variant="outline"
                                className="bg-green-100 text-green-800"
                              >
                                Free Delivery
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-blue-100 text-blue-800"
                              >
                                Paid Delivery
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            <span className="text-sm font-medium">
                              Order: {delivery.orderId}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <CustomerIcon className="h-3 w-3 mr-1" />
                              <Link
                                to={`/${config.role}${config.customerPath}/${delivery.customerId}`}
                                className="hover:text-primary"
                              >
                                {delivery.customerName}
                              </Link>
                            </span>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground flex items-center">
                              <MapPin className="h-3 w-3 mr-1" />
                              {delivery.customerLocation}
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
                        {delivery.deliveryType === "paid" &&
                          delivery.deliveryCost && (
                            <div className="flex items-center gap-1 text-sm font-medium text-blue-600">
                              <DollarSign className="h-3 w-3" />
                              {formatPrice(delivery.deliveryCost)}
                            </div>
                          )}
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
                          {delivery.customerContact}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {delivery.customerPhone}
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

                    {/* Payment Status */}
                    {delivery.deliveryType === "paid" && (
                      <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-blue-600" />
                            <div>
                              <p className="text-xs font-medium text-blue-800">
                                Delivery Payment
                              </p>
                              <p className="text-xs text-blue-700">
                                Amount:{" "}
                                {formatPrice(delivery.deliveryCost || 0)}
                              </p>
                            </div>
                          </div>
                          {delivery.paymentCollected ? (
                            <Badge className="bg-green-100 text-green-800">
                              Paid
                            </Badge>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs bg-white"
                              onClick={() => markPaymentCollected(delivery.id)}
                            >
                              Mark as Paid
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Self Pickup Option */}
                    {delivery.customerPickedUp && (
                      <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <p className="text-xs font-medium text-green-800">
                            Customer picked up order
                          </p>
                        </div>
                      </div>
                    )}

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

                    {/* Notes */}
                    {delivery.notes && (
                      <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 mb-4">
                        <p className="text-xs font-medium text-amber-800">
                          Note
                        </p>
                        <p className="text-xs text-amber-700">
                          {delivery.notes}
                        </p>
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

                      <div className="flex items-center gap-2 flex-wrap">
                        {/* Driver assignment - only if user has drivers */}
                        {config.hasDrivers && delivery.status === "pending" && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700"
                            onClick={() => {
                              setSelectedDelivery(delivery);
                              setSelectedDriver("");
                              fetchMyDrivers(); // refresh so dropdown has latest linked drivers
                              setShowAssignDialog(true);
                            }}
                          >
                            <User className="h-4 w-4 mr-2" />
                            Assign Driver
                          </Button>
                        )}

                        {/* Delivery status updates */}
                        {config.hasDrivers &&
                          delivery.status === "assigned" && (
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

                        {config.hasDrivers &&
                          delivery.status === "picked-up" && (
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

                        {config.hasDrivers &&
                          ["assigned", "picked-up", "in-transit"].includes(
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

                        {/* Self pickup option */}
                        {!delivery.customerPickedUp &&
                          delivery.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => markCustomerPickedUp(delivery.id)}
                            >
                              <Store className="h-4 w-4 mr-2" />
                              Customer Pickup
                            </Button>
                          )}

                        {/* Delivery cost management - if user offers paid delivery */}
                        {config.offersDelivery &&
                          delivery.status === "pending" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedDelivery(delivery);
                                setDeliveryCost(
                                  delivery.deliveryCost ||
                                    config.defaultDeliveryCost ||
                                    0,
                                );
                                setIsFreeDelivery(
                                  delivery.deliveryType === "free",
                                );
                                setShowCostDialog(true);
                              }}
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Set Cost
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
                              Contact Customer
                            </DropdownMenuItem>
                            {config.hasDrivers && (
                              <DropdownMenuItem>
                                <Navigation className="h-4 w-4 mr-2" />
                                Live Tracking
                              </DropdownMenuItem>
                            )}
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
                <PaginationBar
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                />
              )}
            </div>
          )}
        </TabsContent>

        {/* ===== DRIVERS TAB - Only shown if user has drivers ===== */}
        {config.hasDrivers && (
          <TabsContent value="drivers" className="space-y-4">
            {/* My Drivers: link drivers to this supplier so they appear in Assign Driver */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle>My drivers</CardTitle>
                  <CardDescription>
                    Drivers linked here can be assigned to deliveries. Add
                    drivers by selecting from active driver accounts.
                  </CardDescription>
                </div>
                <Button onClick={openAddDriverDialog}>
                  <User className="h-4 w-4 mr-2" />
                  Add driver
                </Button>
              </CardHeader>
              <CardContent>
                {driversError && (
                  <div className="mb-3 text-sm text-destructive">
                    {driversError}
                  </div>
                )}

                {driversLoading && Drivers.length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    Loading your drivers...
                  </p>
                ) : Drivers.filter((d) => d.active).length === 0 ? (
                  <p className="text-sm text-muted-foreground">
                    No drivers linked yet. Click &quot;Add driver&quot; to link
                    a driver account so you can assign them to deliveries.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {Drivers.filter((d) => d.active).map((sd) => (
                      <div
                        key={sd.id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(sd.driver?.full_name ?? "D")}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">
                              {sd.driver?.full_name ?? "Driver"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {sd.driver?.phone ??
                                sd.driver?.email ??
                                sd.driver_id}
                            </p>
                            <div className="flex gap-2 mt-1">
                              {sd.vehicle_type && (
                                <Badge variant="outline" className="text-xs">
                                  {sd.vehicle_type}
                                </Badge>
                              )}
                              {sd.license_plate && (
                                <Badge variant="outline" className="text-xs">
                                  {sd.license_plate}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive"
                          onClick={() => handleRemoveDriver(sd.id)}
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

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
                            <Badge
                              className={driverStatusColors[driver.status]}
                            >
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
        )}
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
              {driversLoading && driverList.length === 0 ? (
                <div className="rounded-md border border-muted p-3 text-sm text-muted-foreground">
                  Loading your drivers…
                </div>
              ) : driverList.filter((d) => d.status === "available").length ===
                0 ? (
                <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  No drivers linked yet. Go to the <strong>Drivers</strong> tab
                  and click &quot;Add driver&quot; to link driver accounts to
                  your business, then they will appear here.
                </div>
              ) : (
                <Select
                  key={`driver-select-${driverList.length}`}
                  value={selectedDriver}
                  onValueChange={setSelectedDriver}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a driver" />
                  </SelectTrigger>
                  <SelectContent>
                    {driverList
                      .filter((d) => d.status === "available")
                      .map((driver) => (
                        <SelectItem key={driver.id} value={driver.id}>
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
              )}
            </div>

            {selectedDriver && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-xs font-medium text-blue-800 mb-1">
                  Delivery Summary
                </p>
                <p className="text-xs text-blue-700">
                  Order: {selectedDelivery?.orderId}
                  <br />
                  Customer: {selectedDelivery?.customerName}
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
              disabled={
                !selectedDriver ||
                driverList.filter((d) => d.status === "available").length === 0
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              Assign Driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Driver dialog - link a driver user to this supplier */}
      <Dialog open={showAddDriverDialog} onOpenChange={setShowAddDriverDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add driver</DialogTitle>
            <DialogDescription>
              Select a driver account to link to your business. They will appear
              in the Assign Driver list for deliveries.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Search by name or email</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Search drivers..."
                  value={addDriverSearch}
                  onChange={(e) => setAddDriverSearch(e.target.value)}
                  onKeyDown={(e) =>
                    e.key === "Enter" && searchAvailableDrivers()
                  }
                />
                <Button
                  variant="outline"
                  onClick={searchAvailableDrivers}
                  disabled={addDriverLoading}
                >
                  Search
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Select driver</Label>
              <Select
                value={selectedDriverIdToAdd}
                onValueChange={setSelectedDriverIdToAdd}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose a driver to link" />
                </SelectTrigger>
                <SelectContent>
                  {availableDriversList.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name}
                      {u.email ? ` (${u.email})` : ""}
                      {u.phone ? ` · ${u.phone}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {availableDriversList.length === 0 && !addDriverLoading && (
                <p className="text-xs text-muted-foreground">
                  No driver accounts found. Ensure driver users exist and are
                  active.
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="vehicle_type">Vehicle type (optional)</Label>
                <Input
                  id="vehicle_type"
                  placeholder="e.g. Truck"
                  value={addDriverVehicleType}
                  onChange={(e) => setAddDriverVehicleType(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="license_plate">License plate (optional)</Label>
                <Input
                  id="license_plate"
                  placeholder="e.g. AA-1234"
                  value={addDriverLicensePlate}
                  onChange={(e) => setAddDriverLicensePlate(e.target.value)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDriverDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={submitAddDriver} disabled={!selectedDriverIdToAdd}>
              Add driver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delivery Cost Dialog */}
      <Dialog open={showCostDialog} onOpenChange={setShowCostDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Set Delivery Cost</DialogTitle>
            <DialogDescription>
              Configure delivery options for {selectedDelivery?.id}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label>Delivery Type</Label>
              <RadioGroup
                value={isFreeDelivery ? "free" : "paid"}
                onValueChange={(value) => setIsFreeDelivery(value === "free")}
                className="space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="free" id="free" />
                  <Label htmlFor="free" className="flex-1">
                    <span className="text-sm font-medium">Free Delivery</span>
                    <p className="text-xs text-muted-foreground">
                      Offer free delivery to customer
                    </p>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="paid" />
                  <Label htmlFor="paid" className="flex-1">
                    <span className="text-sm font-medium">Paid Delivery</span>
                    <p className="text-xs text-muted-foreground">
                      Customer pays for delivery
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {!isFreeDelivery && (
              <div className="space-y-2">
                <Label htmlFor="cost">Delivery Cost (ETB)</Label>
                <Input
                  id="cost"
                  type="number"
                  value={deliveryCost}
                  onChange={(e) => setDeliveryCost(Number(e.target.value))}
                  min={0}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCostDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedDelivery && updateDeliveryCost(selectedDelivery.id)
              }
              className="bg-blue-600 hover:bg-blue-700"
            >
              Save Changes
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
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Delivery Type
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          selectedDelivery.deliveryType === "free"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }
                      >
                        {selectedDelivery.deliveryType === "free"
                          ? "Free"
                          : "Paid"}
                        {selectedDelivery.deliveryCost &&
                        selectedDelivery.deliveryType === "paid"
                          ? ` - ${formatPrice(selectedDelivery.deliveryCost)}`
                          : ""}
                      </Badge>
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
                      {selectedDelivery.customerContact} •{" "}
                      {selectedDelivery.customerPhone}
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

                {/* Payment Status */}
                {selectedDelivery.deliveryType === "paid" && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Payment Status</h4>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-blue-800">
                          {selectedDelivery.paymentCollected
                            ? "Paid"
                            : "Pending"}
                        </span>
                        <span className="text-sm font-bold text-blue-800">
                          {formatPrice(selectedDelivery.deliveryCost || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
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
              <Link to={`/${config.role}/delivery/${selectedDelivery?.id}`}>
                View Full Details
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

