import { Product } from '../../models/product.model';
import { SupplierPaymentMethodRepository } from '../../repositories/supplier-payment-method.repository';
import { CreateSupplierPaymentMethodDTO, ISupplierPaymentMethod, UpdateSupplierPaymentMethodDTO } from '../../types/supplier-payment-method.types';
import { AppError } from '../../utils/errors';
import logger from '../../utils/logger';

export class SupplierPaymentMethodService {
  private paymentMethodRepo = new SupplierPaymentMethodRepository();

  private async ensureSupplierProductsInactiveIfNoActiveMethods(supplierId: string) {
    const activeMethods = await this.paymentMethodRepo.findActiveBySupplier(supplierId);
    if (Array.isArray(activeMethods) && activeMethods.length > 0) return;

    await Product.update(
      { is_available: false, updated_at: new Date() } as any,
      { where: { supplier_id: supplierId, is_available: true } as any },
    );
  }

  async createPaymentMethod(data: CreateSupplierPaymentMethodDTO): Promise<ISupplierPaymentMethod> {
   // In SupplierPaymentMethodService.createPaymentMethod
if (!data.supplier_id) throw new AppError('Supplier ID is missing', 400);
if (!data.method_type) throw new AppError('Method type is required', 400);
if (!data.provider_name) throw new AppError('Provider name is required', 400);
if (!data.account_holder_name) throw new AppError('Account holder name is required', 400);
if (data.method_type !== 'credit' && !data.account_identifier) {
  throw new AppError('Account identifier is required for non-credit methods', 400);
}

    if (data.method_type === 'credit') {
      const dueDays = Number(data.credit_due_days || 0);
      const limit = Number(data.credit_limit || 0);
      if (!Number.isFinite(dueDays) || dueDays <= 0) {
        throw new AppError('Credit due days must be greater than 0', 400);
      }
      if (!Number.isFinite(limit) || limit <= 0) {
        throw new AppError('Credit limit must be greater than 0', 400);
      }
      data.account_identifier = data.account_identifier || 'credit';
    }

    if (!data.account_display) {
      data.account_display =
        data.method_type === 'credit'
          ? `${Number(data.credit_due_days)} days, max ETB ${Number(data.credit_limit).toLocaleString()}`
          : `${data.provider_name} - ${data.account_identifier}`;
    }

    // If this is set as primary, unset other primary methods for this supplier
    if (data.is_primary) {
      await this.paymentMethodRepo.setPrimary(data.supplier_id, '');
    }

    const paymentMethod = await this.paymentMethodRepo.create(data as any);
    logger.info(`Payment method created for supplier ${data.supplier_id}`);
    await this.ensureSupplierProductsInactiveIfNoActiveMethods(data.supplier_id);
    return paymentMethod as ISupplierPaymentMethod;
  }

  async getSupplierPaymentMethods(supplierId: string): Promise<ISupplierPaymentMethod[]> {
    return this.paymentMethodRepo.findBySupplier(supplierId) as Promise<ISupplierPaymentMethod[]>;
  }

  async getActiveSupplierPaymentMethods(supplierId: string): Promise<ISupplierPaymentMethod[]> {
    return this.paymentMethodRepo.findActiveBySupplier(supplierId) as Promise<ISupplierPaymentMethod[]>;
  }

  async getPrimaryPaymentMethod(supplierId: string): Promise<ISupplierPaymentMethod | null> {
    return this.paymentMethodRepo.findPrimaryBySupplier(supplierId) as Promise<ISupplierPaymentMethod | null>;
  }

  async updatePaymentMethod(id: string, data: UpdateSupplierPaymentMethodDTO): Promise<[number, ISupplierPaymentMethod[]]> {
    // If setting as primary, unset other primary methods
    if (data.is_primary) {
      const method = await this.paymentMethodRepo.findById(id);
      if (method) {
        await this.paymentMethodRepo.setPrimary(method.supplier_id, id);
      }
    }

    const updated = await this.paymentMethodRepo.update(id, data as any);
    logger.info(`Payment method ${id} updated`);

    const method = await this.paymentMethodRepo.findById(id);
    if (method?.supplier_id) {
      await this.ensureSupplierProductsInactiveIfNoActiveMethods(method.supplier_id);
    }

    return updated as [number, ISupplierPaymentMethod[]];
  }

  async deletePaymentMethod(id: string): Promise<number> {
    const method = await this.paymentMethodRepo.findById(id);
    if (!method) {
      throw new AppError('Payment method not found', 404);
    }

    const deleted = await this.paymentMethodRepo.delete(id);
    logger.info(`Payment method ${id} deleted`);
    await this.ensureSupplierProductsInactiveIfNoActiveMethods(method.supplier_id);
    return deleted;
  }

  async setPrimaryPaymentMethod(supplierId: string, methodId: string): Promise<void> {
    const method = await this.paymentMethodRepo.findById(methodId);
    if (!method || method.supplier_id !== supplierId) {
      throw new AppError('Payment method not found or does not belong to supplier', 404);
    }

    await this.paymentMethodRepo.setPrimary(supplierId, methodId);
    logger.info(`Primary payment method set for supplier ${supplierId}`);
  }
}
