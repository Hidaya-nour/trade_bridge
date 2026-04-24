import { Router } from 'express';
import { authenticate, authorize, requireVerifiedSupplier } from '../middleware/auth.middleware';
import deliveryController from '../controllers/delivery.controller';

const router = Router();

router.use(authenticate);

router.get('/available-drivers', deliveryController.getAvailableDriversForBuyer);
router.get('/', authorize('distributor', 'factory', 'driver'), deliveryController.list);
router.get('/my-deliveries', authorize('driver'), deliveryController.getMyDeliveries);
router.get('/:id', authorize('distributor', 'factory', 'driver'), deliveryController.getById);
router.get(
  '/supplier-deliveries',
  authorize('distributor', 'factory'),
  requireVerifiedSupplier,
  deliveryController.getSupplierDeliveries,
);
router.post('/', deliveryController.create);
router.patch('/:id/status', deliveryController.updateStatus);
router.patch('/:id/assign-driver', authorize('distributor', 'factory'), requireVerifiedSupplier, deliveryController.assignDriver);
router.post('/order/:orderId/assign-driver', deliveryController.assignDriverForBuyer);

export default router;
