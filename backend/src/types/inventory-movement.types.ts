export interface IInventoryMovement {
  id: string;
  product_id: string;
  movement_type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason?: string;
  user_id: string;
  created_at: Date;
  updated_at: Date;
}