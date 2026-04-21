import Broadcast from '../../models/broadcast.model';
import Notification from '../../models/notification.model';
import User from '../../models/user.model';
import { BroadcastRepository } from '../../repositories/broadcast.repository';
import {
  BroadcastOwnerRole,
  BroadcastStatus,
  BroadcastTargetAudience,
  CreateBroadcastDTO,
  IBroadcast,
  UpdateBroadcastDTO,
} from '../../types/broadcast.types';
import { AppError } from '../../utils/errors';
import logger from '../../utils/logger';
import { Op } from 'sequelize';

const VALID_STATUSES: BroadcastStatus[] = [
  'draft',
  'scheduled',
  'active',
  'expired',
  'cancelled',
];

const VALID_TARGET_AUDIENCES: BroadcastTargetAudience[] = [
  'all',
  'segment',
  'specific',
];

export class BroadcastService {
  private broadcastRepo = new BroadcastRepository();
  private static tableReadyPromise: Promise<void> | null = null;

  private async ensureTableReady() {
    if (!BroadcastService.tableReadyPromise) {
      BroadcastService.tableReadyPromise = Broadcast.sync().then(() => undefined);
    }

    try {
      await BroadcastService.tableReadyPromise;
    } catch (error) {
      BroadcastService.tableReadyPromise = null;
      throw error;
    }
  }

  private validateDates(startDate?: Date, endDate?: Date) {
    if (startDate && endDate && new Date(startDate) >= new Date(endDate)) {
      throw new AppError('Start date must be before end date', 400);
    }
  }

  private validateMetrics(data: {
    discount_value?: number | null;
    min_order?: number | null;
    max_discount?: number | null;
    sent_count?: number;
    viewed_count?: number;
    redeemed_count?: number;
  }) {
    const numericFields = [
      ['discount value', data.discount_value],
      ['minimum order', data.min_order],
      ['maximum discount', data.max_discount],
      ['sent count', data.sent_count],
      ['viewed count', data.viewed_count],
      ['redeemed count', data.redeemed_count],
    ] as const;

    numericFields.forEach(([label, value]) => {
      if (value !== undefined && value !== null && Number(value) < 0) {
        throw new AppError(`${label} must be zero or greater`, 400);
      }
    });
  }

  private validatePayload(data: CreateBroadcastDTO | UpdateBroadcastDTO) {
    if ('start_date' in data || 'end_date' in data) {
      this.validateDates(data.start_date, data.end_date);
    }

    if ('title' in data && typeof data.title === 'string' && !data.title.trim()) {
      throw new AppError('Title is required', 400);
    }

    if (
      'description' in data &&
      typeof data.description === 'string' &&
      !data.description.trim()
    ) {
      throw new AppError('Description is required', 400);
    }

    if (data.status && !VALID_STATUSES.includes(data.status)) {
      throw new AppError('Invalid status', 400);
    }

    if (
      data.target_audience &&
      !VALID_TARGET_AUDIENCES.includes(data.target_audience)
    ) {
      throw new AppError('Invalid target audience', 400);
    }

    if (
      data.discount_type === 'percentage' &&
      data.discount_value !== undefined &&
      data.discount_value !== null &&
      Number(data.discount_value) > 100
    ) {
      throw new AppError('Percentage discount cannot exceed 100%', 400);
    }

    if (data.audience_segments && !Array.isArray(data.audience_segments)) {
      throw new AppError('Audience segments must be an array', 400);
    }

    this.validateMetrics(data);
  }

  async createBroadcast(
    ownerId: string,
    ownerRole: BroadcastOwnerRole,
    data: CreateBroadcastDTO,
  ): Promise<IBroadcast> {
    await this.ensureTableReady();
    this.validatePayload(data);

    const broadcast = await this.broadcastRepo.createBroadcast({
      ...data,
      owner_id: ownerId,
      owner_role: ownerRole,
      audience_segments: data.audience_segments || [],
      target_audience: data.target_audience || 'all',
      sent_count: data.sent_count || 0,
      viewed_count: data.viewed_count || 0,
      redeemed_count: data.redeemed_count || 0,
    });

    logger.info(`Broadcast created: ${broadcast.id}`);

    // Lightweight "promotions" notifications for buyers.
    // Buyers (retailers + distributors) see these in the Notifications UI.
    try {
      if (broadcast.status === 'active') {
        const recipients = await User.findAll({
          where: {
            id: { [Op.ne]: ownerId },
            role: { [Op.in]: ['retailer', 'distributor'] },
            status: 'active',
          },
          attributes: ['id'],
        });

        if (recipients.length > 0) {
          await Notification.bulkCreate(
            recipients.map((user) => ({
              user_id: (user as any).id,
              type: 'promotion',
              title: broadcast.title || 'New Promotion',
              message: broadcast.summary || broadcast.description || 'A new promotion is now available.',
              is_read: 0,
            })) as any,
          );
        }
      }
    } catch (error) {
      logger.warn('Failed to create promotion notifications', error);
    }

    return broadcast;
  }

  async getBroadcastsForOwner(
    ownerId: string,
    ownerRole?: BroadcastOwnerRole,
  ): Promise<IBroadcast[]> {
    await this.ensureTableReady();
    await this.broadcastRepo.refreshTimeBasedStatuses();
    return this.broadcastRepo.findByOwner(ownerId, ownerRole);
  }

  async getActiveBroadcasts(options?: {
    ownerRoles?: BroadcastOwnerRole[];
    excludeOwnerId?: string;
  }): Promise<IBroadcast[]> {
    await this.ensureTableReady();
    await this.broadcastRepo.refreshTimeBasedStatuses();
    return this.broadcastRepo.findActive(options);
  }

  async getBroadcastById(
    id: string,
    ownerId: string,
    ownerRole?: BroadcastOwnerRole,
  ): Promise<IBroadcast | null> {
    await this.ensureTableReady();
    return this.broadcastRepo.findOwnedBroadcast(id, ownerId, ownerRole);
  }

  async updateBroadcast(
    id: string,
    ownerId: string,
    ownerRole: BroadcastOwnerRole,
    data: UpdateBroadcastDTO,
  ): Promise<IBroadcast> {
    await this.ensureTableReady();
    const existing = await this.broadcastRepo.findOwnedBroadcast(id, ownerId, ownerRole);

    if (!existing) {
      throw new AppError('Broadcast not found', 404);
    }

    this.validatePayload({
      ...existing.toJSON(),
      ...data,
    } as UpdateBroadcastDTO);

    const [affectedRows] = await this.broadcastRepo.updateBroadcast(id, {
      ...data,
      audience_segments: data.audience_segments || existing.audience_segments,
    });

    if (affectedRows === 0) {
      throw new AppError('Failed to update broadcast', 500);
    }

    const updated = await this.broadcastRepo.findById(id);

    if (!updated) {
      throw new AppError('Broadcast not found after update', 500);
    }

    logger.info(`Broadcast updated: ${id}`);

    return updated;
  }

  async deleteBroadcast(
    id: string,
    ownerId: string,
    ownerRole: BroadcastOwnerRole,
  ): Promise<{ success: boolean; message: string }> {
    await this.ensureTableReady();
    const existing = await this.broadcastRepo.findOwnedBroadcast(id, ownerId, ownerRole);

    if (!existing) {
      throw new AppError('Broadcast not found', 404);
    }

    await this.broadcastRepo.delete(id);

    logger.info(`Broadcast deleted: ${id}`);

    return {
      success: true,
      message: 'Broadcast deleted successfully',
    };
  }
}
