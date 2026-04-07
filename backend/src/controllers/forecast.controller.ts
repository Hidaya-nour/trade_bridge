import { Request, Response } from 'express';
import { ForecastingService } from '../services/forecasting.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

const forecastingService = new ForecastingService();

export class ForecastController {
  async getInventoryForecast(req: Request, res: Response) {
    try {
      const { productId } = req.params;
      const days = Number(req.query.days ?? 7);

      if (!productId) {
        res.status(400).json({ success: false, message: 'productId is required' });
        return;
      }

      const result = await forecastingService.getInventoryForecast(productId, days);
      res.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Inventory forecast error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }
}
