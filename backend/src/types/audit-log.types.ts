export interface IAuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  ip_address?: string;
  created_at: Date;
}

export interface CreateAuditLogDTO {
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  ip_address?: string;
}