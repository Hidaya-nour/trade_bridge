import { BaseRepository } from './base.repository';
import Address from '../models/address.model';

export class AddressRepository extends BaseRepository<Address> {
  constructor() {
    super(Address);
  }

  async findByUser(userId: string): Promise<Address[]> {
    return this.model.findAll({ where: { user_id: userId }, order: [['created_at','DESC']] });
  }
}
