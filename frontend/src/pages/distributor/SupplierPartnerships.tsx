import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Factory,
  Users,
  Building2,
  Star,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Package,
  Truck,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  DollarSign,
  FileText,
  Download,
  Search,
  Filter,
  Eye,
  Edit,
  MoreVertical,
  Plus,
  Shield,
  Award,
  BarChart3,
  ChevronRight,
  MessageSquare,
  FileCheck,
  Scale,
  CreditCard,
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

interface SupplierPartner {
  id: number;
  name: string;
  logo?: string;
  type: "factory" | "manufacturer" | "processor" | "importer";
  category: string[];
  location: string;
  region: string;
  established: string;
  verified: boolean;
  tier: "platinum" | "gold" | "silver" | "bronze" | "new";
  rating: number;
  totalOrders: number;
  totalSpent: number;
  avgOrderValue: number;
  onTimeDelivery: number;
  qualityRating: number;
  communicationRating: number;
  responseTime: string;
  leadTime: string;
  paymentTerms: string;
  creditLimit: number;
  creditUsed: number;
  contractStart: string;
  contractEnd?: string;
  contractStatus: "active" | "expiring" | "expired" | "negotiating";
  products: number;
  categories: string[];
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  lastOrderDate: string;
  nextDeliveryDate?: string;
  issues?: number;
  notes?: string;
}

