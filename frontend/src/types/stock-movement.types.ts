export type StockMovementType = "in" | "out" | "adjustment";

export type StockMovementUser = {
  id: string;
  full_name?: string;
  email?: string;
};

export interface StockMovement {
  id: string;
  product_id: string;
  movement_type: StockMovementType;
  quantity: number;
  reason?: string | null;
  user_id: string;
  created_at: string;
  updated_at: string;
  user?: StockMovementUser;
}

