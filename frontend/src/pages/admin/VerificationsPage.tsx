import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Download,
  Search,
  Filter,
  Factory,
  Store,
  Package,
  Truck,
  Clock,
  AlertCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Building2,
  CreditCard,
  FileCheck,
  Ban,
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  StatsCard,
  SectionHeader,
  StatusBadge,
  EmptyState,
  PaginationBar,
} from "@/components/shared";
import { formatDate } from "@/lib/formatters";
import { cn, getInitials } from "@/lib/utils";

// ============================================================================
// TYPES
// ============================================================================

type VerificationType = "factory" | "distributor" | "driver";
type VerificationStatus =
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "more_info";

interface VerificationRequest {
  id: number;
  type: VerificationType;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  location: string;
  submittedDate: string;
  documents: {
    name: string;
    url: string;
    type: "license" | "tin" | "certificate" | "id" | "other";
  }[];
  status: VerificationStatus;
  priority: "high" | "medium" | "low";
  notes?: string;
  reviewedBy?: string;
  reviewedDate?: string;
  rejectionReason?: string;
}

// ============================================================================
// MOCK DATA
// ============================================================================

const mockVerifications: VerificationRequest[] = [
  {
    id: 101,
    type: "factory",
    businessName: "Bahir Dar Honey Processing",
    ownerName: "Mulugeta Dessie",
    email: "info@bahirdarhoney.com",
    phone: "+251 58 234 5678",
    location: "Bahir Dar",
    submittedDate: "2026-02-12",
    documents: [
      { name: "Business License.pdf", url: "#", type: "license" },
      { name: "TIN Certificate.pdf", url: "#", type: "tin" },
      { name: "Quality Certificate.pdf", url: "#", type: "certificate" },
    ],
    status: "pending",
    priority: "high",
  },
  {
    id: 102,
    type: "distributor",
    businessName: "Hawassa Wholesale Trading",
    ownerName: "Tigist Haile",
    email: "info@hawassawholesale.com",
    phone: "+251 46 123 4567",
    location: "Hawassa",
    submittedDate: "2026-02-11",
    documents: [
      { name: "Business License.pdf", url: "#", type: "license" },
      { name: "Tax Clearance.pdf", url: "#", type: "tin" },
    ],
    status: "under_review",
    priority: "medium",
  },
  {
    id: 103,
    type: "driver",
    businessName: "Tsegaye Mulugeta Transport",
    ownerName: "Tsegaye Mulugeta",
    email: "tsegaye.m@driver.com",
    phone: "+251 91 234 5678",
    location: "Adama",
    submittedDate: "2026-02-10",
    documents: [
      { name: "Drivers License.pdf", url: "#", type: "license" },
      { name: "Vehicle Registration.pdf", url: "#", type: "certificate" },
    ],
    status: "pending",
    priority: "low",
  },
  {
    id: 104,
    type: "factory",
    businessName: "Adama Plastics Manufacturing",
    ownerName: "Kebede Asfaw",
    email: "info@adamaplastics.com",
    phone: "+251 22 678 9012",
    location: "Adama",
    submittedDate: "2026-02-09",
    documents: [
      { name: "Business License.pdf", url: "#", type: "license" },
      { name: "TIN Certificate.pdf", url: "#", type: "tin" },
      { name: "Environmental Certificate.pdf", url: "#", type: "certificate" },
    ],
    status: "more_info",
    priority: "high",
    notes: "Need additional environmental compliance documents",
  },
  {
    id: 105,
    type: "distributor",
    businessName: "Mekelle Steel Distributors",
    ownerName: "Berhanu Tekle",
    email: "info@mekellesteel.com",
    phone: "+251 34 567 8901",
    location: "Mekelle",
    submittedDate: "2026-02-08",
    documents: [
      { name: "Business License.pdf", url: "#", type: "license" },
      { name: "TIN Certificate.pdf", url: "#", type: "tin" },
    ],
    status: "approved",
    priority: "medium",
    reviewedBy: "Admin User",
    reviewedDate: "2026-02-13",
  },
  {
    id: 106,
    type: "factory",
    businessName: "Oromia Dairy Products",
    ownerName: "Worku Desta",
    email: "info@oromiadairy.com",
    phone: "+251 22 345 6789",
    location: "Adama",
    submittedDate: "2026-02-07",
    documents: [
      { name: "Business License.pdf", url: "#", type: "license" },
      { name: "TIN Certificate.pdf", url: "#", type: "tin" },
      { name: "Health Certificate.pdf", url: "#", type: "certificate" },
    ],
    status: "rejected",
    priority: "low",
    reviewedBy: "Admin User",
    reviewedDate: "2026-02-12",
    rejectionReason:
      "Incomplete documentation - missing health inspection certificate",
  },
];

