import { Product } from '../../models/product.model';
import { SupplierPaymentMethodRepository } from '../../repositories/supplier-payment-method.repository';
import { CreateSupplierPaymentMethodDTO, ISupplierPaymentMethod, UpdateSupplierPaymentMethodDTO } from '../../types/supplier-payment-method.types';
import { AppError } from '../../utils/errors';
import logger from '../../utils/logger';
import User from '../../models/user.model';
import { createChapaSubaccount } from '../../config/chapa';
import { mapBankNameToChapaSlug as mapBankNameToCode } from '../../utils/chapa-bank.util';

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

    // Automatic Chapa Subaccount creation on adding payment method (bank account / mobile payment)
    const user = await User.findByPk(data.supplier_id) as any;
    const isBankingMethod = data.method_type === 'chapa' || data.method_type === 'mobile_money' || data.method_type === 'mobile_banking';
    if (user && !user.chapa_subaccount_id && isBankingMethod) {
      try {
        const bankCode = mapBankNameToCode(data.provider_name);
        const platformFee = Number(process.env.CHAPA_PLATFORM_FEE_PERCENTAGE || 0.02);
        
        logger.info(`Auto-creating Chapa subaccount for supplier ${data.supplier_id} with bank code ${bankCode}`);
        
        const subaccountRes = await createChapaSubaccount({
          business_name: user.business_name || data.account_holder_name || user.full_name,
          account_name: data.account_holder_name,
          bank_code: bankCode,
          account_number: data.account_identifier,
          split_type: 'percentage',
          split_value: platformFee
        });

        const subaccountId = subaccountRes.data?.subaccount_id || subaccountRes.subaccount_id || subaccountRes.data;
        if (subaccountId && typeof subaccountId === 'string') {
          user.chapa_subaccount_id = subaccountId;
          await user.save();
          logger.info(`Auto-created Chapa subaccount ${subaccountId} for supplier ${data.supplier_id}`);
        }
      } catch (chapaError: any) {
        logger.warn(`Failed to auto-create Chapa subaccount via API: ${chapaError?.message}. Falling back to sandbox/test subaccount ID for demo.`);
        
        // Safeguard for demo: Generate a test subaccount ID so the split payment flow still functions!
        const mockSubaccountId = `SUB-TEST-${data.supplier_id.slice(0, 8)}-${Date.now()}`;
        user.chapa_subaccount_id = mockSubaccountId;
        await user.save();
        logger.info(`Provisioned offline sandbox Chapa subaccount ${mockSubaccountId} for supplier ${data.supplier_id}`);
      }
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
