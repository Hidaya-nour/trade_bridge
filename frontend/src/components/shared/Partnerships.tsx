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
  Store,
  UserCheck,
  UserX,
  UserPlus,
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
  StatsCard,
  StatusBadge,
  EmptyState,
  PaginationBar,
  SearchFilter,
} from "@/components";
import { formatPrice, formatDate } from "@/lib/formatters";
import { getInitials, cn } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

export type PartnershipRole = "distributor" | "factory";

export interface Partner {
  id: number;
  name: string;
  logo?: string;
  type:
    | "factory"
    | "manufacturer"
    | "processor"
    | "importer"
    | "distributor"
    | "wholesaler"
    | "agent";
  category: string[];
  location: string;
  region: string;
  established: string;
  verified: boolean;
  tier: "platinum" | "gold" | "silver" | "bronze" | "new";
  rating: number;
  totalOrders: number;
  totalValue: number; // Total spend or revenue
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
  contractStatus: "active" | "expiring" | "expired" | "negotiating" | "pending";
  products?: number; // For suppliers
  agents?: number; // For factories (agents representing them)
  categories: string[];
  contactPerson: string;
  contactPhone: string;
  contactEmail: string;
  lastOrderDate: string;
  nextDeliveryDate?: string;
  issues?: number;
  notes?: string;

  // Agent-specific fields
  agentId?: number;
  agentName?: string;
  agentRegion?: string;
  agentStatus?: "active" | "inactive" | "pending";
}

export interface PartnershipConfig {
  role: PartnershipRole;
  title: string;
  description: string;
  partnerType: string; // "Supplier" or "Distributor"
  partnerPath: string; // "/suppliers" or "/distributors"
  icon: React.ElementType; // Factory or Store
  showAgents: boolean; // Factory needs agent management
  showCredit: boolean; // Both need credit tracking
  showContracts: boolean; // Both need contract tracking
}

// ============================================================================
// PROPS
// ============================================================================

interface PartnershipsProps {
  config: PartnershipConfig;
  partners: Partner[];
  agents?: Partner[]; // For factory's agents
  onAddPartner: () => void;
  onEditPartner: (id: number) => void;
  onViewPartner: (id: number) => void;
  onContactPartner: (id: number) => void;
  onApproveAgent?: (agentId: number) => void; // For factory
  onRejectAgent?: (agentId: number) => void; // For factory
}

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
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
};

const typeColors = {
  factory: "bg-blue-100 text-blue-800 border-blue-200",
  manufacturer: "bg-purple-100 text-purple-800 border-purple-200",
  processor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  importer: "bg-amber-100 text-amber-800 border-amber-200",
  distributor: "bg-cyan-100 text-cyan-800 border-cyan-200",
  wholesaler: "bg-pink-100 text-pink-800 border-pink-200",
  agent: "bg-orange-100 text-orange-800 border-orange-200",
};

const agentStatusColors = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-gray-100 text-gray-800",
  pending: "bg-yellow-100 text-yellow-800",
};

// ============================================================================
// COMPONENT
// ============================================================================

