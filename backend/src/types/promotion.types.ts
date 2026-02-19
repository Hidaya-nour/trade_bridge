import { UserRole } from './auth.types';

export type DiscountType = 'percentage' | 'fixed';
export type TargetRole = UserRole | 'all';

export interface IPromotion {
  id: string;
  name: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  start_date: Date;
  end_date: Date;
  target_role: TargetRole;
  target_region: string; // 'all' or specific region
  is_active: boolean;
  minimum_order_amount?: number;
  created_at: Date;
  updated_at: Date;
}

export interface CreatePromotionDTO {
  name: string;
  description?: string;
  discount_type: DiscountType;
  discount_value: number;
  start_date: Date;
  end_date: Date;
  target_role: TargetRole;
  target_region: string;
  minimum_order_amount?: number;
}

export interface UpdatePromotionDTO extends Partial<CreatePromotionDTO> {
  is_active?: boolean;
}

export interface AppliedPromotion {
  promotion: IPromotion;
  discount_amount: number;
}