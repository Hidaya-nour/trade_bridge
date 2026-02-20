import express from 'express';
import { DriverLocationController } from '../controllers/driver-location.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();
const driverLocationController = new DriverLocationController();

// All routes require authentication
router.use(authenticate);

// Driver location routes
router.post('/', authorize('driver'), validate(DriverLocationController.createValidation), driverLocationController.create);
router.get('/', authorize('driver'), driverLocationController.getDriverLocations);
router.get('/latest', authorize('driver'), driverLocationController.getLatestLocation);
router.get('/time-range', authorize('driver'), driverLocationController.getLocationsInTimeRange);
router.get('/order/:orderId', validate(DriverLocationController.orderIdValidation), driverLocationController.getOrderLocations);
router.put('/:id', validate(DriverLocationController.idValidation), driverLocationController.update);
router.delete('/:id', validate(DriverLocationController.idValidation), driverLocationController.remove);

export default router;