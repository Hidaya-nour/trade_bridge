import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import disputeController from '../controllers/dispute.controller';

const router = Router();

router.use(authenticate);

router.post('/', disputeController.createDispute);

export default router;
