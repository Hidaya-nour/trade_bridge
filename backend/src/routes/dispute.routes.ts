import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import disputeController from '../controllers/dispute.controller';

const router = Router();

router.use(authenticate);

router.get('/', disputeController.listDisputes);
router.get('/:id', disputeController.getDisputeById);
router.put('/:id', disputeController.updateDispute);
router.post('/', disputeController.createDispute);

export default router;
