import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Send,
  Megaphone,
  Calendar,
  Users,
  Tag,
  Percent,
  Package,
  ShoppingCart,
  BarChart3,
  Eye,
  Edit,
  Copy,
  Trash2,
  XCircle,
  AlertCircle,
  ChevronRight,
  Plus,
  Download,
  Truck,
  Factory,
  Store,
  MoreVertical,
  MoreVerticalIcon,
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/formatters";
import {
  StatusBadge,
  EmptyState,
  PaginationBar,
  SearchFilter,
  StatsCard,
  SectionHeader,
} from "@/components/shared";

// ============================================================================
// TYPES
// ============================================================================

export type BroadcastRole = "distributor" | "factory";

export interface BroadcastItem {
  id: string;
  title: string;
  description: string;
  type: "discount" | "bogo" | "free-shipping" | "bundle" | "clearance";
  discountType?: "percentage" | "fixed";
  discountValue?: number;
  minOrder?: number;
  maxDiscount?: number;
  startDate: string;
  endDate: string;
  status: "draft" | "scheduled" | "active" | "expired" | "cancelled";
  createdAt: string;
  createdBy: string;
  sentCount: number;
  viewedCount: number;
  redeemedCount: number;
  code?: string;
  priority: "high" | "medium" | "low";
  targetAudience?: "all" | "segment" | "specific";
  audienceSegments?: string[];
}

export interface AudienceSegment {
  id: string;
  name: string;
  count: number;
  description: string;
}

// ============================================================================
// PROPS
// ============================================================================

interface BroadcastPageProps {
  role: BroadcastRole;
  items: BroadcastItem[];
  segments: AudienceSegment[];
  stats: {
    active: number;
    scheduled: number;
    draft: number;
    totalRedemptions: number;
  };
  onCreateItem: (item: any) => void;
  onDeleteItem: (id: string) => void;
  onDuplicateItem: (item: BroadcastItem) => void;
  onUpdateStatus: (id: string, status: string) => void;
}

// ============================================================================
// COMPONENT
// ============================================================================

