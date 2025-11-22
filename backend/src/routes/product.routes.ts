import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authorizeRoles } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authorizeRoles("distributor", "factory"), ProductController.create);
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);
router.put('/:id', ProductController.update);
router.delete('/:id', ProductController.delete);

export default router;