export const Partnerships: React.FC<PartnershipsProps> = ({
  config,
  partners: initialPartners,
  agents = [],
  onAddPartner,
  onEditPartner,
  onViewPartner,
  onContactPartner,
  onApproveAgent,
  onRejectAgent,
}) => {
  const [partners, setPartners] = useState<Partner[]>(initialPartners);
  const [searchQuery, setSearchQuery] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showPartnerDialog, setShowPartnerDialog] = useState(false);
  const [showApproveDialog, setShowApproveDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Partner | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("all");
  const [agentsTab, setAgentsTab] = useState("active");
  const itemsPerPage = 6;

  // Filter partners
  const filteredPartners = partners.filter((partner) => {
    const matchesSearch =
      searchQuery === "" ||
      partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.category.some((c) =>
        c.toLowerCase().includes(searchQuery.toLowerCase()),
      );

    const matchesTier = tierFilter === "all" || partner.tier === tierFilter;
    const matchesType = typeFilter === "all" || partner.type === typeFilter;
    const matchesStatus =
      statusFilter === "all" || partner.contractStatus === statusFilter;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "platinum" && partner.tier === "platinum") ||
      (activeTab === "expiring" && partner.contractStatus === "expiring") ||
      (activeTab === "issues" && (partner.issues || 0) > 0) ||
      (activeTab === "pending" && partner.contractStatus === "pending");

    return (
      matchesSearch && matchesTier && matchesType && matchesStatus && matchesTab
    );
  });

  // Sort partners by tier and rating
  const sortedPartners = [...filteredPartners].sort((a, b) => {
    const tierRank = { platinum: 1, gold: 2, silver: 3, bronze: 4, new: 5 };
    return (
      (tierRank[a.tier] || 99) - (tierRank[b.tier] || 99) || b.rating - a.rating
    );
  });

  // Filter agents for factory
  const filteredAgents = agents.filter((agent) => {
    if (agentsTab === "all") return true;
    if (agentsTab === "active") return agent.agentStatus === "active";
    if (agentsTab === "pending") return agent.agentStatus === "pending";
    if (agentsTab === "inactive") return agent.agentStatus === "inactive";
    return true;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPartners = sortedPartners.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );
  const totalPages = Math.ceil(sortedPartners.length / itemsPerPage);

  // Stats
  const totalPartners = partners.length;
  const platinumPartners = partners.filter((p) => p.tier === "platinum").length;
  const activeContracts = partners.filter(
    (p) => p.contractStatus === "active",
  ).length;
  const expiringContracts = partners.filter(
    (p) => p.contractStatus === "expiring",
  ).length;
  const pendingContracts = partners.filter(
    (p) => p.contractStatus === "pending",
  ).length;
  const totalCreditLimit = partners.reduce((sum, p) => sum + p.creditLimit, 0);
  const totalCreditUsed = partners.reduce((sum, p) => sum + p.creditUsed, 0);
  const totalValue = partners.reduce((sum, p) => sum + p.totalValue, 0);

  const statsData = [
    {
      title: `Total ${config.partnerType}s`,
      value: totalPartners,
      subtext: `${platinumPartners} Platinum`,
      icon: Users,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Active Contracts",
      value: activeContracts,
      subtext: `${expiringContracts} expiring, ${pendingContracts} pending`,
      icon: FileCheck,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      title: "Total Value",
      value: formatPrice(totalValue),
      subtext: "All time",
      icon: DollarSign,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-600",
    },
    {
      title: "Credit Utilization",
      value: `${Math.round((totalCreditUsed / totalCreditLimit) * 100)}%`,
      subtext: `${formatPrice(totalCreditUsed)} / ${formatPrice(totalCreditLimit)}`,
      icon: CreditCard,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  const PartnerIcon = config.icon;

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {config.title}
            </h1>
            <Badge
              variant="outline"
              className="bg-blue-50 text-blue-700 border-blue-200"
            >
              <PartnerIcon className="h-3 w-3 mr-1" />
              {totalPartners} {config.partnerType}s
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{config.description}</p>
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
              <DropdownMenuItem onClick={() => console.log("Export CSV")}>
                <FileText className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Export Excel")}>
                <FileText className="h-4 w-4 mr-2" />
                Export as Excel
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => console.log("Export PDF")}>
                <FileText className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={onAddPartner}>
            <Plus className="h-4 w-4 mr-2" />
            Add {config.partnerType}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsData.map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
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
              <SearchFilter
                placeholder={`Search ${config.partnerType.toLowerCase()}s by name, location, or category...`}
                onSearch={setSearchQuery}
                filterComponent={
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
                        <SelectValue placeholder="Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="factory">Factory</SelectItem>
                        <SelectItem value="manufacturer">
                          Manufacturer
                        </SelectItem>
                        <SelectItem value="processor">Processor</SelectItem>
                        <SelectItem value="distributor">Distributor</SelectItem>
                        <SelectItem value="wholesaler">Wholesaler</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Contract Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Contracts</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="expiring">Expiring</SelectItem>
                        <SelectItem value="expired">Expired</SelectItem>
                        <SelectItem value="negotiating">Negotiating</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                }
              />
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, sortedPartners.length)} of{" "}
              {sortedPartners.length} {config.partnerType.toLowerCase()}s
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <PartnerIcon className="h-3 w-3 mr-1" />
              {sortedPartners.length} {config.partnerType.toLowerCase()}s
            </Badge>
          </div>

          {/* Partners Grid */}
          {sortedPartners.length === 0 ? (
            <EmptyState
              icon={Users}
              title={`No ${config.partnerType.toLowerCase()}s found`}
              description={`No ${config.partnerType.toLowerCase()}s match your current filters`}
              actionLabel="Clear filters"
              onAction={() => {
                setSearchQuery("");
                setTierFilter("all");
                setTypeFilter("all");
                setStatusFilter("all");
              }}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentPartners.map((partner) => (
                <Card
                  key={partner.id}
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
                              partner.tier === "platinum"
                                ? "bg-indigo-600"
                                : partner.tier === "gold"
                                  ? "bg-amber-600"
                                  : partner.tier === "silver"
                                    ? "bg-gray-600"
                                    : partner.tier === "bronze"
                                      ? "bg-orange-600"
                                      : "bg-green-600",
                            )}
                          >
                            {getInitials(partner.name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Link
                              to={`/${config.role}${config.partnerPath}/${partner.id}`}
                              className="text-lg font-semibold hover:text-primary transition-colors"
                            >
                              {partner.name}
                            </Link>
                            {partner.verified && (
                              <Badge
                                variant="outline"
                                className="h-5 px-1 bg-green-50 text-green-700 border-green-200"
                              >
                                <Shield className="h-3 w-3 mr-0.5" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <Badge
                              variant="outline"
                              className={
                                typeColors[
                                  partner.type as keyof typeof typeColors
                                ]
                              }
                            >
                              {partner.type.charAt(0).toUpperCase() +
                                partner.type.slice(1)}
                            </Badge>
                            {getTierBadge(partner.tier)}
                            {partner.contractStatus === "pending" && (
                              <Badge
                                variant="outline"
                                className="bg-yellow-100 text-yellow-800"
                              >
                                Pending
                              </Badge>
                            )}
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
                              setSelectedPartner(partner);
                              setShowPartnerDialog(true);
                            }}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onEditPartner(partner.id)}
                          >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit Partnership
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <FileText className="h-4 w-4 mr-2" />
                            Contract
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onContactPartner(partner.id)}
                          >
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
                          {partner.location}, {partner.region}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>Est. {partner.established}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{partner.contactPhone}</span>
                      </div>
                    </div>

                    {/* Rating & Performance */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-semibold">
                            {partner.rating}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          Rating
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <span className="text-sm font-semibold">
                          {partner.onTimeDelivery}%
                        </span>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          On-Time
                        </p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2 text-center">
                        <span className="text-sm font-semibold">
                          {partner.leadTime}
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
                            contractStatusColors[partner.contractStatus]
                          }
                        >
                          {partner.contractStatus.charAt(0).toUpperCase() +
                            partner.contractStatus.slice(1)}
                        </Badge>
                      </div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">Started</span>
                        <span className="font-medium">
                          {formatDate(partner.contractStart)}
                        </span>
                      </div>
                      {partner.contractEnd && (
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Ends</span>
                          <span
                            className={cn(
                              "font-medium",
                              partner.contractStatus === "expiring" &&
                                "text-amber-600",
                            )}
                          >
                            {formatDate(partner.contractEnd)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Credit & Orders */}
                    {config.showCredit && (
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Credit Limit
                          </span>
                          <span className="font-medium">
                            {formatPrice(partner.creditLimit)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Used</span>
                            <span className="font-medium">
                              {formatPrice(partner.creditUsed)}
                            </span>
                          </div>
                          <Progress
                            value={
                              (partner.creditUsed / partner.creditLimit) * 100
                            }
                            className="h-1.5"
                          />
                        </div>
                        <div className="flex justify-between text-sm pt-1">
                          <span className="text-muted-foreground">
                            Total Orders
                          </span>
                          <span className="font-medium">
                            {partner.totalOrders}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Categories */}
                    <div className="flex flex-wrap gap-1 mb-4">
                      {partner.categories.slice(0, 3).map((cat) => (
                        <Badge
                          key={cat}
                          variant="outline"
                          className="text-[10px] bg-muted/50"
                        >
                          {cat}
                        </Badge>
                      ))}
                      {partner.categories.length > 3 && (
                        <Badge variant="outline" className="text-[10px]">
                          +{partner.categories.length - 3}
                        </Badge>
                      )}
                    </div>

                    {/* Issues Warning */}
                    {(partner.issues || 0) > 0 && (
                      <div className="bg-red-50 border border-red-100 rounded-lg p-2 mb-4">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-4 w-4 text-red-600" />
                          <span className="text-xs text-red-700">
                            {partner.issues} open{" "}
                            {partner.issues === 1 ? "issue" : "issues"}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        className="flex-1"
                        onClick={() => onViewPartner(partner.id)}
                      >
                        <Package className="h-4 w-4 mr-2" />
                        Orders
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <FileText className="h-4 w-4 mr-2" />
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
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Agents Section - Only for Factory */}
      {config.showAgents && agents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Sales Agents</CardTitle>
            <CardDescription>
              Manage agents who represent your factory to distributors
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs
              value={agentsTab}
              onValueChange={setAgentsTab}
              className="space-y-4"
            >
              <TabsList>
                <TabsTrigger value="active">
                  Active (
                  {agents.filter((a) => a.agentStatus === "active").length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending (
                  {agents.filter((a) => a.agentStatus === "pending").length})
                </TabsTrigger>
                <TabsTrigger value="inactive">
                  Inactive (
                  {agents.filter((a) => a.agentStatus === "inactive").length})
                </TabsTrigger>
                <TabsTrigger value="all">All ({agents.length})</TabsTrigger>
              </TabsList>

              <TabsContent value={agentsTab}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredAgents.map((agent) => (
                    <Card key={agent.id} className="overflow-hidden">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className="bg-orange-100 text-orange-700">
                                {getInitials(agent.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{agent.name}</h4>
                              <p className="text-xs text-muted-foreground">
                                {agent.agentRegion}
                              </p>
                            </div>
                          </div>
                          <Badge
                            className={
                              agentStatusColors[agent.agentStatus || "pending"]
                            }
                          >
                            {agent.agentStatus}
                          </Badge>
                        </div>

                        <div className="space-y-2 mb-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">
                              {agent.contactPhone}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">
                              {agent.contactEmail}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs">{agent.location}</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="bg-muted/50 rounded p-2 text-center">
                            <p className="text-xs font-medium">
                              {agent.totalOrders}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Orders
                            </p>
                          </div>
                          <div className="bg-muted/50 rounded p-2 text-center">
                            <p className="text-xs font-medium">
                              {formatPrice(agent.totalValue)}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Revenue
                            </p>
                          </div>
                        </div>

                        {agent.agentStatus === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              className="flex-1 bg-green-600 hover:bg-green-700"
                              onClick={() => {
                                setSelectedAgent(agent);
                                setShowApproveDialog(true);
                              }}
                            >
                              <UserCheck className="h-3 w-3 mr-2" />
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1 text-red-600"
                              onClick={() => {
                                setSelectedAgent(agent);
                                setShowRejectDialog(true);
                              }}
                            >
                              <UserX className="h-3 w-3 mr-2" />
                              Reject
                            </Button>
                          </div>
                        )}

                        {agent.agentStatus === "active" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <MessageSquare className="h-3 w-3 mr-2" />
                              Contact
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="flex-1"
                            >
                              <BarChart3 className="h-3 w-3 mr-2" />
                              Performance
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Add New Agent
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Partner Details Dialog */}
      <Dialog open={showPartnerDialog} onOpenChange={setShowPartnerDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>{config.partnerType} Partnership Details</DialogTitle>
            <DialogDescription>
              Complete information about {selectedPartner?.name}
            </DialogDescription>
          </DialogHeader>

          {selectedPartner && (
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
                        {selectedPartner.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Type
                      </span>
                      <span className="text-xs font-medium capitalize">
                        {selectedPartner.type}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Location
                      </span>
                      <span className="text-xs font-medium">
                        {selectedPartner.location}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Established
                      </span>
                      <span className="text-xs font-medium">
                        {selectedPartner.established}
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
                        {selectedPartner.contactPerson}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Phone
                      </span>
                      <span className="text-xs font-medium">
                        {selectedPartner.contactPhone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Email
                      </span>
                      <span className="text-xs font-medium">
                        {selectedPartner.contactEmail}
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
                        {selectedPartner.onTimeDelivery}%
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Quality Rating
                      </p>
                      <p className="text-lg font-semibold flex items-center">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                        {selectedPartner.qualityRating}
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Communication
                      </p>
                      <p className="text-lg font-semibold">
                        {selectedPartner.communicationRating}/5.0
                      </p>
                    </div>
                    <div className="bg-muted/50 rounded-lg p-3">
                      <p className="text-xs text-muted-foreground mb-1">
                        Response Time
                      </p>
                      <p className="text-lg font-semibold">
                        {selectedPartner.responseTime}
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
                        {formatDate(selectedPartner.contractStart)} -{" "}
                        {selectedPartner.contractEnd
                          ? formatDate(selectedPartner.contractEnd)
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
                          contractStatusColors[selectedPartner.contractStatus]
                        }
                      >
                        {selectedPartner.contractStatus}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Payment Terms
                      </span>
                      <span className="text-xs font-medium">
                        {selectedPartner.paymentTerms}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Credit Limit
                      </span>
                      <span className="text-xs font-medium">
                        {formatPrice(selectedPartner.creditLimit)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-xs text-muted-foreground">
                        Credit Used
                      </span>
                      <span className="text-xs font-medium">
                        {formatPrice(selectedPartner.creditUsed)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Notes */}
                {selectedPartner.notes && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-medium">Notes</h4>
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        {selectedPartner.notes}
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
              onClick={() => setShowPartnerDialog(false)}
            >
              Close
            </Button>
            <Button asChild>
              <Link
                to={`/${config.role}${config.partnerPath}/${selectedPartner?.id}`}
              >
                View Full Profile
              </Link>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Approve Agent Dialog */}
      <AlertDialog open={showApproveDialog} onOpenChange={setShowApproveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Approve Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to approve {selectedAgent?.name} as a sales
              agent?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedAgent && onApproveAgent) {
                  onApproveAgent(selectedAgent.id);
                  setShowApproveDialog(false);
                }
              }}
              className="bg-green-600 hover:bg-green-700"
            >
              Approve Agent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reject Agent Dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Agent</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reject {selectedAgent?.name}'s
              application?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedAgent && onRejectAgent) {
                  onRejectAgent(selectedAgent.id);
                  setShowRejectDialog(false);
                }
              }}
              className="bg-red-600 hover:bg-red-700"
            >
              Reject Agent
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
