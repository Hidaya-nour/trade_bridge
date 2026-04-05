import { SupplierPaymentMethodRepository } from '../../repositories/supplier-payment-method.repository';
import { AppError } from '../../utils/errors';
import { ISupplierPaymentMethod, CreateSupplierPaymentMethodDTO, UpdateSupplierPaymentMethodDTO } from '../../types/supplier-payment-method.types';
import logger from '../../utils/logger';

export class SupplierPaymentMethodService {
  private paymentMethodRepo = new SupplierPaymentMethodRepository();

  async createPaymentMethod(data: CreateSupplierPaymentMethodDTO): Promise<ISupplierPaymentMethod> {
    if (!data.supplier_id || !data.method_type || !data.provider_name ||
        !data.account_holder_name || !data.account_identifier) {
      throw new AppError('Missing required fields', 400);
    }

    if (!data.account_display) {
      data.account_display = `${data.provider_name} - ${data.account_identifier}`;
    }

    // If this is set as primary, unset other primary methods for this supplier
    if (data.is_primary) {
      await this.paymentMethodRepo.setPrimary(data.supplier_id, '');
    }

    const paymentMethod = await this.paymentMethodRepo.create(data as any);
    logger.info(`Payment method created for supplier ${data.supplier_id}`);
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
    return updated as [number, ISupplierPaymentMethod[]];
  }

  async deletePaymentMethod(id: string): Promise<number> {
    const method = await this.paymentMethodRepo.findById(id);
    if (!method) {
      throw new AppError('Payment method not found', 404);
    }

    const deleted = await this.paymentMethodRepo.delete(id);
    logger.info(`Payment method ${id} deleted`);
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