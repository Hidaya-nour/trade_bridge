import { FindOptions } from 'sequelize';

import Broadcast from '../models/broadcast.model';
import { BaseRepository } from './base.repository';
import {
  BroadcastOwnerRole,
  CreateBroadcastDTO,
  UpdateBroadcastDTO,
} from '../types/broadcast.types';

export class BroadcastRepository extends BaseRepository<Broadcast> {
  constructor() {
    super(Broadcast);
  }

  async findByOwner(ownerId: string, ownerRole?: BroadcastOwnerRole): Promise<Broadcast[]> {
    const where: Record<string, unknown> = { owner_id: ownerId };

    if (ownerRole) {
      where.owner_role = ownerRole;
    }

    const options: FindOptions = {
      where,
      order: [['created_at', 'DESC']],
    };

    return this.findAll(options);
  }

  async findOwnedBroadcast(
    id: string,
    ownerId: string,
    ownerRole?: BroadcastOwnerRole,
  ): Promise<Broadcast | null> {
    const where: Record<string, unknown> = {
      id,
      owner_id: ownerId,
    };

    if (ownerRole) {
      where.owner_role = ownerRole;
    }

    return this.findOne(where);
  }

  async createBroadcast(data: CreateBroadcastDTO & {
    owner_id: string;
    owner_role: BroadcastOwnerRole;
  }): Promise<Broadcast> {
    return this.create(data as any);
  }

  async updateBroadcast(
    id: string,
    data: UpdateBroadcastDTO,
  ): Promise<[number, Broadcast[]]> {
    return this.update(id, data as any);
  }
}
