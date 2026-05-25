import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import {
  Shield,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  Download,
  Search,
  Factory,
  Package,
  Truck,
  Clock,
  AlertCircle,
  Calendar,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  StatsCard,
  StatusBadge,
  EmptyState,
  PaginationBar,
} from "@/components";
import { WithAsync } from "@/components/shared/WithAsync";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import documentService from "@/services/document.service";
import { authService } from "@/services/auth.service";
import type { Address } from "@/types/address.types";
import type { Document } from "@/types/document.types";
import type { User } from "@/types/user.types";

// ============================================================================
// TYPES
// ============================================================================

type VerificationType = "factory" | "distributor" | "driver";
type VerificationStatus = "pending" | "approved";

interface VerificationRequest {
  id: string;
  type: VerificationType;
  businessName: string;
  ownerName: string;
  email: string;
  phone: string;
  location: string;
  submittedDate: string | Date;
  documents: {
    id: string;
    name: string;
    url: string;
    type: "license" | "tin" | "certificate" | "id" | "other";
    status: "pending" | "verified" | "rejected";
    rejectionReason?: string;
  }[];
  status: VerificationStatus;
  priority: "high" | "medium" | "low";
  userApprovedAt?: User["approved_at"] | null;
  userVerified?: boolean;
  notes?: string;
  reviewedBy?: string;
  reviewedDate?: string | Date;
  rejectionReason?: string;
}

type AdminUser = Partial<User> & { id: string; addresses?: Address[] };
type AdminDocument = Document & { user?: AdminUser };

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
  approved: "bg-green-100 text-green-800 border-green-200",
};

const statusLabels: Record<VerificationStatus, string> = {
  pending: "Not Verified",
  approved: "Verified",
};

const docStatusColors: Record<"pending" | "verified" | "rejected", string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  verified: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const docStatusLabels: Record<"pending" | "verified" | "rejected", string> = {
  pending: "Pending",
  verified: "Verified",
  rejected: "Rejected",
};

// ============================================================================
// COMPONENT
// ============================================================================

