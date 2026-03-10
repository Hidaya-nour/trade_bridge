import { DriverRepository } from '../../repositories/driver.repository';
import { UserRepository } from '../../repositories/user.repository';
import { AppError } from '../../utils/errors';
import { CreateDriverDTO, UpdateDriverDTO } from '../../types/driver.types';

export class DriverService {
  private DriverRepo = new DriverRepository();
  private userRepo = new UserRepository();

  async addDriverToSupplier(supplierId: string, data: Omit<CreateDriverDTO, 'supplier_id'>) {
    const supplier = await this.userRepo.findById(supplierId);
    if (!supplier || !['factory', 'distributor'].includes(supplier.role)) {
      throw new AppError('Only factory or distributor accounts can own drivers', 403);
    }

    const driver = await this.userRepo.findById(data.driver_id);
    if (!driver || driver.role !== 'driver') {
      throw new AppError('Driver user not found or not a driver', 400);
    }

    const existing = await this.DriverRepo.findBySupplierAndDriver(supplierId, data.driver_id);
    if (existing) {
      throw new AppError('Driver is already linked to this supplier', 400);
    }

    const created = await this.DriverRepo.create({
      supplier_id: supplierId,
      driver_id: data.driver_id,
      vehicle_type: data.vehicle_type,
      license_plate: data.license_plate,
      active: true,
    } as any);

    return created;
  }

  async listDrivers(supplierId: string) {
    const supplier = await this.userRepo.findById(supplierId);
    if (!supplier || !['factory', 'distributor'].includes(supplier.role)) {
      throw new AppError('Only factory or distributor accounts can own drivers', 403);
    }

    return this.DriverRepo.findBySupplier(supplierId);
  }

  /** List users with role=driver for the supplier to choose and link. */
  async getAvailableDrivers(supplierId: string, search?: string) {
    const supplier = await this.userRepo.findById(supplierId);
    if (!supplier || !['factory', 'distributor'].includes(supplier.role)) {
      throw new AppError('Only factory or distributor accounts can list drivers', 403);
    }
    return this.userRepo.findDrivers(search);
  }

  async updateDriver(id: string, supplierId: string, data: UpdateDriverDTO) {
    const record = await this.DriverRepo.findById(id);
    if (!record || record.supplier_id !== supplierId) {
      throw new AppError('Driver not found for this supplier', 404);
    }

    await this.DriverRepo.update(id, data as any);
    return this.DriverRepo.findById(id);
  }

  async Driver(id: string, supplierId: string) {
    const record = await this.DriverRepo.findById(id);
    if (!record || record.supplier_id !== supplierId) {
      throw new AppError('Driver not found for this supplier', 404);
    }

    await this.DriverRepo.softDelete(id);
  }
}

export default new DriverService();

