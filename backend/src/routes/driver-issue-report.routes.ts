import { Router } from 'express';
import driverIssueReportController from '../controllers/driver-issue-report.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/mine', authorize('driver'), driverIssueReportController.listMine);
router.post('/', authorize('driver'), driverIssueReportController.create);
router.get('/order/:orderId', driverIssueReportController.listByOrder);

export default router;
