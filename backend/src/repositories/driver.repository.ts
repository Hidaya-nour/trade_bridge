import { BaseRepository } from './base.repository';
import Driver from '../models/driver.model';
import User from '../models/user.model';

export class DriverRepository extends BaseRepository<Driver> {
  constructor() {
    super(Driver);
  }

  async findBySupplier(supplierId: string) {
    return this.findAll({
      where: { supplier_id: supplierId, deleted_at: null },
      order: [['created_at', 'DESC']],
      include: [
        {
          model: User,
          as: 'driverUser',
          attributes: ['id', 'full_name', 'phone', 'email'],
          required: false,
        },
      ],
    });
  }

  async findBySupplierAndDriver(supplierId: string, driverId: string) {
    return this.findOne({ supplier_id: supplierId, driver_id: driverId } as any);
  }
}
