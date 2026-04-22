export interface BroadcastRecord {
  id: string;
  owner_id: string;
  owner_role: "factory" | "distributor" | "admin";
  title: string;
  description: string;
  summary?: string | null;
  type: "discount" | "bogo" | "free-shipping" | "bundle" | "clearance";
  discount_type?: "percentage" | "fixed" | null;
  discount_value?: number | null;
  min_order?: number | null;
  max_discount?: number | null;
  start_date: string;
  end_date: string;
  status: "draft" | "scheduled" | "active" | "expired" | "cancelled";
  created_by: string;
  sent_count: number;
  viewed_count: number;
  redeemed_count: number;
  code?: string | null;
  priority: "high" | "medium" | "low";
  target_audience: "all" | "segment" | "specific";
  audience_segments: string[];
  created_at: string;
  updated_at: string;
}
