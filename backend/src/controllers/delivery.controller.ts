import { Request, Response } from 'express';
import deliveryService from '../services/delivery/delivery.service';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';

class DeliveryController {
  async getMyDeliveries(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.id as string | undefined;
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const deliveries = await deliveryService.getDriverDeliveries(userId);
      return res.json({ success: true, data: { deliveries } });
    } catch (err) {
      logger.error('Get my deliveries error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<any> {
    try {
      const { order_id, pickup_location, dropoff_location } = req.body;
      const delivery = await deliveryService.createDelivery(order_id, pickup_location, dropoff_location);
      return res.status(201).json({ success: true, data: { delivery } });
    } catch (err) {
      logger.error('Create delivery error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  async updateStatus(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const delivery = await deliveryService.updateDeliveryStatus(id, status);
      if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
      return res.json({ success: true, data: { delivery } });
    } catch (err) {
      logger.error('Update delivery status error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
  async assignDriver(req: Request, res: Response): Promise<any> {
    try {
      const role = (req as any).user?.role as string | undefined;
      if (role && !['distributor', 'factory'].includes(role)) {
        return res.status(403).json({ success: false, message: 'Only suppliers can assign drivers' });
      }

      const { id } = req.params;
      const { driver_id } = req.body;
      const supplierId = (req as any).user.id as string;
      const delivery = await deliveryService.assignDriver(id, supplierId, driver_id);
      return res.json({ success: true, data: { delivery } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('Assign driver error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new DeliveryController();
