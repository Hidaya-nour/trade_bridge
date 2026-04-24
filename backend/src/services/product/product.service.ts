import { ProductRepository } from '../../repositories/product.repository';
import { UserRepository } from '../../repositories/user.repository';
import { SupplierPaymentMethodService } from '../supplier-payment-method/supplier-payment-method.service';
import { AppError } from '../../utils/errors';
import { IProductFilters } from '../../types/product.types';
import logger from '../../utils/logger';
import { isCloudinaryConfigured, uploadBufferToCloudinary } from '../../config/cloudinary';
import Address from '../../models/address.model';

export class ProductService {
  private productRepo = new ProductRepository();
  private userRepo = new UserRepository();
  private supplierPaymentMethodService = new SupplierPaymentMethodService();

  private parseBoolean(input: any): boolean | undefined {
    if (input === undefined || input === null) return undefined;
    if (typeof input === 'boolean') return input;
    if (typeof input === 'number') {
      if (input === 1) return true;
      if (input === 0) return false;
      return undefined;
    }
    if (typeof input === 'string') {
      const normalized = input.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') return true;
      if (normalized === 'false' || normalized === '0') return false;
      return undefined;
    }
    return undefined;
  }

  private async resolveSupplierDefaultPickupLocation(userId: string) {
    const address = await Address.findOne({
      where: { user_id: userId } as any,
      order: [['created_at', 'DESC']],
      attributes: ['city', 'subcity', 'common_name'],
    });

    if (address) {
      const city = String((address as any).city || '').trim();
      const subcity = String((address as any).subcity || '').trim();
      const commonName = String((address as any).common_name || '').trim();
      const parts = [commonName, subcity, city]
        .filter(Boolean)
        .filter((value, index, all) => all.findIndex((v) => v.toLowerCase() === value.toLowerCase()) === index);
      if (parts.length) return parts.join(', ');
    }

    return '';
  }

  private async ensurePickupLocation(product: any) {
    const current = String(product?.pickup_location || '').trim();
    if (current) return product;

    const fallback = await this.resolveSupplierDefaultPickupLocation(String(product?.supplier_id || ''));
    if (!fallback) return product;

    try {
      await product.update({ pickup_location: fallback } as any);
    } catch {
      // ignore persistence issues; caller can still compute fallback if needed
      (product as any).pickup_location = fallback;
    }

    return product;
  }

  async getAllProducts(filters: IProductFilters) {
    return this.productRepo.findAllWithFilters(filters);
  }