// ============================================================================
// CONSTANTS
// ============================================================================

const typeIcons: Record<VerificationType, React.ElementType> = {
  factory: Factory,
  distributor: Package,
  driver: Truck,
};

const typeColors: Record<VerificationType, string> = {
  factory: "bg-green-100 text-green-700",
  distributor: "bg-purple-100 text-purple-700",
  driver: "bg-amber-100 text-amber-700",
};

const statusColors: Record<VerificationStatus, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  under_review: "bg-blue-100 text-blue-800 border-blue-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  more_info: "bg-orange-100 text-orange-800 border-orange-200",
};

const statusLabels: Record<VerificationStatus, string> = {
  pending: "Pending",
  under_review: "Under Review",
  approved: "Approved",
  rejected: "Rejected",
  more_info: "More Info Needed",
};

// ============================================================================
// COMPONENT
// ============================================================================

export const VerificationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("pending");
  const [selectedRequest, setSelectedRequest] =
    useState<VerificationRequest | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter verification requests
  const filteredRequests = mockVerifications.filter((req) => {
    const matchesSearch =
      searchQuery === "" ||
      req.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      req.email.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = selectedType === "all" || req.type === selectedType;
    const matchesStatus =
      selectedStatus === "all" || req.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Stats
  const stats = {
    pending: mockVerifications.filter((r) => r.status === "pending").length,
    underReview: mockVerifications.filter((r) => r.status === "under_review")
      .length,
    approved: mockVerifications.filter((r) => r.status === "approved").length,
    rejected: mockVerifications.filter((r) => r.status === "rejected").length,
  };

  // Handle approve
  const handleApprove = (request: VerificationRequest) => {
    console.log("Approving:", request);
    // In real app, call API
    setShowDetailsDialog(false);
    // Show success toast
  };

  // Handle reject
  const handleReject = () => {
    console.log("Rejecting:", selectedRequest?.id, "Reason:", rejectionReason);
    setShowRejectDialog(false);
    setShowDetailsDialog(false);
    setRejectionReason("");
    // In real app, call API
  };

  // Handle request more info
  const handleRequestMoreInfo = (request: VerificationRequest) => {
    console.log("Requesting more info for:", request.id);
    setShowDetailsDialog(false);
    // In real app, call API
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Supplier & Driver Verifications
          </h1>
          <p className="text-muted-foreground mt-1">
            Review and verify new supplier, distributor, factory, and driver
            applications
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Pending"
          value={stats.pending}
          icon={Clock}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
          subtext="Awaiting review"
        />
        <StatsCard
          title="Under Review"
          value={stats.underReview}
          icon={Eye}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          subtext="Being processed"
        />
        <StatsCard
          title="Approved"
          value={stats.approved}
          icon={CheckCircle2}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          subtext="Verified suppliers"
        />
        <StatsCard
          title="Rejected"
          value={stats.rejected}
          icon={XCircle}
          iconBg="bg-red-100"
          iconColor="text-red-600"
          subtext="Not approved"
        />
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by business, owner, email..."
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="factory">Factories</SelectItem>
                <SelectItem value="distributor">Distributors</SelectItem>
                <SelectItem value="driver">Drivers</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="more_info">More Info Needed</SelectItem>
                <SelectItem value="all">All Statuses</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Verifications List */}
      {paginatedRequests.length === 0 ? (
        <EmptyState
          icon={Shield}
          title="No verification requests found"
          description="All applications have been processed"
        />
      ) : (
        <div className="space-y-4">
          {paginatedRequests.map((request) => {
            const TypeIcon = typeIcons[request.type];
            return (
              <Card
                key={request.id}
                className="overflow-hidden hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-start gap-4">
                        <div
                          className={cn(
                            "p-3 rounded-full",
                            typeColors[request.type],
                          )}
                        >
                          <TypeIcon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-lg font-semibold">
                              {request.businessName}
                            </h3>
                            <StatusBadge status={request.type} />
                            <Badge className={statusColors[request.status]}>
                              {statusLabels[request.status]}
                            </Badge>
                            <Badge
                              className={cn(
                                "text-xs",
                                request.priority === "high"
                                  ? "bg-red-100 text-red-800"
                                  : request.priority === "medium"
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-green-100 text-green-800",
                              )}
                            >
                              {request.priority} priority
                            </Badge>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Owner
                              </p>
                              <p className="text-sm font-medium">
                                {request.ownerName}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Contact
                              </p>
                              <p className="text-sm">{request.email}</p>
                              <p className="text-sm">{request.phone}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Location
                              </p>
                              <p className="text-sm flex items-center gap-1">
                                <MapPin className="h-3 w-3" />
                                {request.location}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">
                                Submitted
                              </p>
                              <p className="text-sm flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {formatDate(request.submittedDate)}
                              </p>
                            </div>
                          </div>

                          {/* Documents */}
                          <div className="mt-3">
                            <p className="text-sm text-muted-foreground mb-2">
                              Documents
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {request.documents.map((doc, idx) => (
                                <Button
                                  key={idx}
                                  variant="outline"
                                  size="sm"
                                  className="h-7 text-xs gap-1"
                                  asChild
                                >
                                  <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                  >
                                    <FileText className="h-3 w-3" />
                                    {doc.name}
                                  </a>
                                </Button>
                              ))}
                            </div>
                          </div>

                          {request.notes && (
                            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
                              <p className="text-xs text-blue-700">
                                {request.notes}
                              </p>
                            </div>
                          )}

                          {request.rejectionReason && (
                            <div className="mt-3 p-2 bg-red-50 rounded-lg">
                              <p className="text-xs text-red-700">
                                <span className="font-semibold">
                                  Rejection reason:
                                </span>{" "}
                                {request.rejectionReason}
                              </p>
                            </div>
                          )}

                          {request.reviewedBy && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Reviewed by {request.reviewedBy} on{" "}
                              {request.reviewedDate
                                ? formatDate(request.reviewedDate)
                                : "—"}{" "}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    {request.status === "pending" ||
                    request.status === "under_review" ? (
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 w-full"
                          onClick={() => {
                            setSelectedRequest(request);
                            handleApprove(request);
                          }}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-amber-600 w-full"
                          onClick={() => {
                            setSelectedRequest(request);
                            handleRequestMoreInfo(request);
                          }}
                        >
                          <AlertCircle className="h-4 w-4 mr-2" />
                          Request Info
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 w-full"
                          onClick={() => {
                            setSelectedRequest(request);
                            setShowRejectDialog(true);
                          }}
                        >
                          <XCircle className="h-4 w-4 mr-2" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 min-w-[120px]">
                        <Button size="sm" variant="outline" asChild>
                          <Link to={`/admin/users/${request.id}`}>
                            <Eye className="h-4 w-4 mr-2" />
                            View User
                          </Link>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}

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

      {/* Reject Dialog */}
      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Verification Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting this application
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              placeholder="e.g., Incomplete documentation, invalid license, etc."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mt-2"
              rows={4}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowRejectDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectionReason.trim()}
            >
              Reject Application
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VerificationsPage;
