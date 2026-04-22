export type ReportStatus = "open" | "reviewed" | "dismissed";

export interface UserReport {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  order_id?: string | null;
  reason: string;
  description?: string | null;
  status: ReportStatus;
  created_at: string;
  updated_at: string;
  deleted_at?: string | null;
}

export interface CreateReportPayload {
  reported_user_id: string;
  reason: string;
  description?: string;
  order_id?: string;
}

