import { FindOptions, Op } from 'sequelize';

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

  async refreshTimeBasedStatuses(now: Date = new Date()): Promise<void> {
    // Scheduled broadcasts become active when the start date arrives.
    await this.model.update(
      { status: 'active' } as any,
      {
        where: {
          status: 'scheduled',
          start_date: { [Op.lte]: now },
          end_date: { [Op.gt]: now },
        } as any,
      },
    );

    // Active (or scheduled) broadcasts expire once the end date has passed.
    await this.model.update(
      { status: 'expired' } as any,
      {
        where: {
          status: { [Op.in]: ['active', 'scheduled'] },
          end_date: { [Op.lte]: now },
        } as any,
      },
    );
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

  async findActive(options?: {
    ownerRoles?: BroadcastOwnerRole[];
    excludeOwnerId?: string;
  }): Promise<Broadcast[]> {
    const now = new Date();
    const where: Record<string, unknown> = {
      status: { [Op.in]: ['active', 'scheduled'] },
      start_date: { [Op.lte]: now },
      end_date: { [Op.gte]: now },
    };

    if (options?.ownerRoles && options.ownerRoles.length > 0) {
      where.owner_role = { [Op.in]: options.ownerRoles };
    }

    if (options?.excludeOwnerId) {
      where.owner_id = { [Op.ne]: options.excludeOwnerId };
    }

    return this.findAll({
      where,
      order: [
        ['priority', 'ASC'],
        ['created_at', 'DESC'],
      ],
    });
  }

  async findActiveDiscountByOwnerAndCode(
    ownerId: string,
    code: string,
    now: Date = new Date(),
  ): Promise<Broadcast | null> {
    return this.model.findOne({
      where: {
        owner_id: ownerId,
        type: 'discount',
        code,
        status: { [Op.in]: ['active', 'scheduled'] },
        start_date: { [Op.lte]: now },
        end_date: { [Op.gte]: now },
      } as any,
      order: [
        ['priority', 'ASC'],
        ['created_at', 'DESC'],
      ],
    });
  }
}
