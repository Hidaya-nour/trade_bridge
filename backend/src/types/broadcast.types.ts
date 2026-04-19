import { UserRole } from './auth.types';

export type BroadcastOwnerRole = Extract<UserRole, 'factory' | 'distributor'> | 'admin';
export type BroadcastType =
  | 'discount'
  | 'bogo'
  | 'free-shipping'
  | 'bundle'
  | 'clearance';
export type BroadcastDiscountType = 'percentage' | 'fixed';
export type BroadcastStatus =
  | 'draft'
  | 'scheduled'
  | 'active'
  | 'expired'
  | 'cancelled';
export type BroadcastPriority = 'high' | 'medium' | 'low';
export type BroadcastTargetAudience = 'all' | 'segment' | 'specific';

export interface IBroadcast {
  id: string;
  owner_id: string;
  owner_role: BroadcastOwnerRole;
  title: string;
  description: string;
  summary?: string | null;
  type: BroadcastType;
  discount_type?: BroadcastDiscountType | null;
  discount_value?: number | null;
  min_order?: number | null;
  max_discount?: number | null;
  start_date: Date;
  end_date: Date;
  status: BroadcastStatus;
  created_by: string;
  sent_count: number;
  viewed_count: number;
  redeemed_count: number;
  code?: string | null;
  priority: BroadcastPriority;
  target_audience: BroadcastTargetAudience;
  audience_segments: string[];
  created_at: Date;
  updated_at: Date;
}

export interface CreateBroadcastDTO {
  title: string;
  description: string;
  summary?: string | null;
  type: BroadcastType;
  discount_type?: BroadcastDiscountType | null;
  discount_value?: number | null;
  min_order?: number | null;
  max_discount?: number | null;
  start_date: Date;
  end_date: Date;
  status: BroadcastStatus;
  created_by: string;
  sent_count?: number;
  viewed_count?: number;
  redeemed_count?: number;
  code?: string | null;
  priority: BroadcastPriority;
  target_audience?: BroadcastTargetAudience;
  audience_segments?: string[];
}

export interface UpdateBroadcastDTO extends Partial<CreateBroadcastDTO> {}
