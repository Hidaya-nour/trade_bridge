import { AuditLogRepository } from '../../repositories/audit-log.repository';
import { AppError } from '../../utils/errors';
import { IAuditLog, CreateAuditLogDTO } from '../../types/audit-log.types';
import logger from '../../utils/logger';

export class AuditLogService {
  private auditLogRepo = new AuditLogRepository();

  async createLog(data: CreateAuditLogDTO): Promise<IAuditLog> {
    if (!data.user_id || !data.action || !data.entity_type || !data.entity_id) {
      throw new AppError('Missing required fields: user_id, action, entity_type, entity_id', 400);
    }

    const log = await this.auditLogRepo.create(data as any);
    logger.info(`Audit log created: ${data.action} on ${data.entity_type} by user ${data.user_id}`);
    return log as IAuditLog;
  }

  async getUserLogs(userId: string, limit: number = 100): Promise<IAuditLog[]> {
    return this.auditLogRepo.findByUser(userId, limit) as Promise<IAuditLog[]>;
  }

  async getEntityLogs(entityType: string, entityId: string): Promise<IAuditLog[]> {
    return this.auditLogRepo.findByEntity(entityType, entityId) as Promise<IAuditLog[]>;
  }

  async getLogsByAction(action: string, limit: number = 50): Promise<IAuditLog[]> {
    return this.auditLogRepo.findByAction(action, limit) as Promise<IAuditLog[]>;
  }

  async getLogsByEntityType(entityType: string, limit: number = 100): Promise<IAuditLog[]> {
    return this.auditLogRepo.findByEntityType(entityType, limit) as Promise<IAuditLog[]>;
  }

  async getLogsInTimeRange(startTime: Date, endTime: Date, limit: number = 500): Promise<IAuditLog[]> {
    return this.auditLogRepo.findLogsInTimeRange(startTime, endTime, limit) as Promise<IAuditLog[]>;
  }

  async logUserAction(
    userId: string,
    action: string,
    entityType: string,
    entityId: string,
    ipAddress?: string
  ): Promise<IAuditLog> {
    return this.createLog({
      user_id: userId,
      action,
      entity_type: entityType,
      entity_id: entityId,
      ip_address: ipAddress
    });
  }
}