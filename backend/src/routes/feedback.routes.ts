import { Router } from 'express';
import { authorizeRoles } from '../middleware/auth.middleware';
// import { FeedbackController } from '../controllers/feedback.controller';

const router = Router();

// router.post('/', FeedbackController.create);
// router.get('/', FeedbackController.getAll);
// router.get('/:id', FeedbackController.getById);
// router.put('/:id', FeedbackController.update);
// router.delete('/:id', FeedbackController.delete);

export default router;
