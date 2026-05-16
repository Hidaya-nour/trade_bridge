import { InventoryMovementRepository } from '../../repositories/inventory-movement.repository';
import { ProductService } from '../product/product.service';
import { AppError } from '../../utils/errors';
import { IInventoryMovement } from '../../types/inventory-movement.types';
import { Product } from '../../models/product.model';
import { User } from '../../models/user.model';
import logger from '../../utils/logger';

export class InventoryMovementService {
  private inventoryRepo = new InventoryMovementRepository();
  private productService = new ProductService();

  async createMovement(data: {
    product_id: string;
    movement_type: 'in' | 'out' | 'adjustment';
    quantity: number;
    reason?: string;
    user_id: string;
  }): Promise<IInventoryMovement> {
    // Validate quantity
    // - 'in'/'out' must be positive
    // - 'adjustment' can be negative/positive but not 0
    if (data.movement_type === 'adjustment') {
      if (data.quantity === 0) {
        throw new AppError('Quantity must not be 0 for adjustment movements', 400);
      }
    } else if (data.quantity <= 0) {
      throw new AppError('Quantity must be greater than 0', 400);
    }

    // Validate movement type
    if (!['in', 'out', 'adjustment'].includes(data.movement_type)) {
      throw new AppError('Invalid movement type', 400);
    }

    // Check if product exists
    const product = await this.productService.getProductById(data.product_id);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // For 'out' movements, check if sufficient stock
    if (data.movement_type === 'out' && product.stock_quantity < data.quantity) {
      throw new AppError('Insufficient stock for this movement', 400);
    }

    // Create the movement log
    const movement = await this.inventoryRepo.createMovement(data);

    // Update product stock quantity
    let newStock = product.stock_quantity;
    if (data.movement_type === 'in') {
      newStock += data.quantity;
    } else if (data.movement_type === 'out') {
      newStock -= data.quantity;
    } else if (data.movement_type === 'adjustment') {
      newStock += data.quantity; // quantity can be negative
    }

    const success = await this.productService.updateProductStock(data.product_id, newStock);
    if (!success) {
      throw new AppError('Failed to update product stock', 500);
    }

    logger.info(`Inventory movement created: ${data.movement_type} ${data.quantity} for product ${data.product_id}`);

    return movement;
  }

  async getMovementsByProduct(productId: string): Promise<IInventoryMovement[]> {
    return this.inventoryRepo.findByProductId(productId);
  }

  async getMovementById(id: string): Promise<IInventoryMovement | null> {
    return this.inventoryRepo.findById(id);
  }

  async getAllMovements(filters?: {
    product_id?: string;
    movement_type?: 'in' | 'out' | 'adjustment';
    user_id?: string;
    page?: number;
    limit?: number;
  }): Promise<{ movements: IInventoryMovement[]; total: number }> {
    const where: any = {};
    const limit = filters?.limit || 20;
    const offset = ((filters?.page || 1) - 1) * limit;

    if (filters?.product_id) {
      where.product_id = filters.product_id;
    }
    if (filters?.movement_type) {
      where.movement_type = filters.movement_type;
    }
    if (filters?.user_id) {
      where.user_id = filters.user_id;
    }

    const movements = await this.inventoryRepo.findAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name']
        },
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name', 'email']
        }
      ],
      limit,
      offset,
      order: [['created_at', 'DESC']]
    });

    const total = await this.inventoryRepo.count(where);

    return { movements, total };
  }
}
