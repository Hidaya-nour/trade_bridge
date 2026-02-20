import express from 'express';
import { AuditLogController } from '../controllers/audit-log.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();
const auditLogController = new AuditLogController();

// All routes require authentication
router.use(authenticate);

// Audit log routes
router.post('/', validate(AuditLogController.createValidation), auditLogController.create);
router.get('/user', auditLogController.getUserLogs);
router.get('/entity/:entityType/:entityId', validate(AuditLogController.entityValidation), auditLogController.getEntityLogs);
router.get('/action/:action', validate(AuditLogController.actionValidation), auditLogController.getLogsByAction);
router.get('/entity-type/:entityType', validate(AuditLogController.entityTypeValidation), auditLogController.getLogsByEntityType);

// Admin-only routes
router.get('/time-range', authorize('admin'), auditLogController.getLogsInTimeRange);

export default router;