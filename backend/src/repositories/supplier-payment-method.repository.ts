import { BaseRepository } from './base.repository';
import SupplierPaymentMethod from '../models/supplier-payment-method.model';

export class SupplierPaymentMethodRepository extends BaseRepository<SupplierPaymentMethod> {
  constructor() {
    super(SupplierPaymentMethod);
  }

  async findBySupplier(supplierId: string): Promise<SupplierPaymentMethod[]> {
    return this.model.findAll({
      where: { supplier_id: supplierId },
      order: [['is_primary', 'DESC'], ['created_at', 'DESC']]
    });
  }

  async findActiveBySupplier(supplierId: string): Promise<SupplierPaymentMethod[]> {
    return this.model.findAll({
      where: { supplier_id: supplierId, is_active: true },
      order: [['is_primary', 'DESC'], ['created_at', 'DESC']]
    });
  }

  async findPrimaryBySupplier(supplierId: string): Promise<SupplierPaymentMethod | null> {
    return this.model.findOne({
      where: { supplier_id: supplierId, is_primary: true, is_active: true }
    });
  }

  async setPrimary(supplierId: string, methodId: string): Promise<void> {
    // First, set all methods for this supplier to non-primary
    await this.model.update(
      { is_primary: false },
      { where: { supplier_id: supplierId } }
    );

    // Then set the specified method as primary
    await this.model.update(
      { is_primary: true },
      { where: { id: methodId, supplier_id: supplierId } }
    );
  }
}