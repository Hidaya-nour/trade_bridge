import express from 'express';

import { BroadcastController } from '../controllers/broadcast.controller';
import {
  authenticate,
  authorize,
  requireVerifiedSupplier,
} from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();
const broadcastController = new BroadcastController();

router.use(authenticate);
router.get('/active', broadcastController.getActiveBroadcasts);
router.use(requireVerifiedSupplier);
router.use(authorize('factory', 'distributor', 'admin'));

router.get('/', broadcastController.getMyBroadcasts);
router.get(
  '/:id',
  validate(BroadcastController.broadcastIdValidation),
  broadcastController.getBroadcastById,
);
router.post(
  '/',
  validate(BroadcastController.createBroadcastValidation),
  broadcastController.createBroadcast,
);
router.put(
  '/:id',
  validate(BroadcastController.updateBroadcastValidation),
  broadcastController.updateBroadcast,
);
router.patch(
  '/:id/status',
  validate(BroadcastController.updateBroadcastStatusValidation),
  broadcastController.updateBroadcast,
);
router.delete(
  '/:id',
  validate(BroadcastController.broadcastIdValidation),
  broadcastController.deleteBroadcast,
);

export default router;
