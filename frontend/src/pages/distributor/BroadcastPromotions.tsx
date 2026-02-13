import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Send,
  Megaphone,
  Calendar,
  Clock,
  Users,
  Store,
  Tag,
  Percent,
  DollarSign,
  Package,
  ShoppingCart,
  BarChart3,
  Eye,
  Edit,
  Copy,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Search,
  Filter,
  MoreVertical,
  Plus,
  Download,
  Star,
  Truck,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import { Checkbox } from "@/components/ui/checkbox";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface Promotion {
  id: string;
  title: string;
  description: string;
  type: "discount" | "bogo" | "free-shipping" | "bundle" | "clearance";
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  minOrder?: number;
  maxDiscount?: number;
  applicableProducts?: number[];
  applicableCategories?: string[];
  applicableRetailers?: "all" | "segment" | "specific";
  retailerSegments?: string[];
  startDate: string;
  endDate: string;
  status: "draft" | "scheduled" | "active" | "expired" | "cancelled";
  createdAt: string;
  createdBy: string;
  sentCount: number;
  viewedCount: number;
  redeemedCount: number;
  budget?: number;
  spent?: number;
  code?: string;
  image?: string;
  priority: "high" | "medium" | "low";
}

interface RetailerSegment {
  id: string;
  name: string;
  count: number;
  description: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const promotions: Promotion[] = [
  {
    id: "PROMO-001",
    title: "Flash Sale: 20% Off Selected Electronics",
    description: "Get 20% discount on all electronics. Limited time offer!",
    type: "discount",
    discountType: "percentage",
    discountValue: 20,
    minOrder: 5000,
    maxDiscount: 5000,
    applicableCategories: ["Electronics"],
    applicableRetailers: "all",
    startDate: "2026-02-15T00:00:00",
    endDate: "2026-02-18T23:59:59",
    status: "scheduled",
    createdAt: "2026-02-10T10:30:00",
    createdBy: "Abebe Kebede",
    sentCount: 0,
    viewedCount: 0,
    redeemedCount: 0,
    budget: 50000,
    code: "FLASH20",
    priority: "high",
  },
  {
    id: "PROMO-002",
    title: "Buy 2 Get 1 Free - White Teff Flour",
    description: "Purchase 2kg of White Teff Flour and get 1kg free!",
    type: "bogo",
    applicableProducts: [1],
    applicableRetailers: "all",
    startDate: "2026-02-10T00:00:00",
    endDate: "2026-02-28T23:59:59",
    status: "active",
    createdAt: "2026-02-08T14:15:00",
    createdBy: "Abebe Kebede",
    sentCount: 245,
    viewedCount: 189,
    redeemedCount: 67,
    priority: "medium",
  },
  {
    id: "PROMO-003",
    title: "Free Shipping on Orders Over ETB 10,000",
    description: "Enjoy free shipping on all orders above ETB 10,000",
    type: "free-shipping",
    minOrder: 10000,
    applicableRetailers: "all",
    startDate: "2026-02-01T00:00:00",
    endDate: "2026-02-29T23:59:59",
    status: "active",
    createdAt: "2026-01-28T09:00:00",
    createdBy: "Abebe Kebede",
    sentCount: 567,
    viewedCount: 432,
    redeemedCount: 156,
    priority: "medium",
  },
  {
    id: "PROMO-004",
    title: "New Customer Special: 15% Off First Order",
    description: "First-time buyers get 15% discount on their first purchase",
    type: "discount",
    discountType: "percentage",
    discountValue: 15,
    applicableRetailers: "segment",
    retailerSegments: ["new-customers"],
    startDate: "2026-02-01T00:00:00",
    endDate: "2026-03-31T23:59:59",
    status: "active",
    createdAt: "2026-01-30T11:45:00",
    createdBy: "Abebe Kebede",
    sentCount: 89,
    viewedCount: 67,
    redeemedCount: 23,
    code: "WELCOME15",
    priority: "high",
  },
  {
    id: "PROMO-005",
    title: "Clearance: Construction Materials",
    description: "Up to 30% off on selected construction materials",
    type: "clearance",
    discountType: "percentage",
    discountValue: 30,
    applicableCategories: ["Construction"],
    applicableRetailers: "all",
    startDate: "2026-02-05T00:00:00",
    endDate: "2026-02-20T23:59:59",
    status: "active",
    createdAt: "2026-02-03T13:20:00",
    createdBy: "Abebe Kebede",
    sentCount: 134,
    viewedCount: 98,
    redeemedCount: 34,
    priority: "high",
  },
  {
    id: "PROMO-006",
    title: "Bulk Purchase Discount - Coffee",
    description: "10% off on bulk coffee orders (50kg+)",
    type: "discount",
    discountType: "percentage",
    discountValue: 10,
    minOrder: 50,
    applicableProducts: [4, 5],
    applicableRetailers: "all",
    startDate: "2026-02-01T00:00:00",
    endDate: "2026-02-28T23:59:59",
    status: "active",
    createdAt: "2026-01-29T16:00:00",
    createdBy: "Abebe Kebede",
    sentCount: 78,
    viewedCount: 56,
    redeemedCount: 21,
    priority: "low",
  },
  {
    id: "PROMO-007",
    title: "Loyalty Bonus: 5% Cashback",
    description: "5% cashback on all orders for premium retailers",
    type: "discount",
    discountType: "percentage",
    discountValue: 5,
    applicableRetailers: "segment",
    retailerSegments: ["premium"],
    startDate: "2026-02-15T00:00:00",
    endDate: "2026-03-15T23:59:59",
    status: "draft",
    createdAt: "2026-02-12T09:30:00",
    createdBy: "Abebe Kebede",
    sentCount: 0,
    viewedCount: 0,
    redeemedCount: 0,
    priority: "medium",
  },
  {
    id: "PROMO-008",
    title: "Holiday Special: Independence Day Sale",
    description: "Special discounts for Ethiopian Independence Day",
    type: "discount",
    discountType: "percentage",
    discountValue: 25,
    applicableRetailers: "all",
    startDate: "2026-03-01T00:00:00",
    endDate: "2026-03-07T23:59:59",
    status: "draft",
    createdAt: "2026-02-11T14:45:00",
    createdBy: "Abebe Kebede",
    sentCount: 0,
    viewedCount: 0,
    redeemedCount: 0,
    priority: "low",
  },
];

const retailerSegments: RetailerSegment[] = [
  {
    id: "new-customers",
    name: "New Customers",
    count: 45,
    description: "Retailers with less than 3 orders",
  },
  {
    id: "premium",
    name: "Premium Retailers",
    count: 28,
    description: "Retailers with > ETB 100K monthly spend",
  },
  {
    id: "frequent",
    name: "Frequent Buyers",
    count: 62,
    description: "Retailers with 10+ orders per month",
  },
  {
    id: "inactive",
    name: "Inactive (30+ days)",
    count: 31,
    description: "No orders in last 30 days",
  },
];

const productCategories = [
  "All Categories",
  "Food",
  "Beverages",
  "Construction",
  "Textiles",
  "Furniture",
  "Stationery",
  "Electronics",
  "Household",
];

// ============================================================================
// CONSTANTS
// ============================================================================

const promotionTypeColors = {
  discount: "bg-green-100 text-green-800 border-green-200",
  bogo: "bg-purple-100 text-purple-800 border-purple-200",
  "free-shipping": "bg-blue-100 text-blue-800 border-blue-200",
  bundle: "bg-amber-100 text-amber-800 border-amber-200",
  clearance: "bg-red-100 text-red-800 border-red-200",
};

const statusColors = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  active: "bg-green-100 text-green-800 border-green-200",
  expired: "bg-amber-100 text-amber-800 border-amber-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

// ============================================================================
// COMPONENT
// ============================================================================

const BroadcastPromotionsPage: React.FC = () => {
  const [promotionList, setPromotionList] = useState<Promotion[]>(promotions);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(
    null,
  );
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("active");
  const itemsPerPage = 5;

  // New promotion form state
  const [newPromotion, setNewPromotion] = useState({
    title: "",
    description: "",
    type: "discount",
    discountType: "percentage",
    discountValue: "",
    minOrder: "",
    maxDiscount: "",
    applicableTo: "all",
    selectedCategories: [] as string[],
    selectedProducts: [] as number[],
    selectedSegments: [] as string[],
    startDate: "",
    endDate: "",
    promoCode: "",
    priority: "medium",
  });

  // Filter promotions
  const filteredPromotions = promotionList.filter((promo) => {
    const matchesSearch =
      searchQuery === "" ||
      promo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      promo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (promo.code?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || promo.status === statusFilter;
    const matchesType = typeFilter === "all" || promo.type === typeFilter;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && promo.status === "active") ||
      (activeTab === "scheduled" && promo.status === "scheduled") ||
      (activeTab === "draft" && promo.status === "draft");

    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  // Sort promotions by date
  const sortedPromotions = [...filteredPromotions].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPromotions = sortedPromotions.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(sortedPromotions.length / itemsPerPage);

  // Stats
  const activePromotions = promotionList.filter(
    (p) => p.status === "active",
  ).length;
  const scheduledPromotions = promotionList.filter(
    (p) => p.status === "scheduled",
  ).length;
  const draftPromotions = promotionList.filter(
    (p) => p.status === "draft",
  ).length;
  const totalRedemptions = promotionList.reduce(
    (sum, p) => sum + p.redeemedCount,
    0,
  );

  const deletePromotion = (promotionId: string) => {
    setPromotionList((prev) => prev.filter((p) => p.id !== promotionId));
    setShowDeleteDialog(false);
    setSelectedPromotion(null);
  };

  const duplicatePromotion = (promotion: Promotion) => {
    const newPromo: Promotion = {
      ...promotion,
      id: `PROMO-${Math.floor(Math.random() * 1000)
        .toString()
        .padStart(3, "0")}`,
      title: `${promotion.title} (Copy)`,
      status: "draft",
      createdAt: new Date().toISOString(),
      sentCount: 0,
      viewedCount: 0,
      redeemedCount: 0,
    };
    setPromotionList((prev) => [newPromo, ...prev]);
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPromotionTypeLabel = (type: string) => {
    switch (type) {
      case "discount":
        return "Discount";
      case "bogo":
        return "BOGO";
      case "free-shipping":
        return "Free Shipping";
      case "bundle":
        return "Bundle";
      case "clearance":
        return "Clearance";
      default:
        return type;
    }
  };

  const getPromotionSummary = (promo: Promotion) => {
    switch (promo.type) {
      case "discount":
        return `${promo.discountValue}${promo.discountType === "percentage" ? "%" : " ETB"} off`;
      case "bogo":
        return "Buy 2 Get 1 Free";
      case "free-shipping":
        return `Free shipping over ${promo.minOrder} ETB`;
      case "clearance":
        return `Up to ${promo.discountValue}% off`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Broadcast Promotions
            </h1>
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200"
            >
              <Megaphone className="h-3 w-3 mr-1" />
              {activePromotions} Active
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Create and manage promotions to send to your retail customers
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Promotion
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={setActiveTab}
        className="space-y-4"
      >
        <TabsList className="grid w-full grid-cols-4 lg:w-[500px]">
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="all">All</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search promotions by title, code, or description..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Promotion Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="discount">Discount</SelectItem>
                      <SelectItem value="bogo">BOGO</SelectItem>
                      <SelectItem value="free-shipping">
                        Free Shipping
                      </SelectItem>
                      <SelectItem value="clearance">Clearance</SelectItem>
                      <SelectItem value="bundle">Bundle</SelectItem>
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
              {Math.min(indexOfLastItem, sortedPromotions.length)} of{" "}
              {sortedPromotions.length} promotions
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Megaphone className="h-3 w-3 mr-1" />
              {sortedPromotions.length} promotions
            </Badge>
          </div>

          {/* Promotions Grid */}
          {sortedPromotions.length === 0 ? (
            <Card className="py-12">
              <div className="text-center">
                <Megaphone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No promotions found
                </h3>
                <p className="text-muted-foreground mb-4">
                  {activeTab === "draft"
                    ? "You don't have any draft promotions. Create your first promotion!"
                    : activeTab === "scheduled"
                      ? "No scheduled promotions found"
                      : activeTab === "active"
                        ? "No active promotions running"
                        : "No promotions match your current filters"}
                </p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Promotion
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentPromotions.map((promo) => (
                <Card
                  key={promo.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            promo.type === "discount"
                              ? "bg-green-100"
                              : promo.type === "bogo"
                                ? "bg-purple-100"
                                : promo.type === "free-shipping"
                                  ? "bg-blue-100"
                                  : promo.type === "clearance"
                                    ? "bg-red-100"
                                    : "bg-amber-100",
                          )}
                        >
                          {promo.type === "discount" && (
                            <Percent className="h-5 w-5 text-green-600" />
                          )}
                          {promo.type === "bogo" && (
                            <Tag className="h-5 w-5 text-purple-600" />
                          )}
                          {promo.type === "free-shipping" && (
                            <Truck className="h-5 w-5 text-blue-600" />
                          )}
                          {promo.type === "clearance" && (
                            <Tag className="h-5 w-5 text-red-600" />
                          )}
                          {promo.type === "bundle" && (
                            <Package className="h-5 w-5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {promo.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {getPromotionSummary(promo)}
                          </CardDescription>
                        </div>
                      </div>
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
                          <DropdownMenuItem
                            onClick={() => setSelectedPromotion(promo)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => duplicatePromotion(promo)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {promo.status === "draft" && (
                            <DropdownMenuItem>
                              <Send className="h-4 w-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {promo.status === "active" && (
                            <DropdownMenuItem className="text-amber-600">
                              <XCircle className="h-4 w-4 mr-2" />
                              End Early
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedPromotion(promo);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {promo.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className={statusColors[promo.status]}
                      >
                        {promo.status.charAt(0).toUpperCase() +
                          promo.status.slice(1)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={promotionTypeColors[promo.type]}
                      >
                        {getPromotionTypeLabel(promo.type)}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={
                          promo.priority === "high"
                            ? "bg-red-100 text-red-800"
                            : promo.priority === "medium"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-green-100 text-green-800"
                        }
                      >
                        {promo.priority.charAt(0).toUpperCase() +
                          promo.priority.slice(1)}{" "}
                        Priority
                      </Badge>
                    </div>

                    {promo.code && (
                      <div className="bg-muted/50 rounded-lg p-2 mb-3">
                        <span className="text-xs text-muted-foreground">
                          Promo Code:{" "}
                        </span>
                        <code className="text-xs font-mono bg-background px-2 py-1 rounded">
                          {promo.code}
                        </code>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Start: {formatDate(promo.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>End: {formatDate(promo.endDate)}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Sent</p>
                        <p className="text-lg font-semibold">
                          {promo.sentCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Viewed</p>
                        <p className="text-lg font-semibold">
                          {promo.viewedCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Redeemed
                        </p>
                        <p className="text-lg font-semibold">
                          {promo.redeemedCount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      className="w-full"
                      variant={promo.status === "draft" ? "default" : "outline"}
                    >
                      {promo.status === "draft" ? (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Publish Promotion
                        </>
                      ) : promo.status === "active" ? (
                        <>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          View Performance
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

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
        </TabsContent>
      </Tabs>

      {/* Create Promotion Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Create New Promotion</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new promotion for your retailers
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6 py-2">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Basic Information</h4>

                <div className="space-y-2">
                  <Label htmlFor="title">Promotion Title</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Flash Sale: 20% Off Electronics"
                    value={newPromotion.title}
                    onChange={(e) =>
                      setNewPromotion({
                        ...newPromotion,
                        title: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your promotion..."
                    rows={3}
                    value={newPromotion.description}
                    onChange={(e) =>
                      setNewPromotion({
                        ...newPromotion,
                        description: e.target.value,
                      })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Promotion Type</Label>
                    <Select
                      value={newPromotion.type}
                      onValueChange={(value) =>
                        setNewPromotion({ ...newPromotion, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="discount">Discount</SelectItem>
                        <SelectItem value="bogo">Buy One Get One</SelectItem>
                        <SelectItem value="free-shipping">
                          Free Shipping
                        </SelectItem>
                        <SelectItem value="clearance">Clearance</SelectItem>
                        <SelectItem value="bundle">Bundle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select
                      value={newPromotion.priority}
                      onValueChange={(value) =>
                        setNewPromotion({ ...newPromotion, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select priority" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Discount Details */}
              {newPromotion.type === "discount" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Discount Details</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discountType">Discount Type</Label>
                      <Select
                        value={newPromotion.discountType}
                        onValueChange={(value) =>
                          setNewPromotion({
                            ...newPromotion,
                            discountType: value,
                          })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percentage">
                            Percentage (%)
                          </SelectItem>
                          <SelectItem value="fixed">
                            Fixed Amount (ETB)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discountValue">Discount Value</Label>
                      <Input
                        id="discountValue"
                        type="number"
                        placeholder={
                          newPromotion.discountType === "percentage"
                            ? "e.g., 20"
                            : "e.g., 500"
                        }
                        value={newPromotion.discountValue}
                        onChange={(e) =>
                          setNewPromotion({
                            ...newPromotion,
                            discountValue: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="minOrder">Minimum Order (ETB)</Label>
                      <Input
                        id="minOrder"
                        type="number"
                        placeholder="Optional"
                        value={newPromotion.minOrder}
                        onChange={(e) =>
                          setNewPromotion({
                            ...newPromotion,
                            minOrder: e.target.value,
                          })
                        }
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxDiscount">
                        Maximum Discount (ETB)
                      </Label>
                      <Input
                        id="maxDiscount"
                        type="number"
                        placeholder="Optional"
                        value={newPromotion.maxDiscount}
                        onChange={(e) =>
                          setNewPromotion({
                            ...newPromotion,
                            maxDiscount: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {newPromotion.type === "free-shipping" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Free Shipping Details</h4>

                  <div className="space-y-2">
                    <Label htmlFor="minOrder">Minimum Order Amount (ETB)</Label>
                    <Input
                      id="minOrder"
                      type="number"
                      placeholder="e.g., 10000"
                      value={newPromotion.minOrder}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          minOrder: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              )}

              {/* Schedule */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Schedule</h4>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Start Date</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={newPromotion.startDate}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newPromotion.endDate}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          endDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              <Separator />

              {/* Target Audience */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Target Audience</h4>

                <RadioGroup
                  value={newPromotion.applicableTo}
                  onValueChange={(value) =>
                    setNewPromotion({ ...newPromotion, applicableTo: value })
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">All Retailers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="segment" id="segment" />
                    <Label htmlFor="segment">Specific Segments</Label>
                  </div>
                </RadioGroup>

                {newPromotion.applicableTo === "segment" && (
                  <div className="mt-3 space-y-2">
                    <Label>Select Segments</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {retailerSegments.map((segment) => (
                        <div
                          key={segment.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={segment.id}
                            checked={newPromotion.selectedSegments.includes(
                              segment.id,
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewPromotion({
                                  ...newPromotion,
                                  selectedSegments: [
                                    ...newPromotion.selectedSegments,
                                    segment.id,
                                  ],
                                });
                              } else {
                                setNewPromotion({
                                  ...newPromotion,
                                  selectedSegments:
                                    newPromotion.selectedSegments.filter(
                                      (s) => s !== segment.id,
                                    ),
                                });
                              }
                            }}
                          />
                          <Label htmlFor={segment.id} className="text-sm">
                            {segment.name} ({segment.count})
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Separator />

              {/* Promo Code */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Promo Code (Optional)</h4>

                <div className="space-y-2">
                  <Label htmlFor="promoCode">Code</Label>
                  <div className="flex gap-2">
                    <Input
                      id="promoCode"
                      placeholder="e.g., SUMMER20"
                      value={newPromotion.promoCode}
                      onChange={(e) =>
                        setNewPromotion({
                          ...newPromotion,
                          promoCode: e.target.value.toUpperCase(),
                        })
                      }
                    />
                    <Button variant="outline" type="button">
                      Generate
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setShowCreateDialog(false)}
            >
              Cancel
            </Button>
            <Button variant="outline">Save as Draft</Button>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Send className="h-4 w-4 mr-2" />
              Schedule Promotion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promotion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedPromotion?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                selectedPromotion && deletePromotion(selectedPromotion.id)
              }
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BroadcastPromotionsPage;
