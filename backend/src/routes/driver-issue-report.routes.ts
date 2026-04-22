import { Router } from 'express';
import driverIssueReportController from '../controllers/driver-issue-report.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);
router.use(authorize('driver'));

router.get('/mine', driverIssueReportController.listMine);
router.post('/', driverIssueReportController.create);

export default router;