interface PartnershipMetric {
  supplierId: number;
  month: string;
  orderVolume: number;
  spend: number;
  defects: number;
  returns: number;
  rating: number;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const supplierPartners: SupplierPartner[] = [
  {
    id: 501,
    name: "Mugher Cement",
    type: "factory",
    category: ["Construction", "Cement"],
    location: "Addis Ababa",
    region: "Central",
    established: "2005",
    verified: true,
    tier: "platinum",
    rating: 4.8,
    totalOrders: 245,
    totalSpent: 12450000,
    avgOrderValue: 50816,
    onTimeDelivery: 98.5,
    qualityRating: 4.7,
    communicationRating: 4.9,
    responseTime: "< 1 hour",
    leadTime: "2-3 days",
    paymentTerms: "Net 30",
    creditLimit: 2000000,
    creditUsed: 850000,
    contractStart: "2024-01-01",
    contractEnd: "2026-12-31",
    contractStatus: "active",
    products: 8,
    categories: ["Cement", "Construction"],
    contactPerson: "Tadesse Haile",
    contactPhone: "+251 11 234 5678",
    contactEmail: "tadesse.h@mugher.com",
    lastOrderDate: "2026-02-10",
    nextDeliveryDate: "2026-02-18",
    issues: 0,
  },
  {
    id: 502,
    name: "Mekelle Steel",
    type: "factory",
    category: ["Construction", "Steel"],
    location: "Mekelle",
    region: "Northern",
    established: "2012",
    verified: true,
    tier: "gold",
    rating: 4.6,
    totalOrders: 178,
    totalSpent: 8900000,
    avgOrderValue: 50000,
    onTimeDelivery: 96.8,
    qualityRating: 4.6,
    communicationRating: 4.5,
    responseTime: "< 2 hours",
    leadTime: "5-7 days",
    paymentTerms: "Net 30",
    creditLimit: 1500000,
    creditUsed: 620000,
    contractStart: "2024-03-15",
    contractEnd: "2026-03-14",
    contractStatus: "active",
    products: 15,
    categories: ["Steel", "Rebars", "Sheets"],
    contactPerson: "Mulugeta Assefa",
    contactPhone: "+251 34 567 8901",
    contactEmail: "mulugeta.a@mekellesteel.com",
    lastOrderDate: "2026-02-09",
    nextDeliveryDate: "2026-02-23",
    issues: 1,
  },
  {
    id: 503,
    name: "Ethiopian Textile",
    type: "manufacturer",
    category: ["Textiles", "Fabric"],
    location: "Addis Ababa",
    region: "Central",
    established: "2010",
    verified: false,
    tier: "silver",
    rating: 4.3,
    totalOrders: 98,
    totalSpent: 2450000,
    avgOrderValue: 25000,
    onTimeDelivery: 92.5,
    qualityRating: 4.2,
    communicationRating: 4.3,
    responseTime: "< 4 hours",
    leadTime: "3-5 days",
    paymentTerms: "Net 15",
    creditLimit: 500000,
    creditUsed: 180000,
    contractStart: "2024-06-01",
    contractEnd: "2025-12-31",
    contractStatus: "active",
    products: 45,
    categories: ["Cotton", "Fabric", "Garments"],
    contactPerson: "Hirut Desta",
    contactPhone: "+251 11 456 7890",
    contactEmail: "hirut.d@ethiotextile.com",
    lastOrderDate: "2026-02-06",
    issues: 3,
  },
  {
    id: 504,
    name: "Ethiopia Coffee Export",
    type: "processor",
    category: ["Beverages", "Coffee"],
    location: "Addis Ababa",
    region: "Central",
    established: "2015",
    verified: true,
    tier: "platinum",
    rating: 4.9,
    totalOrders: 312,
    totalSpent: 7800000,
    avgOrderValue: 25000,
    onTimeDelivery: 99.2,
    qualityRating: 4.9,
    communicationRating: 4.8,
    responseTime: "< 30 minutes",
    leadTime: "2-3 days",
    paymentTerms: "Net 30",
    creditLimit: 1000000,
    creditUsed: 420000,
    contractStart: "2024-02-01",
    contractEnd: "2027-01-31",
    contractStatus: "active",
    products: 12,
    categories: ["Coffee", "Nuts", "Spices"],
    contactPerson: "Bereket Tesfaye",
    contactPhone: "+251 11 345 6789",
    contactEmail: "bereket.t@ethiopiacoffee.com",
    lastOrderDate: "2026-02-10",
    nextDeliveryDate: "2026-02-20",
    issues: 0,
  },
  {
    id: 505,
    name: "Ethiopia Agri",
    type: "processor",
    category: ["Food", "Grains"],
    location: "Adama",
    region: "Central",
    established: "2016",
    verified: true,
    tier: "gold",
    rating: 4.7,
    totalOrders: 203,
    totalSpent: 5100000,
    avgOrderValue: 25123,
    onTimeDelivery: 97.8,
    qualityRating: 4.7,
    communicationRating: 4.6,
    responseTime: "< 1 hour",
    leadTime: "2-4 days",
    paymentTerms: "Net 30",
    creditLimit: 800000,
    creditUsed: 350000,
    contractStart: "2024-05-15",
    contractEnd: "2026-05-14",
    contractStatus: "active",
    products: 28,
    categories: ["Teff", "Grains", "Oils"],
    contactPerson: "Almaz Worku",
    contactPhone: "+251 22 456 7890",
    contactEmail: "almaz.w@ethiopiaagri.com",
    lastOrderDate: "2026-02-07",
    nextDeliveryDate: "2026-02-19",
    issues: 0,
  },
  {
    id: 506,
    name: "Adama Oil",
    type: "factory",
    category: ["Food", "Oils"],
    location: "Adama",
    region: "Central",
    established: "2018",
    verified: true,
    tier: "silver",
    rating: 4.5,
    totalOrders: 87,
    totalSpent: 2950000,
    avgOrderValue: 33908,
    onTimeDelivery: 95.2,
    qualityRating: 4.5,
    communicationRating: 4.4,
    responseTime: "< 2 hours",
    leadTime: "3-5 days",
    paymentTerms: "Net 15",
    creditLimit: 400000,
    creditUsed: 210000,
    contractStart: "2024-08-01",
    contractEnd: "2025-12-31",
    contractStatus: "expiring",
    products: 6,
    categories: ["Soybean Oil", "Cooking Oil"],
    contactPerson: "Kebede Desta",
    contactPhone: "+251 22 567 8901",
    contactEmail: "kebede.d@adamaoil.com",
    lastOrderDate: "2026-02-05",
    issues: 1,
  },
  {
    id: 507,
    name: "Adama Plastics",
    type: "manufacturer",
    category: ["Household", "Plastics"],
    location: "Adama",
    region: "Central",
    established: "2017",
    verified: false,
    tier: "bronze",
    rating: 4.2,
    totalOrders: 56,
    totalSpent: 1250000,
    avgOrderValue: 22321,
    onTimeDelivery: 91.5,
    qualityRating: 4.1,
    communicationRating: 4.2,
    responseTime: "< 5 hours",
    leadTime: "3-4 days",
    paymentTerms: "Net 15",
    creditLimit: 200000,
    creditUsed: 95000,
    contractStart: "2024-09-01",
    contractEnd: "2025-12-31",
    contractStatus: "expiring",
    products: 35,
    categories: ["Plastic Chairs", "Household"],
    contactPerson: "Solomon Ayele",
    contactPhone: "+251 22 678 9012",
    contactEmail: "solomon.a@adamaplastics.com",
    lastOrderDate: "2026-02-04",
    issues: 2,
  },
  {
    id: 508,
    name: "Bahir Dar Honey",
    type: "processor",
    category: ["Food", "Honey"],
    location: "Bahir Dar",
    region: "Amhara",
    established: "2019",
    verified: true,
    tier: "silver",
    rating: 4.8,
    totalOrders: 42,
    totalSpent: 890000,
    avgOrderValue: 21190,
    onTimeDelivery: 98.9,
    qualityRating: 4.8,
    communicationRating: 4.7,
    responseTime: "< 3 hours",
    leadTime: "2-4 days",
    paymentTerms: "Net 15",
    creditLimit: 300000,
    creditUsed: 120000,
    contractStart: "2024-10-01",
    contractEnd: "2025-12-31",
    contractStatus: "expiring",
    products: 8,
    categories: ["Honey", "Organic"],
    contactPerson: "Tigist Haile",
    contactPhone: "+251 58 234 5678",
    contactEmail: "tigist.h@bahirdarhoney.com",
    lastOrderDate: "2026-02-02",
    issues: 0,
  },
];

// ============================================================================
// CONSTANTS
// ============================================================================

const tierColors = {
  platinum: "bg-indigo-100 text-indigo-800 border-indigo-200",
  gold: "bg-amber-100 text-amber-800 border-amber-200",
  silver: "bg-gray-100 text-gray-800 border-gray-200",
  bronze: "bg-orange-100 text-orange-800 border-orange-200",
  new: "bg-green-100 text-green-800 border-green-200",
};

const contractStatusColors = {
  active: "bg-green-100 text-green-800 border-green-200",
  expiring: "bg-amber-100 text-amber-800 border-amber-200",
  expired: "bg-red-100 text-red-800 border-red-200",
  negotiating: "bg-blue-100 text-blue-800 border-blue-200",
};

const typeColors = {
  factory: "bg-blue-100 text-blue-800 border-blue-200",
  manufacturer: "bg-purple-100 text-purple-800 border-purple-200",
  processor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  importer: "bg-amber-100 text-amber-800 border-amber-200",
};

// ============================================================================
// COMPONENT
// ============================================================================

const SupplierPartnershipsPage: React.FC = () => {
  const [suppliers, setSuppliers] =
    useState<SupplierPartner[]>(supplierPartners);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedSupplier, setSelectedSupplier] =
    useState<SupplierPartner | null>(null);
  const [showSupplierDialog, setShowSupplierDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const itemsPerPage = 6;

  // Filter suppliers
  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      searchQuery === "" ||
      supplier.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      supplier.contactPerson
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      supplier.category.some((c) =>
        c.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesTier = tierFilter === "all" || supplier.tier === tierFilter;
    const matchesType = typeFilter === "all" || supplier.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || supplier.contractStatus === statusFilter;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "platinum" && supplier.tier === "platinum") ||
      (activeTab === "expiring" && supplier.contractStatus === "expiring") ||
      (activeTab === "issues" && (supplier.issues || 0) > 0);

    return (
      matchesSearch && matchesTier && matchesType && matchesStatus && matchesTab
    );
  });

  // Sort suppliers by tier and rating
  const sortedSuppliers = [...filteredSuppliers].sort((a, b) => {
    const tierRank = { platinum: 1, gold: 2, silver: 3, bronze: 4, new: 5 };
    return (
      (tierRank[a.tier] || 99) - (tierRank[b.tier] || 99) || b.rating - a.rating
    );
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSuppliers = sortedSuppliers.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(sortedSuppliers.length / itemsPerPage);

  // Stats
  const totalSuppliers = suppliers.length;
  const platinumSuppliers = suppliers.filter(
    (s) => s.tier === "platinum",
  ).length;
  const activeContracts = suppliers.filter(
    (s) => s.contractStatus === "active",
  ).length;
  const expiringContracts = suppliers.filter(
    (s) => s.contractStatus === "expiring",
  ).length;
  const totalCreditLimit = suppliers.reduce((sum, s) => sum + s.creditLimit, 0);
  const totalCreditUsed = suppliers.reduce((sum, s) => sum + s.creditUsed, 0);
  const totalSpent = suppliers.reduce((sum, s) => sum + s.totalSpent, 0);

  const formatPrice = (price: number) => {
    return `ETB ${price.toLocaleString()}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
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

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case "platinum":
        return <Badge className={tierColors.platinum}>Platinum Partner</Badge>;
      case "gold":
        return <Badge className={tierColors.gold}>Gold Partner</Badge>;
      case "silver":
        return <Badge className={tierColors.silver}>Silver Partner</Badge>;
      case "bronze":
        return <Badge className={tierColors.bronze}>Bronze Partner</Badge>;
      case "new":
        return <Badge className={tierColors.new}>New Partner</Badge>;
      default:
        return null;
    }
  };

  const handleExport = (format: "csv" | "pdf" | "excel") => {
    // Export logic would go here
    console.log(`Exporting supplier data as ${format}`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              Supplier Partnerships
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <Factory className="h-3 w-3 mr-1" />
              {totalSuppliers} Partners
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">
            Manage your factory and manufacturer relationships, contracts, and
            performance
          </p>
        </div>
        <div className="flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport("csv")}>
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("excel")}>
                <FileText className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Supplier
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Partners</p>
                <p className="text-2xl font-bold mt-1">{totalSuppliers}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {platinumSuppliers} Platinum
                </p>
              </div>
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Active Contracts
                </p>
                <p className="text-2xl font-bold mt-1">{activeContracts}</p>
                <p className="text-xs text-amber-600 mt-1">
                  {expiringContracts} expiring soon
                </p>
              </div>
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <FileCheck className="h-5 w-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total Spend</p>
                <p className="text-2xl font-bold mt-1">
                  {formatPrice(totalSpent)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">All time</p>
              </div>
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">
                  Credit Utilization
                </p>
                <p className="text-2xl font-bold mt-1">
                  {Math.round((totalCreditUsed / totalCreditLimit) * 100)}%
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {formatPrice(totalCreditUsed)} /{" "}
                  {formatPrice(totalCreditLimit)}
                </p>
              </div>
              <div className="h-10 w-10 bg-amber-100 rounded-full flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-amber-600" />
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
        <TabsList className="grid w-full grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="all">All Partners</TabsTrigger>
          <TabsTrigger value="platinum">Platinum</TabsTrigger>
          <TabsTrigger value="expiring">Expiring Soon</TabsTrigger>
          <TabsTrigger value="issues">Issues</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search suppliers by name, location, or category..."
                    className="pl-9"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Select value={tierFilter} onValueChange={setTierFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Partner Tier" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Tiers</SelectItem>
                      <SelectItem value="platinum">Platinum</SelectItem>
                      <SelectItem value="gold">Gold</SelectItem>
                      <SelectItem value="silver">Silver</SelectItem>
                      <SelectItem value="bronze">Bronze</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Supplier Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="factory">Factory</SelectItem>
                      <SelectItem value="manufacturer">Manufacturer</SelectItem>
                      <SelectItem value="processor">Processor</SelectItem>
                      <SelectItem value="importer">Importer</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Contract Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Contracts</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="expiring">Expiring</SelectItem>
                      <SelectItem value="expired">Expired</SelectItem>
                      <SelectItem value="negotiating">Negotiating</SelectItem>
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
              {Math.min(indexOfLastItem, sortedSuppliers.length)} of{" "}
              {sortedSuppliers.length} suppliers
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Factory className="h-3 w-3 mr-1" />
              {sortedSuppliers.length} suppliers
            </Badge>
          </div>

          {/* Suppliers Grid */}
          {sortedSuppliers.length === 0 ? (
            <Card className="py-12">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  No suppliers found
                </h3>
                <p className="text-muted-foreground mb-4">
                  No suppliers match your current filters
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery("");
                    setTierFilter("all");
                    setTypeFilter("all");
                    setStatusFilter("all");
                  }}
                >
                  Clear filters
                </Button>
              </div>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentSuppliers.map((supplier) => (
                <Card
                  key={supplier.id}
                  className="overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-12 w-12 border-2 border-background">
                          <AvatarFallback
                            className={cn(
                              "text-white font-semibold",
                              supplier.tier === "platinum"
                                ? "bg-indigo-600"
                                : supplier.tier === "gold"
                                  ? "bg-amber-600"
                                  : supplier.tier === "silver"
                                    ? "bg-gray-600"
                                    : supplier.tier === "bronze"
                                      ? "bg-orange-600"
                                      : "bg-green-600",
                            )}
                          >
                            {getInitials(supplier.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <Link
                              to={`/distributor/factories/${supplier.id}`}
                              className="text-lg font-semibold hover:text-primary transition-colors"
                            >
                              {supplier.name}
                            </Link>
                            {supplier.verified && (
                              <Badge
                                variant="outline"
                                className="h-5 px-1 bg-green-50 text-green-700 border-green-200"
                              >
                                <Shield className="h-3 w-3 mr-0.5" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge
                              variant="outline"
                              className={typeColors[supplier.type]}
                            >
                              {supplier.type.charAt(0).toUpperCase() +
                                supplier.type.slice(1)}
                            </Badge>
                            {getTierBadge(supplier.tier)}
                          </div>
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
                            onClick={() => {
                              setSelectedSupplier(supplier);
                              setShowSupplierDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Partnership
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Contract
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            Contact
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <BarChart3 className="h-4 w-4 mr-2" />
                            Performance
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Location & Contact */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {supplier.location}, {supplier.region}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>Est. {supplier.established}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{supplier.contactPhone}</span>
                      </div>
                    </div>

                    {/* Rating & Performance */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">
                            {supplier.rating}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Rating
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <span className="text-sm font-semibold">
                          {supplier.onTimeDelivery}%
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          On-Time
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <span className="text-sm font-semibold">
                          {supplier.leadTime}
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Lead Time
                        </p>
                      </div>
                    </div>

                    {/* Contract Info */}
                    <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium">Contract</span>
                        <Badge
                          variant="outline"
                          className={
                            contractStatusColors[supplier.contractStatus]
                          }
                        >
                          {supplier.contractStatus.charAt(0).toUpperCase() +
                            supplier.contractStatus.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Started</span>
                        <span className="font-medium">
                          {formatDate(supplier.contractStart)}
                        </span>
                      </div>
                      {supplier.contractEnd && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Ends</span>
                          <span
                            className={cn(
                              "font-medium",
                              supplier.contractStatus === "expiring" &&
                                "text-amber-600",
                            )}
                          >
                            {formatDate(supplier.contractEnd)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Credit & Orders */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Credit Limit
                        </span>
                        <span className="font-medium">
                          {formatPrice(supplier.creditLimit)}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Used</span>
                          <span className="font-medium">
                            {formatPrice(supplier.creditUsed)}
                          </span>
                        </div>
                        <Progress
                          value={
                            (supplier.creditUsed / supplier.creditLimit) * 100
                          }
                          className="h-1.5"
                        />
                      </div>
                      <div className="flex justify-between text-sm pt-1">
                        <span className="text-muted-foreground">
                          Total Orders
                        </span>
                        <span className="font-medium">
                          {supplier.totalOrders}
                        </span>
                      </div>
                    </div>

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {supplier.categories.slice(0, 3).map((cat) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="text-[10px] bg-muted/50"
                        >
                          {cat}
                        </Badge>
                      ))}
                      {supplier.categories.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{supplier.categories.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Issues Warning */}
                    {(supplier.issues || 0) > 0 && (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-2 mb-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-xs text-red-700">
                            {supplier.issues} open{" "}
                            {supplier.issues === 1 ? "issue" : "issues"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" className="flex-1" asChild>
                        <Link
                          to={`/distributor/factory-orders?supplier=${supplier.id}`}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          Orders
                        </Link>
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Scale className="h-4 w-4 mr-2" />
                        Contract
                      </Button>
                    </div>
                  </CardContent>
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

      {/* Supplier Details Dialog */}
      <Dialog open={showSupplierDialog} onOpenChange={setShowSupplierDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Supplier Partnership Details</DialogTitle>
            <DialogDescription>
              Complete information about {selectedSupplier?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedSupplier && (
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-6 py-2">
                {/* Basic Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Building2 className="h-4 w-4" />
                    Company Information
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Company Name
                      </span>
                      <span className="text-xs font-medium">
                        {selectedSupplier.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Type
                      </span>
                      <span className="text-xs font-medium capitalize">
                        {selectedSupplier.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Location
                      </span>
                      <span className="text-xs font-medium">
                        {selectedSupplier.location}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Established
                      </span>
                      <span className="text-xs font-medium">
                        {selectedSupplier.established}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Products
                      </span>
                      <span className="text-xs font-medium">
                        {selectedSupplier.products}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Contact Information
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Contact Person
                      </span>
                      <span className="text-xs font-medium">
                        {selectedSupplier.contactPerson}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Phone
                      </span>
                      <span className="text-xs font-medium">
                        {selectedSupplier.contactPhone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Email
                      </span>
                      <span className="text-xs font-medium">
                        {selectedSupplier.contactEmail}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Performance Metrics */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Performance Metrics
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        On-Time Delivery
                      </p>
                      <p className="text-lg font-semibold text-green-600">
                        {selectedSupplier.onTimeDelivery}%
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Quality Rating
                      </p>
                      <p className="text-lg font-semibold flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {selectedSupplier.qualityRating}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Communication
                      </p>
                      <p className="text-lg font-semibold">
                        {selectedSupplier.communicationRating}/5.0
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Response Time
                      </p>
                      <p className="text-lg font-semibold">
                        {selectedSupplier.responseTime}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Contract Details */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium flex items-center gap-2">
                    <FileCheck className="h-4 w-4" />
                    Contract Details
                  </h4>
                  <div className="bg-muted/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Contract Period
                      </span>
                      <span className="text-xs font-medium">
                        {formatDate(selectedSupplier.contractStart)} -{" "}
                        {selectedSupplier.contractEnd
                          ? formatDate(selectedSupplier.contractEnd)
                          : "Ongoing"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Status
                      </span>
                      <Badge
                        variant="outline"
                        className={
                          contractStatusColors[selectedSupplier.contractStatus]
                        }
                      >
                        {selectedSupplier.contractStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Payment Terms
                      </span>
                      <span className="text-xs font-medium">
                        {selectedSupplier.paymentTerms}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Credit Limit
                      </span>
                      <span className="text-xs font-medium">
                        {formatPrice(selectedSupplier.creditLimit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Credit Used
                      </span>
                      <span className="text-xs font-medium">
                        {formatPrice(selectedSupplier.creditUsed)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedSupplier.notes && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Notes</h4>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        {selectedSupplier.notes}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSupplierDialog(false)}
            >
              Close
            </Button>
            <Button asChild>
              <Link to={`/distributor/factories/${selectedSupplier?.id}`}>
                View Full Profile
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SupplierPartnershipsPage;
