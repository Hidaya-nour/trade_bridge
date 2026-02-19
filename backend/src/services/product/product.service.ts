import { ProductRepository } from '../../repositories/product.repository';
import { UserRepository } from '../../repositories/user.repository';
import { AppError } from '../../utils/errors';
import { IProductFilters } from '../../types/product.types';
import logger from '../../utils/logger';

export class ProductService {
  private productRepo = new ProductRepository();
  private userRepo = new UserRepository();

  async getAllProducts(filters: IProductFilters) {
    return this.productRepo.findAllWithFilters(filters);
  }

  async getProductById(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product || product.deleted_at) {
      throw new AppError('Product not found', 404);
    }
    return product;
  }

  async getProductsBySupplier(supplierId: string) {
    const supplier = await this.userRepo.findById(supplierId);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    return this.productRepo.findBySupplier(supplierId);
  }

  async createProduct(userId: string, productData: any) {
    // Check if user is authorized to create products
    const user = await this.userRepo.findById(userId);
    if (!user || !['distributor', 'factory', 'admin'].includes(user.role)) {
      throw new AppError('Only distributors, factories, and admins can create products', 403);
    }

    // Validate required fields
    if (!productData.name || !productData.category || !productData.price || !productData.unit_type) {
      throw new AppError('Missing required fields: name, category, price, unit_type', 400);
    }

    const product = await this.productRepo.createProduct({
      supplier_id: userId,
      name: productData.name,
      category: productData.category,
      description: productData.description || '',
      price: productData.price,
      stock_quantity: productData.stock_quantity || 0,
      min_order_amount: productData.min_order_amount || 1,
      unit_type: productData.unit_type,
      images: productData.images || [],
      is_available: productData.is_available !== undefined ? productData.is_available : 1,
    });

    logger.info(`Product created: ${product.id} by user: ${userId}`);
    return product;
  }

  async updateProduct(productId: string, userId: string, updateData: any) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check ownership
    if (product.supplier_id !== userId) {
      // Check if user is admin (optional)
      const user = await this.userRepo.findById(userId);
      if (user?.role !== 'admin') {
        throw new AppError('You can only update your own products', 403);
      }
    }

    // Remove fields that shouldn't be updated
    delete updateData.id;
    delete updateData.supplier_id;
    delete updateData.created_at;

    const [updated, updatedProducts] = await this.productRepo.updateProduct(productId, updateData);
    if (!updated) {
      throw new AppError('Failed to update product', 500);
    }

    logger.info(`Product updated: ${productId} by user: ${userId}`);
    return updatedProducts[0];
  }

  async deleteProduct(productId: string, userId: string, permanent: boolean = false) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    // Check ownership
    if (product.supplier_id !== userId) {
      const user = await this.userRepo.findById(userId);
      if (user?.role !== 'admin') {
        throw new AppError('You can only delete your own products', 403);
      }
    }

    if (permanent) {
      // Permanent delete
      await this.productRepo.delete(productId);
      logger.info(`Product permanently deleted: ${productId} by user: ${userId}`);
    } else {
      // Soft delete
      await this.productRepo.softDelete(productId);
      logger.info(`Product soft deleted: ${productId} by user: ${userId}`);
    }
  }

  async getCategories() {
    return this.productRepo.getCategories();
  }

  async updateStock(productId: string, userId: string, quantity: number) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.supplier_id !== userId) {
      const user = await this.userRepo.findById(userId);
      if (user?.role !== 'admin') {
        throw new AppError('You can only update stock for your own products', 403);
      }
    }

    if (quantity < 0) {
      throw new AppError('Stock quantity cannot be negative', 400);
    }

    const updated = await this.productRepo.updateStock(productId, quantity);
    if (!updated) {
      throw new AppError('Failed to update stock', 500);
    }

    logger.info(`Stock updated for product: ${productId} to ${quantity}`);
    return { productId, stock_quantity: quantity };
  }

  async updateProductStock(productId: string, newStock: number): Promise<boolean> {
    if (newStock < 0) {
      throw new AppError('Stock quantity cannot be negative', 400);
    }
    return this.productRepo.updateStock(productId, newStock);
  }

  async reserveStock(productId: string, quantity: number) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.stock_quantity < quantity) {
      throw new AppError('Insufficient stock', 400);
    }

    if (!product.is_available) {
      throw new AppError('Product is not available', 400);
    }

    const updated = await this.productRepo.decrementStock(productId, quantity);
    if (!updated) {
      throw new AppError('Failed to reserve stock', 500);
    }

    logger.info(`Stock reserved: ${quantity} units for product: ${productId}`);
    return true;
  }

  async releaseStock(productId: string, quantity: number) {
    const updated = await this.productRepo.incrementStock(productId, quantity);
    if (!updated) {
      throw new AppError('Failed to release stock', 500);
    }

    logger.info(`Stock released: ${quantity} units for product: ${productId}`);
    return true;
  }

  async toggleAvailability(productId: string, userId: string) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new AppError('Product not found', 404);
    }

    if (product.supplier_id !== userId) {
      const user = await this.userRepo.findById(userId);
      if (user?.role !== 'admin') {
        throw new AppError('You can only toggle availability for your own products', 403);
      }
    }

    const updated = await this.productRepo.toggleAvailability(productId);
    if (!updated) {
      throw new AppError('Failed to toggle availability', 500);
    }

    const newStatus = product.is_available === 1 ? 'unavailable' : 'available';
    logger.info(`Product ${productId} is now ${newStatus}`);
    return { productId, is_available: product.is_available === 1 ? 0 : 1 };
  }

  async getLowStockProducts(threshold: number = 10) {
    return this.productRepo.findLowStock(threshold);
  }

  async getOutOfStockProducts() {
    return this.productRepo.findOutOfStock();
  }
}