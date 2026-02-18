import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import deliveryController from '../controllers/delivery.controller';

const router = Router();

router.use(authenticate);

router.post('/', deliveryController.create);
router.patch('/:id/status', deliveryController.updateStatus);
router.patch('/:id/assign-driver', deliveryController.assignDriver);

export default router;
