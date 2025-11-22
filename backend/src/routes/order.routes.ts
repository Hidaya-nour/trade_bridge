import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authorizeRoles("distributor", "factory"), OrderController.create);
router.get('/', OrderController.getAll);
router.get('/:id', OrderController.getById);
router.put('/:id', OrderController.update);
router.delete('/:id', OrderController.delete);

export default router;
