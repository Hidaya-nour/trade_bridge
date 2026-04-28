import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusType =
  // Order statuses
  | "pending"
  | "approved"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "closed"
  | "cancelled"
  // Delivery statuses
  | "in-transit"
  | "failed"
  | "assigned"
  | "picked-up"
  // Production statuses
  | "in-progress"
  | "paused"
  | "planned"
  | "completed"
  // Product/Promotion statuses
  | "active"
  | "inactive"
  | "draft"
  | "scheduled"
  | "expired"
  // Payment statuses
  | "paid"
  | "refunded"
  | "pending-payment"
  // User statuses - ✅ ADD THESE
  | "active"
  | "pending"
  | "suspended"
  // Priority types
  | "high"
  | "medium"
  | "low"
  // User roles
  | "retailer"
  | "distributor"
  | "factory"
  | "driver"
  | "admin"
  | "supplier"
  // Promotion types
  | "discount"
  | "bogo"
  | "free-shipping"
  | "bundle"
  | "clearance"
  // Dispute statuses - ✅ ADD THESE
  | "open"
  | "investigating"
  | "resolved"
  | "escalated";

export const statusColorMap: Record<StatusType, string> = {
  // Order statuses
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  closed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",

  // Delivery statuses
  "in-transit": "bg-indigo-100 text-indigo-800 border-indigo-200",
  failed: "bg-red-100 text-red-800 border-red-200",
  assigned: "bg-blue-100 text-blue-800 border-blue-200",
  "picked-up": "bg-cyan-100 text-cyan-800 border-cyan-200",

  // Production statuses
  "in-progress": "bg-green-100 text-green-800 border-green-200",
  paused: "bg-amber-100 text-amber-800 border-amber-200",
  planned: "bg-blue-100 text-blue-800 border-blue-200",
  completed: "bg-gray-100 text-gray-800 border-gray-200",

  // Product/Promotion statuses
  active: "bg-green-100 text-green-800 border-green-200", // ✅ Already exists
  inactive: "bg-gray-100 text-gray-800 border-gray-200",
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  scheduled: "bg-blue-100 text-blue-800 border-blue-200",
  expired: "bg-amber-100 text-amber-800 border-amber-200",

  // Payment statuses
  paid: "bg-green-100 text-green-800 border-green-200",
  refunded: "bg-gray-100 text-gray-800 border-gray-200",
  "pending-payment": "bg-yellow-100 text-yellow-800 border-yellow-200",

  // User statuses - ✅ ONLY ADD THE NEW ONE
  suspended: "bg-red-100 text-red-800 border-red-200", // ✅ Only this is new

  // Priority types
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-green-100 text-green-800 border-green-200",

  // User roles
  retailer: "bg-blue-100 text-blue-800 border-blue-200",
  distributor: "bg-purple-100 text-purple-800 border-purple-200",
  factory: "bg-green-100 text-green-800 border-green-200",
  driver: "bg-amber-100 text-amber-800 border-amber-200",
  admin: "bg-gray-100 text-gray-800 border-gray-200",
  supplier: "bg-indigo-100 text-indigo-800 border-indigo-200", // ✅ ADD THIS

  // Promotion types
  discount: "bg-green-100 text-green-800 border-green-200",
  bogo: "bg-purple-100 text-purple-800 border-purple-200",
  "free-shipping": "bg-blue-100 text-blue-800 border-blue-200",
  bundle: "bg-amber-100 text-amber-800 border-amber-200",
  clearance: "bg-red-100 text-red-800 border-red-200",

  // Dispute statuses
  open: "bg-yellow-100 text-yellow-800 border-yellow-200",
  investigating: "bg-blue-100 text-blue-800 border-blue-200",
  resolved: "bg-green-100 text-green-800 border-green-200",
  escalated: "bg-red-100 text-red-800 border-red-200",
};

export const statusLabelMap: Partial<Record<StatusType, string>> = {
  // Priority
  high: "High Priority",
  medium: "Medium Priority",
  low: "Low Priority",

  // Promotion
  discount: "Discount",
  bogo: "BOGO",
  "free-shipping": "Free Shipping",
  bundle: "Bundle",
  clearance: "Clearance",

  // Order
  confirmed: "Confirmed",
  closed: "Closed",
  "in-transit": "In Transit",
  "picked-up": "Picked Up",
  "in-progress": "In Progress",
  "pending-payment": "Pending Payment",

  // Dispute - ✅ ADD THESE
  investigating: "Investigating",
  escalated: "Escalated",
};

interface StatusBadgeProps {
  status: StatusType;
  className?: string;
  showLabel?: boolean;
  children?: React.ReactNode;
}

export const StatusBadge = ({
  status,
  className,
  showLabel = true,
  children,
}: StatusBadgeProps) => {
  const getLabel = () => {
    if (!showLabel) return children || status;
    return (
      statusLabelMap[status] ||
      children ||
      status.charAt(0).toUpperCase() + status.slice(1)
    );
  };

  return (
    <Badge variant="outline" className={cn(statusColorMap[status], className)}>
      {getLabel()}
    </Badge>
  );
};
