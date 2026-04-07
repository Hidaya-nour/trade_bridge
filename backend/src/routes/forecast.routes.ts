import express from 'express';
import { ForecastController } from '../controllers/forecast.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const forecastController = new ForecastController();

router.use(authenticate);
router.get('/inventory/:productId', forecastController.getInventoryForecast);

export default router;
