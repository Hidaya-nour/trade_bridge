import { Router } from 'express';
import { authenticate, authorize, requireVerifiedSupplier } from '../middleware/auth.middleware';
import driverController from '../controllers/driver.controller';
import { validate } from '../middleware/validation.middleware';

const router = Router();

router.use(authenticate);
const controllerAny = driverController as any;
const ctorAny = controllerAny.constructor as any;

// Driver self-service (vehicle info)
router.get('/me', authorize('driver'), driverController.me);
router.patch(
  '/me/:id',
  authorize('driver'),
  validate(ctorAny.updateMeValidation || controllerAny.updateMeValidation),
  driverController.updateMe,
);

// Only authenticated factory / distributor users manage their drivers
router.use(requireVerifiedSupplier, authorize('factory', 'distributor'));

router.get('/', driverController.list);
router.get('/available-drivers', driverController.getAvailableDrivers);
router.post(
  '/',
  validate(ctorAny.createValidation || controllerAny.createValidation),
  driverController.create,
);
router.patch(
  '/:id',
  validate(ctorAny.idValidation || controllerAny.idValidation),
  driverController.update,
);
router.delete(
  '/:id',
  validate(ctorAny.idValidation || controllerAny.idValidation),
  driverController.remove,
);

export default router;
