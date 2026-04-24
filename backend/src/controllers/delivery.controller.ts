import { Request, Response } from 'express';
import deliveryService from '../services/delivery/delivery.service';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';

class DeliveryController {
  async getAvailableDriversForBuyer(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.id as string | undefined;
      const userRole = (req as any).user?.role as string | undefined;

      if (!userId || !userRole) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      if (!['retailer', 'distributor'].includes(userRole)) {
        return res.status(403).json({ success: false, message: 'Only buyers can browse drivers' });
      }

      const search = (req.query.search as string) || '';
      const drivers = await deliveryService.listMarketplaceDrivers(search);
      return res.json({ success: true, data: { drivers } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('List available drivers (buyer) error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async list(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user?.id as string | undefined;
      const userRole = (req as any).user?.role as string | undefined;

      if (!userId || !userRole) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const limit =
        typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : undefined;

      if (userRole === 'driver') {
        const deliveries = await deliveryService.getDriverDeliveries(userId);
        return res.json({ success: true, data: { deliveries } });
      }

      if (!['distributor', 'factory'].includes(userRole)) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      const deliveries = await deliveryService.getSupplierDeliveries(userId, { limit });
      return res.json({ success: true, data: { deliveries } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('List deliveries error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getById(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id as string | undefined;
      const userRole = (req as any).user?.role as string | undefined;

      if (!userId || !userRole) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const supplierId = ['distributor', 'factory'].includes(userRole) ? userId : undefined;
      const delivery = await deliveryService.getDeliveryById(id, supplierId);
      if (!delivery) {
        return res.status(404).json({ success: false, message: 'Delivery not found' });
      }

      return res.json({ success: true, data: { delivery } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('Get delivery by id error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

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
      const userId = (req as any).user?.id as string | undefined;
      const userRole = (req as any).user?.role as string | undefined;
      const delivery = await deliveryService.updateDeliveryStatus(
        id,
        status,
        userId,
        userRole,
      );
      if (!delivery) return res.status(404).json({ success: false, message: 'Delivery not found' });
      return res.json({ success: true, data: { delivery } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
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

  async assignDriverForBuyer(req: Request, res: Response): Promise<any> {
    try {
      const buyerId = (req as any).user?.id as string | undefined;
      const role = (req as any).user?.role as string | undefined;
      if (!buyerId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      if (role && !['retailer', 'distributor'].includes(role)) {
        return res.status(403).json({ success: false, message: 'Only buyers can request drivers' });
      }

      const { orderId } = req.params;
      const { driver_id, dropoff_location } = req.body;
      if (!driver_id) {
        return res.status(400).json({ success: false, message: 'driver_id is required' });
      }

      const delivery = await deliveryService.assignDriverForBuyer({
        orderId,
        buyerId,
        driverRecordId: String(driver_id || ''),
        dropoff_location,
      });

      return res.json({ success: true, data: { delivery } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('Assign driver (buyer) error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async getSupplierDeliveries(req: Request, res: Response): Promise<any> {
    try {
      const role = (req as any).user?.role as string | undefined;
      const supplierId = (req as any).user?.id as string | undefined;
      if (!supplierId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }
      if (role && !['distributor', 'factory'].includes(role)) {
        return res.status(403).json({ success: false, message: 'Only suppliers can view these deliveries' });
      }

      const deliveries = await deliveryService.getSupplierDeliveries(supplierId);
      return res.json({ success: true, data: { deliveries } });
    } catch (err) {
      logger.error('Get supplier deliveries error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }
}

export default new DeliveryController();
