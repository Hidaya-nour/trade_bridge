import type { BroadcastItem } from "@/components";

export type BroadcastApiType =
  | "discount"
  | "bogo"
  | "free-shipping"
  | "bundle"
  | "clearance";
export type BroadcastApiDiscountType = "percentage" | "fixed";
export type BroadcastApiStatus =
  | "draft"
  | "scheduled"
  | "active"
  | "expired"
  | "cancelled";
export type BroadcastApiPriority = "high" | "medium" | "low";
export type BroadcastApiTargetAudience = "all" | "segment" | "specific";

export interface BroadcastRecord {
  id: string;
  owner_id: string;
  owner_role: "factory" | "distributor" | "admin";
  title: string;
  description: string;
  summary?: string | null;
  type: BroadcastApiType;
  discount_type?: BroadcastApiDiscountType | null;
  discount_value?: number | null;
  min_order?: number | null;
  max_discount?: number | null;
  start_date: string;
  end_date: string;
  status: BroadcastApiStatus;
  created_by: string;
  sent_count: number;
  viewed_count: number;
  redeemed_count: number;
  code?: string | null;
  priority: BroadcastApiPriority;
  target_audience: BroadcastApiTargetAudience;
  audience_segments: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateBroadcastPayload {
  title: string;
  description: string;
  summary?: string | null;
  type: BroadcastApiType;
  discount_type?: BroadcastApiDiscountType | null;
  discount_value?: number | null;
  min_order?: number | null;
  max_discount?: number | null;
  start_date: string;
  end_date: string;
  status: BroadcastApiStatus;
  created_by: string;
  sent_count?: number;
  viewed_count?: number;
  redeemed_count?: number;
  code?: string | null;
  priority: BroadcastApiPriority;
  target_audience?: BroadcastApiTargetAudience;
  audience_segments?: string[];
}

export interface UpdateBroadcastPayload extends Partial<CreateBroadcastPayload> {}

export interface BroadcastListResponse {
  success: boolean;
  data: BroadcastRecord[];
}

export interface BroadcastResponse {
  success: boolean;
  data: BroadcastRecord;
  message?: string;
}

export const mapBroadcastRecordToItem = (
  record: BroadcastRecord,
): BroadcastItem => ({
  id: record.id,
  title: record.title,
  description: record.description,
  summary: record.summary || undefined,
  type: record.type,
  discountType: record.discount_type || undefined,
  discountValue:
    record.discount_value !== null && record.discount_value !== undefined
      ? Number(record.discount_value)
      : undefined,
  minOrder:
    record.min_order !== null && record.min_order !== undefined
      ? Number(record.min_order)
      : undefined,
  maxDiscount:
    record.max_discount !== null && record.max_discount !== undefined
      ? Number(record.max_discount)
      : undefined,
  startDate: record.start_date,
  endDate: record.end_date,
  status: record.status,
  createdAt: record.created_at,
  createdBy: record.created_by,
  sentCount: Number(record.sent_count || 0),
  viewedCount: Number(record.viewed_count || 0),
  redeemedCount: Number(record.redeemed_count || 0),
  code: record.code || undefined,
  priority: record.priority,
  targetAudience: record.target_audience,
  audienceSegments: record.audience_segments || [],
  isPersisted: true,
});
