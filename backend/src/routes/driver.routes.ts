import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth.middleware';
import driverController from '../controllers/driver.controller';
import { validate } from '../middleware/validation.middleware';

const router = Router();

// Only authenticated factory / distributor users manage their drivers
router.use(authenticate, authorize('factory', 'distributor'));

router.get('/', driverController.list);
router.get('/available-drivers', driverController.getAvailableDrivers);
router.post(
  '/',
  validate(driverController.constructor['createValidation'] || driverController.createValidation),
  driverController.create,
);
router.patch(
  '/:id',
  validate(driverController.constructor['idValidation'] || driverController.idValidation),
  driverController.update,
);
router.delete(
  '/:id',
  validate(driverController.constructor['idValidation'] || driverController.idValidation),
  driverController.remove,
);

export default router;

