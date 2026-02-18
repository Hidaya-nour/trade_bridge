export interface IDispute {
  id: string;
  order_id: string;
  raised_by: string;
  against_user: string;
  description: string;
  status: string;
  resolved_by?: string;
  resolved_at?: Date;
  created_at: Date;
}

export interface CreateDisputeDTO {
  order_id: string;
  raised_by: string;
  against_user: string;
  description: string;
}