export const VerificationsPage: React.FC = () => {
  const [requests, setRequests] = useState<VerificationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [showRejectDialog, setShowRejectDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [rejectingDocumentId, setRejectingDocumentId] = useState<string | null>(
    null,
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const mapDocType = (
    docType: AdminDocument["document_type"],
  ): VerificationRequest["documents"][number]["type"] => {
    switch (docType) {
      case "business_license":
        return "license";
      case "tax_certificate":
        return "tin";
      case "id_card":
        return "id";
      default:
        return "other";
    }
  };

  const formatLocation = (addresses?: Address[]) => {
    if (!addresses || addresses.length === 0) return "Unknown";
    const sorted = [...addresses].sort((a, b) => {
      const aDate = new Date(a.created_at || a.updated_at || 0).getTime();
      const bDate = new Date(b.created_at || b.updated_at || 0).getTime();
      return bDate - aDate;
    });
    const latest = sorted[0];
    const parts = [latest.city, latest.region].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : "Unknown";
  };

  const computeStatus = (
    _docs: AdminDocument[],
    userVerified: boolean,
  ): VerificationStatus => {
    return userVerified ? "approved" : "pending";
  };

  const buildRequests = (docs: AdminDocument[]): VerificationRequest[] => {
    const grouped = new Map<string, AdminDocument[]>();

    docs.forEach((doc) => {
      const user = doc.user;
      if (!user?.id) return;
      if (!["factory", "distributor", "driver"].includes(user.role || "")) {
        return;
      }
      if (!grouped.has(user.id)) grouped.set(user.id, []);
      grouped.get(user.id)!.push(doc);
    });

    return Array.from(grouped.entries()).map(([userId, userDocs]) => {
      const sortedDocs = [...userDocs].sort((a, b) => {
        const aDate = new Date(a.uploaded_at || 0).getTime();
        const bDate = new Date(b.uploaded_at || 0).getTime();
        return bDate - aDate;
      });

      const user = sortedDocs[0]?.user;
      const submittedDate =
        sortedDocs[0]?.uploaded_at || new Date().toISOString();
      const rejectionDoc = sortedDocs.find(
        (doc) => doc.verification_status === "rejected",
      );
      const reviewedDoc = sortedDocs.find((doc) => doc.reviewed_at);

      const userVerified =
        Boolean(user?.verified) || Boolean(user?.approved_at);

      return {
        id: userId,
        type: (user?.role as VerificationType) || "factory",
        businessName:
          user?.business_name ||
          user?.full_name ||
          `User ${userId.slice(0, 8)}`,
        ownerName: user?.full_name || "Unknown",
        email: user?.email || "\u2014",
        phone: user?.phone || "\u2014",
        location: formatLocation(user?.addresses),
        submittedDate,
        documents: sortedDocs.map((doc) => ({
          id: doc.id,
          name:
            doc.original_file_name ||
            `${mapDocType(doc.document_type)} document`,
          url: doc.file_secure_url || "#",
          type: mapDocType(doc.document_type),
          status: doc.verification_status,
          rejectionReason: doc.rejection_reason || undefined,
        })),
        status: computeStatus(sortedDocs, userVerified),
        priority: "medium",
        userApprovedAt: user?.approved_at || null,
        userVerified,
        reviewedBy: reviewedDoc?.verified_by
          ? `Admin ${reviewedDoc.verified_by.slice(0, 8)}`
          : undefined,
        reviewedDate: reviewedDoc?.reviewed_at || undefined,
        rejectionReason: rejectionDoc?.rejection_reason || undefined,
      };
    });
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      const response = await documentService.getAllForAdmin();
      const data = response.data || response;
      setRequests(buildRequests(data || []));
    } catch (error: any) {
      setLoadError(
        error?.response?.data?.message ||
          "Failed to load verification requests",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchRequests();
  }, []);

  // Filter verification requests
  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
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
  }, [requests, searchQuery, selectedType, selectedStatus]);

  // Pagination
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedRequests = filteredRequests.slice(
    startIndex,
    startIndex + itemsPerPage,
  );

  // Stats
  const stats = useMemo(() => {
    return {
      pending: requests.filter((r) => r.status === "pending").length,
      approved: requests.filter((r) => r.status === "approved").length,
    };
  }, [requests]);

  const handleVerifyDocument = async (docId: string) => {
    try {
      await documentService.verifyDocument(docId, "verified");
      await fetchRequests();
    } catch (error) {
      console.error("Verify document failed:", error);
    }
  };

  const handleRejectDocument = async () => {
    if (!rejectingDocumentId) return;
    try {
      await documentService.verifyDocument(
        rejectingDocumentId,
        "rejected",
        rejectionReason,
      );
      setShowRejectDialog(false);
      setRejectionReason("");
      setRejectingDocumentId(null);
      await fetchRequests();
    } catch (error) {
      console.error("Reject document failed:", error);
    }
  };

  const handleApproveUser = async (request: VerificationRequest) => {
    const toastId = toast.loading("Approving user...");
    try {
      await authService.approveUser(request.id);
      setRequests((prev) =>
        prev.map((item) => {
          if (item.id !== request.id) return item;
          return {
            ...item,
            userVerified: true,
            userApprovedAt: new Date().toISOString(),
            status: "approved",
          };
        }),
      );
      toast.success("User approved successfully", { id: toastId });
      await fetchRequests();
    } catch (error) {
      console.error("Approve user failed:", error);
      toast.error("Failed to approve user", { id: toastId });
    }
  };

  // Handle request more info
  const handleRequestMoreInfo = async (request: VerificationRequest) => {
    console.log("Requesting more info for:", request.id);
    // setShowDetailsDialog(false);
  };

  return (
    <WithAsync
      isLoading={isLoading}
      error={loadError}
      loadingComponent={
        <div className="space-y-6">
          <EmptyState
            icon={Shield}
            title="Loading verification requests..."
            description="Fetching the latest data from the database."
          />
        </div>
      }
      errorComponent={
        <div className="space-y-6">
          <EmptyState
            icon={AlertCircle}
            title="Failed to load verifications"
            description={loadError || ""}
          />
        </div>
      }
    >
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
            title="Not Verified"
            value={stats.pending}
            icon={Clock}
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
            subtext="Awaiting verification"
          />
          <StatsCard
            title="Verified"
            value={stats.approved}
            icon={CheckCircle2}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            subtext="Verification complete"
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
                  <SelectItem value="pending">Not Verified</SelectItem>
                  <SelectItem value="approved">Verified</SelectItem>
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
              const canApproveUser =
                request.documents.length > 0 &&
                request.documents.every((doc) => doc.status === "verified") &&
                !request.userVerified;
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
                                  {formatDate(String(request.submittedDate))}
                                </p>
                              </div>
                            </div>

                            {/* Documents */}
                            <div className="mt-3">
                              <p className="text-sm text-muted-foreground mb-2">
                                Documents
                              </p>
                              <div className="space-y-2">
                                {request.documents.map((doc) => (
                                  <div
                                    key={doc.id}
                                    className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 border rounded-md p-2 bg-muted/20"
                                  >
                                    <div className="flex flex-wrap items-center gap-2">
                                      <Button
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
                                      <Badge
                                        variant="outline"
                                        className={docStatusColors[doc.status]}
                                      >
                                        {docStatusLabels[doc.status]}
                                      </Badge>
                                    </div>

                                    {doc.status === "pending" ? (
                                      <div className="flex items-center gap-2">
                                        <Button
                                          size="sm"
                                          className="h-7 text-xs bg-green-600 hover:bg-green-700"
                                          onClick={() =>
                                            void handleVerifyDocument(doc.id)
                                          }
                                        >
                                          <CheckCircle2 className="h-3 w-3 mr-1" />
                                          Verify
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          className="h-7 text-xs text-red-600"
                                          onClick={() => {
                                            setRejectingDocumentId(doc.id);
                                            setShowRejectDialog(true);
                                          }}
                                        >
                                          <XCircle className="h-3 w-3 mr-1" />
                                          Reject
                                        </Button>
                                      </div>
                                    ) : (
                                      doc.rejectionReason && (
                                        <p className="text-xs text-red-700">
                                          {doc.rejectionReason}
                                        </p>
                                      )
                                    )}
                                  </div>
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
                                  ? formatDate(String(request.reviewedDate))
                                  : "\u2014"}{" "}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      {!request.userVerified ? (
                        <div className="flex flex-col gap-2 min-w-[120px]">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 w-full"
                            onClick={() => {
                              handleApproveUser(request);
                            }}
                            disabled={!canApproveUser}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-2" />
                            Approve User
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
        <Dialog
          open={showRejectDialog}
          onOpenChange={(open) => {
            setShowRejectDialog(open);
            if (!open) {
              setRejectingDocumentId(null);
              setRejectionReason("");
            }
          }}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Reject Document</DialogTitle>
              <DialogDescription>
                Please provide a reason for rejecting this document
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
                onClick={handleRejectDocument}
                disabled={!rejectionReason.trim() || !rejectingDocumentId}
              >
                Reject Document
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </WithAsync>
  );
};

export default VerificationsPage;
