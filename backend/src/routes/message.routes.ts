import { Router } from 'express';
import { authorizeRoles } from '../middleware/auth.middleware';
// import { MessageController } from '../controllers/message.controller';

const router = Router();

// router.post('/', MessageController.create);
// router.get('/', MessageController.getAll);
// router.get('/:id', MessageController.getById);
// router.put('/:id', MessageController.update);
// router.delete('/:id', MessageController.delete);

export default router;
