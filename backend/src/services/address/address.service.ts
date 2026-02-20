import { AddressRepository } from '../../repositories/address.repository';
import { AppError } from '../../utils/errors';
import { IAddress } from '../../types/address.types';
import logger from '../../utils/logger';

export class AddressService {
  private addrRepo = new AddressRepository();

  async createAddress(data: Partial<IAddress>): Promise<IAddress> {
    if (!data.user_id || !data.region || !data.city) {
      throw new AppError('Missing required fields', 400);
    }

    const addr = await this.addrRepo.create(data as any);
    logger.info(`Address created for user ${data.user_id}`);
    return addr as IAddress;
  }

  async getUserAddresses(userId: string): Promise<IAddress[]> {
    return this.addrRepo.findByUser(userId) as Promise<IAddress[]>;
  }

  async updateAddress(id: string, data: Partial<IAddress>) {
    const updated = await this.addrRepo.update(id, data as any);
    return updated;
  }

  async deleteAddress(id: string) {
    return this.addrRepo.delete(id);
  }
}
