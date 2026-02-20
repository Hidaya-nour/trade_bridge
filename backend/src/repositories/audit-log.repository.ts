import { BaseRepository } from './base.repository';
import AuditLog from '../models/audit-log.model';
import { Op } from 'sequelize';

export class AuditLogRepository extends BaseRepository<AuditLog> {
  constructor() {
    super(AuditLog);
  }

  async findByUser(userId: string, limit: number = 100): Promise<AuditLog[]> {
    return this.model.findAll({
      where: { user_id: userId },
      order: [['created_at', 'DESC']],
      limit
    });
  }

  async findByEntity(entityType: string, entityId: string): Promise<AuditLog[]> {
    return this.model.findAll({
      where: { entity_type: entityType, entity_id: entityId },
      order: [['created_at', 'DESC']]
    });
  }

  async findByAction(action: string, limit: number = 50): Promise<AuditLog[]> {
    return this.model.findAll({
      where: { action },
      order: [['created_at', 'DESC']],
      limit
    });
  }

  async findByEntityType(entityType: string, limit: number = 100): Promise<AuditLog[]> {
    return this.model.findAll({
      where: { entity_type: entityType },
      order: [['created_at', 'DESC']],
      limit
    });
  }

  async findLogsInTimeRange(startTime: Date, endTime: Date, limit: number = 500): Promise<AuditLog[]> {
    return this.model.findAll({
      where: {
        created_at: {
          [Op.between]: [startTime, endTime]
        }
      },
      order: [['created_at', 'DESC']],
      limit
    });
  }
}