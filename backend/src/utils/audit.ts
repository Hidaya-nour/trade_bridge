import { AuditLogService } from '../services/audit-log/audit-log.service';
import logger from './logger';

const auditLogService = new AuditLogService();

export const recordAuditLog = async (data: {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  ipAddress?: string | null;
}) => {
  if (!data.userId || !data.entityId) return;

  try {
    await auditLogService.logUserAction(
      data.userId,
      data.action,
      data.entityType,
      data.entityId,
      data.ipAddress || undefined,
    );
  } catch (err) {
    logger.error('Failed to record audit log', err);
  }
};
