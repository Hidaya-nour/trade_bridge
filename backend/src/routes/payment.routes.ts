import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import paymentController from '../controllers/payment.controller';

const router = Router();

router.use(authenticate);

router.post('/', paymentController.create);
router.patch('/:id/status', paymentController.updateStatus);

export default router;