export const BroadcastPage: React.FC<BroadcastPageProps> = ({
  role,
  items: initialItems,
  segments,
  stats,
  onCreateItem,
  onDeleteItem,
  onDuplicateItem,
  onUpdateStatus,
}) => {
  const [itemList] = useState(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [selectedItem, setSelectedItem] = useState<BroadcastItem | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState("active");
  const itemsPerPage = 6;

  // New item form state
  const [newItem, setNewItem] = useState({
    title: "",
    description: "",
    type: "discount",
    discountType: "percentage",
    discountValue: "",
    minOrder: "",
    maxDiscount: "",
    targetAudience: "all",
    selectedSegments: [] as string[],
    startDate: "",
    endDate: "",
    promoCode: "",
    priority: "medium",
  });

  // Filter items
  const filteredItems = itemList.filter((item) => {
    const matchesSearch =
      searchQuery === "" ||
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.code?.toLowerCase() || "").includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || item.status === statusFilter;
    const matchesType = typeFilter === "all" || item.type === typeFilter;
    const matchesTab =
      activeTab === "all" ||
      (activeTab === "active" && item.status === "active") ||
      (activeTab === "scheduled" && item.status === "scheduled") ||
      (activeTab === "draft" && item.status === "draft");

    return matchesSearch && matchesStatus && matchesType && matchesTab;
  });

  // Sort items by date
  const sortedItems = [...filteredItems].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);

  const getItemSummary = (item: BroadcastItem) => {
    switch (item.type) {
      case "discount":
        return `${item.discountValue}${item.discountType === "percentage" ? "%" : " ETB"} off`;
      case "bogo":
        return "Buy 2 Get 1 Free";
      case "free-shipping":
        return `Free shipping over ${item.minOrder} ETB`;
      case "clearance":
        return `Up to ${item.discountValue}% off`;
      default:
        return "";
    }
  };

  const getAudienceLabel = () => {
    return role === "distributor" ? "Retailers" : "Distributors";
  };

  const getIcon = () => {
    return role === "distributor" ? Store : Factory;
  };

  const getTitle = () => {
    return role === "distributor"
      ? "Broadcast Promotions"
      : "Broadcast Announcements";
  };

  const getDescription = () => {
    return role === "distributor"
      ? "Create and manage promotions to send to your retail customers"
      : "Create and manage announcements to send to your distributor partners";
  };

  const getItemTypeLabel = () => {
    return role === "distributor" ? "promotion" : "announcement";
  };

  const AudienceIcon = getIcon();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">{getTitle()}</h1>
            <Badge
              variant="outline"
              className="bg-purple-50 text-purple-700 border-purple-200"
            >
              <Megaphone className="h-3 w-3 mr-1" />
              {stats.active} Active
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1">{getDescription()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New {role === "distributor" ? "Promotion" : "Announcement"}
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Active"
          value={stats.active}
          icon={Megaphone}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          title="Scheduled"
          value={stats.scheduled}
          icon={Calendar}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          title="Drafts"
          value={stats.draft}
          icon={Edit}
          iconBg="bg-gray-100"
          iconColor="text-gray-600"
        />
        <StatsCard
          title="Redemptions"
          value={stats.totalRedemptions}
          icon={Tag}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
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
              <SearchFilter
                placeholder={`Search ${getItemTypeLabel()}s by title, code, or description...`}
                onSearch={setSearchQuery}
                filterComponent={
                  <div className="flex items-center gap-2">
                    <Select
                      value={statusFilter}
                      onValueChange={setStatusFilter}
                    >
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
                        <SelectValue placeholder="Type" />
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
                }
              />
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              Showing {indexOfFirstItem + 1}-
              {Math.min(indexOfLastItem, sortedItems.length)} of{" "}
              {sortedItems.length} {getItemTypeLabel()}s
            </div>
            <Badge variant="outline" className="px-3 py-1">
              <Megaphone className="h-3 w-3 mr-1" />
              {sortedItems.length} {getItemTypeLabel()}s
            </Badge>
          </div>

          {/* Items Grid */}
          {sortedItems.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title={`No ${getItemTypeLabel()}s found`}
              description={
                activeTab === "draft"
                  ? `You don't have any draft ${getItemTypeLabel()}s. Create your first one!`
                  : activeTab === "scheduled"
                    ? `No scheduled ${getItemTypeLabel()}s found`
                    : activeTab === "active"
                      ? `No active ${getItemTypeLabel()}s running`
                      : `No ${getItemTypeLabel()}s match your current filters`
              }
              actionLabel={`Create ${role === "distributor" ? "Promotion" : "Announcement"}`}
              onAction={() => setShowCreateDialog(true)}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {currentItems.map((item) => (
                <Card
                  key={item.id}
                  className="overflow-hidden hover:shadow-md transition-shadow"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "p-2 rounded-full",
                            item.type === "discount"
                              ? "bg-green-100"
                              : item.type === "bogo"
                                ? "bg-purple-100"
                                : item.type === "free-shipping"
                                  ? "bg-blue-100"
                                  : item.type === "clearance"
                                    ? "bg-red-100"
                                    : "bg-amber-100",
                          )}
                        >
                          {item.type === "discount" && (
                            <Percent className="h-5 w-5 text-green-600" />
                          )}
                          {item.type === "bogo" && (
                            <Tag className="h-5 w-5 text-purple-600" />
                          )}
                          {item.type === "free-shipping" && (
                            <Truck className="h-5 w-5 text-blue-600" />
                          )}
                          {item.type === "clearance" && (
                            <Tag className="h-5 w-5 text-red-600" />
                          )}
                          {item.type === "bundle" && (
                            <Package className="h-5 w-5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base">
                            {item.title}
                          </CardTitle>
                          <CardDescription className="mt-1">
                            {getItemSummary(item)}
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
                            <MoreVerticalIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => setSelectedItem(item)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => onDuplicateItem(item)}
                          >
                            <Copy className="h-4 w-4 mr-2" />
                            Duplicate
                          </DropdownMenuItem>
                          {item.status === "draft" && (
                            <DropdownMenuItem
                              onClick={() =>
                                onUpdateStatus(item.id, "scheduled")
                              }
                            >
                              <Send className="h-4 w-4 mr-2" />
                              Publish
                            </DropdownMenuItem>
                          )}
                          {item.status === "active" && (
                            <DropdownMenuItem
                              className="text-amber-600"
                              onClick={() =>
                                onUpdateStatus(item.id, "cancelled")
                              }
                            >
                              <XCircle className="h-4 w-4 mr-2" />
                              End Early
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setSelectedItem(item);
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
                      {item.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-3">
                      <StatusBadge status={item.status} />
                      <StatusBadge status={item.type} />
                      <StatusBadge status={item.priority} />
                    </div>

                    {item.code && (
                      <div className="bg-muted/50 rounded-lg p-2 mb-3">
                        <span className="text-xs text-muted-foreground">
                          Promo Code:{" "}
                        </span>
                        <code className="text-xs font-mono bg-background px-2 py-1 rounded">
                          {item.code}
                        </code>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>Start: {formatDate(item.startDate)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>End: {formatDate(item.endDate)}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-muted-foreground">Sent</p>
                        <p className="text-lg font-semibold">
                          {item.sentCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Viewed</p>
                        <p className="text-lg font-semibold">
                          {item.viewedCount}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">
                          Redeemed
                        </p>
                        <p className="text-lg font-semibold">
                          {item.redeemedCount}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button
                      className="w-full"
                      variant={item.status === "draft" ? "default" : "outline"}
                      onClick={() => {
                        if (item.status === "draft") {
                          onUpdateStatus(item.id, "scheduled");
                        }
                      }}
                    >
                      {item.status === "draft" ? (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Publish
                        </>
                      ) : item.status === "active" ? (
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
            <PaginationBar
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </TabsContent>
      </Tabs>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Create New {role === "distributor" ? "Promotion" : "Announcement"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details to create a new {getItemTypeLabel()} for your{" "}
              {getAudienceLabel().toLowerCase()}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-6 py-2">
              {/* Basic Information */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Basic Information</h4>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder={
                      role === "distributor"
                        ? "e.g., Flash Sale: 20% Off Electronics"
                        : "e.g., New Product Launch"
                    }
                    value={newItem.title}
                    onChange={(e) =>
                      setNewItem({ ...newItem, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe your promotion..."
                    rows={3}
                    value={newItem.description}
                    onChange={(e) =>
                      setNewItem({ ...newItem, description: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <Select
                      value={newItem.type}
                      onValueChange={(value) =>
                        setNewItem({ ...newItem, type: value })
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
                      value={newItem.priority}
                      onValueChange={(value) =>
                        setNewItem({ ...newItem, priority: value })
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
              {newItem.type === "discount" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Discount Details</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="discountType">Discount Type</Label>
                      <Select
                        value={newItem.discountType}
                        onValueChange={(value) =>
                          setNewItem({ ...newItem, discountType: value })
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
                          newItem.discountType === "percentage"
                            ? "e.g., 20"
                            : "e.g., 500"
                        }
                        value={newItem.discountValue}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
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
                        value={newItem.minOrder}
                        onChange={(e) =>
                          setNewItem({ ...newItem, minOrder: e.target.value })
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
                        value={newItem.maxDiscount}
                        onChange={(e) =>
                          setNewItem({
                            ...newItem,
                            maxDiscount: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                </div>
              )}

              {newItem.type === "free-shipping" && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Free Shipping Details</h4>
                  <div className="space-y-2">
                    <Label htmlFor="minOrder">Minimum Order Amount (ETB)</Label>
                    <Input
                      id="minOrder"
                      type="number"
                      placeholder="e.g., 10000"
                      value={newItem.minOrder}
                      onChange={(e) =>
                        setNewItem({ ...newItem, minOrder: e.target.value })
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
                      value={newItem.startDate}
                      onChange={(e) =>
                        setNewItem({ ...newItem, startDate: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">End Date</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={newItem.endDate}
                      onChange={(e) =>
                        setNewItem({ ...newItem, endDate: e.target.value })
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
                  value={newItem.targetAudience}
                  onValueChange={(value) =>
                    setNewItem({ ...newItem, targetAudience: value })
                  }
                  className="space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="all" id="all" />
                    <Label htmlFor="all">All {getAudienceLabel()}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="segment" id="segment" />
                    <Label htmlFor="segment">Specific Segments</Label>
                  </div>
                </RadioGroup>

                {newItem.targetAudience === "segment" && (
                  <div className="mt-3 space-y-2">
                    <Label>Select Segments</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {segments.map((segment) => (
                        <div
                          key={segment.id}
                          className="flex items-center space-x-2"
                        >
                          <Checkbox
                            id={segment.id}
                            checked={newItem.selectedSegments.includes(
                              segment.id,
                            )}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                setNewItem({
                                  ...newItem,
                                  selectedSegments: [
                                    ...newItem.selectedSegments,
                                    segment.id,
                                  ],
                                });
                              } else {
                                setNewItem({
                                  ...newItem,
                                  selectedSegments:
                                    newItem.selectedSegments.filter(
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
                      value={newItem.promoCode}
                      onChange={(e) =>
                        setNewItem({
                          ...newItem,
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
            <Button
              variant="outline"
              onClick={() => {
                onCreateItem({ ...newItem, status: "draft" });
                setShowCreateDialog(false);
              }}
            >
              Save as Draft
            </Button>
            <Button
              className="bg-purple-600 hover:bg-purple-700"
              onClick={() => {
                onCreateItem({ ...newItem, status: "scheduled" });
                setShowCreateDialog(false);
              }}
            >
              <Send className="h-4 w-4 mr-2" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Delete {role === "distributor" ? "Promotion" : "Announcement"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{selectedItem?.title}"? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (selectedItem) {
                  onDeleteItem(selectedItem.id);
                  setShowDeleteDialog(false);
                }
              }}
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