  async getProductById(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product || product.deleted_at) {
      throw new AppError('Product not found', 404);
    }
    await this.ensurePickupLocation(product);
    return product;
  }

  async getProductsBySupplier(supplierId: string) {
    const supplier = await this.userRepo.findById(supplierId);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    const products = await this.productRepo.findBySupplier(supplierId);
    for (const product of products as any[]) {
      await this.ensurePickupLocation(product);
    }
    return products;
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

    const deliveryAvailable = this.parseBoolean(productData.delivery_available) ?? true;
    const deliveryPricing =
      productData.delivery_pricing === 'paid' ? 'paid' : 'free';
    const deliveryFeePerKm =
      deliveryAvailable && deliveryPricing === 'paid'
        ? Number(productData.delivery_fee_per_km || 0)
        : 0;
    const freeDeliveryMaxDistanceKm =
      deliveryAvailable && productData.free_delivery_max_distance_km !== undefined
        ? Number(productData.free_delivery_max_distance_km)
        : null;

    if (deliveryFeePerKm < 0) {
      throw new AppError('delivery_fee_per_km cannot be negative', 400);
    }
    if (deliveryAvailable && deliveryPricing === 'paid' && deliveryFeePerKm <= 0) {
      throw new AppError('delivery_fee_per_km must be greater than 0 for paid delivery', 400);
    }
    if (
      freeDeliveryMaxDistanceKm !== null &&
      !Number.isNaN(freeDeliveryMaxDistanceKm) &&
      freeDeliveryMaxDistanceKm < 0
    ) {
      throw new AppError('free_delivery_max_distance_km cannot be negative', 400);
    }

    let isAvailable = this.parseBoolean(productData.is_available) ?? true;
    if (isAvailable) {
      const activeMethods =
        await this.supplierPaymentMethodService.getActiveSupplierPaymentMethods(
          userId,
        );
      if (!Array.isArray(activeMethods) || activeMethods.length === 0) {
        // Suppliers without payment methods can still create products, but they cannot make them visible to buyers yet.
        isAvailable = false;
      }
    }

    const product = await this.productRepo.createProduct({
      supplier_id: userId,
      name: productData.name,
      category: productData.category,
      description: productData.description || '',
      pickup_location:
        typeof productData.pickup_location === 'string' && productData.pickup_location.trim().length > 0
          ? productData.pickup_location.trim()
          : await this.resolveSupplierDefaultPickupLocation(userId),
      price: productData.price,
      stock_quantity: productData.stock_quantity || 0,
      min_order_amount: productData.min_order_amount || 1,
      unit_type: productData.unit_type,
      images: productData.images || [],
      is_available: isAvailable,
      delivery_available: deliveryAvailable,
      delivery_pricing: deliveryPricing,
      delivery_fee_per_km: deliveryFeePerKm,
      free_delivery_max_distance_km:
        freeDeliveryMaxDistanceKm === null || Number.isNaN(freeDeliveryMaxDistanceKm)
          ? null
          : freeDeliveryMaxDistanceKm,
    });

    logger.info(`Product created: ${product.id} by user: ${userId}`);
    return product;
  }

  async updateProduct(productId: string, userId: string, updateData: any) {
  const product = await this.productRepo.findById(productId);
  if (!product) throw new AppError('Product not found', 404);

  // Check ownership
  if (product.supplier_id !== userId) {
    const user = await this.userRepo.findById(userId);
    if (user?.role !== 'admin') throw new AppError('You can only update your own products', 403);
  }

  const parsedDeliveryAvailable = this.parseBoolean(updateData.delivery_available);
  if (parsedDeliveryAvailable !== undefined) {
    updateData.delivery_available = parsedDeliveryAvailable;
  }

  const parsedIsAvailable = this.parseBoolean(updateData.is_available);
  if (parsedIsAvailable !== undefined) {
    updateData.is_available = parsedIsAvailable;
  }

  if (updateData.is_available === true) {
    const activeMethods =
      await this.supplierPaymentMethodService.getActiveSupplierPaymentMethods(
        product.supplier_id,
      );
    if (!Array.isArray(activeMethods) || activeMethods.length === 0) {
      throw new AppError(
        'You must set at least one active payment method before activating products.',
        400,
      );
    }
  }

  if (updateData.delivery_fee_per_km !== undefined && Number(updateData.delivery_fee_per_km) < 0) {
    throw new AppError('delivery_fee_per_km cannot be negative', 400);
  }
  if (
    updateData.free_delivery_max_distance_km !== undefined &&
    updateData.free_delivery_max_distance_km !== null &&
    Number(updateData.free_delivery_max_distance_km) < 0
  ) {
    throw new AppError('free_delivery_max_distance_km cannot be negative', 400);
  }

  if (updateData.delivery_available === false) {
    updateData.delivery_pricing = 'free';
    updateData.delivery_fee_per_km = 0;
    updateData.free_delivery_max_distance_km = null;
  }

  if (updateData.delivery_pricing === 'free') {
    updateData.delivery_fee_per_km = 0;
  }
  if (
    updateData.delivery_available !== false &&
    updateData.delivery_pricing === 'paid' &&
    updateData.delivery_fee_per_km !== undefined &&
    Number(updateData.delivery_fee_per_km) <= 0
  ) {
    throw new AppError('delivery_fee_per_km must be greater than 0 for paid delivery', 400);
  }

  delete updateData.id;
  delete updateData.supplier_id;
  delete updateData.created_at;

  if (updateData.pickup_location !== undefined) {
    const nextPickup = String(updateData.pickup_location || '').trim();
    updateData.pickup_location = nextPickup || (await this.resolveSupplierDefaultPickupLocation(product.supplier_id));
  }

  const updated = await this.productRepo.updateProduct(productId, updateData);
  if (!updated) throw new AppError('Failed to update product', 500);

  // ✅ Fetch updated product explicitly
  const updatedProduct = await this.productRepo.findById(productId);
  return updatedProduct;
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

    const willEnable = product.is_available !== true;
    if (willEnable) {
      const activeMethods =
        await this.supplierPaymentMethodService.getActiveSupplierPaymentMethods(
          product.supplier_id,
        );
      if (!Array.isArray(activeMethods) || activeMethods.length === 0) {
        throw new AppError(
          'You must set at least one active payment method before activating products.',
          400,
        );
      }
    }

    const updated = await this.productRepo.toggleAvailability(productId);
    if (!updated) {
      throw new AppError('Failed to toggle availability', 500);
    }

    const newStatus = product.is_available === true ? 'unavailable' : 'available';
    logger.info(`Product ${productId} is now ${newStatus}`);
    return { productId, is_available: product.is_available === true ? false : true };
  }

  async getLowStockProducts(threshold: number = 10) {
    return this.productRepo.findLowStock(threshold);
  }

  async getOutOfStockProducts() {
    return this.productRepo.findOutOfStock();
  }

  async uploadProductImages(userId: string, files: Express.Multer.File[], productId?: string) {
    if (!files || files.length === 0) {
      throw new AppError('At least one image is required', 400);
    }

    if (!isCloudinaryConfigured()) {
      throw new AppError(
        'Cloudinary is not configured. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET.',
        500
      );
    }

    const folder = `trade_bridge/products/${userId}/${productId ?? 'unassigned'}`;
    const uploads = await Promise.all(
      files.map((file) => uploadBufferToCloudinary(file, folder))
    );

    return uploads.map((uploaded) => uploaded.secure_url);
  }
}
