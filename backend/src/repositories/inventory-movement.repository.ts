import { BaseRepository } from './base.repository';
import InventoryMovement from '../models/inventory-movement.model';
import { Product } from '../models/product.model';
import { User } from '../models/user.model';

export class InventoryMovementRepository extends BaseRepository<InventoryMovement> {
  constructor() {
    super(InventoryMovement);
  }

  async findById(id: string): Promise<InventoryMovement | null> {
    return this.model.findByPk(id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'stock_quantity']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        }
      ]
    });
  }

  async findByProductId(productId: string): Promise<InventoryMovement[]> {
    return this.model.findAll({
      where: { product_id: productId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      order: [['created_at', 'DESC']]
    });
  }

  async createMovement(data: {
    product_id: string;
    movement_type: 'in' | 'out' | 'adjustment';
    quantity: number;
    reason?: string;
    user_id: string;
  }): Promise<InventoryMovement> {
    return this.model.create(data);
  }
}