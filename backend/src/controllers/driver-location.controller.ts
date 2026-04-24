import { Request, Response } from 'express';
import { DriverLocationService } from '../services/driver-location/driver-location.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { body, param, query } from 'express-validator';

const driverLocationService = new DriverLocationService();

export class DriverLocationController {
  async create(req: Request, res: Response): Promise<void> {
    try {
      const data = req.body;
      data.driver_id = (req as any).user.id;

      const location = await driverLocationService.createLocation(data);
      res.status(201).json({ success: true, data: location });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Create driver location error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getDriverLocations(req: Request, res: Response): Promise<void> {
    try {
      const driverId = (req as any).user.id;
      const limit = parseInt(req.query.limit as string) || 50;

      const locations = await driverLocationService.getDriverLocations(driverId, limit);
      res.json({ success: true, data: locations });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get driver locations error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getOrderLocations(req: Request, res: Response): Promise<void> {
    try {
      const { orderId } = req.params;
      const locations = await driverLocationService.getOrderLocations(orderId);
      res.json({ success: true, data: locations });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get order locations error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getLatestLocation(req: Request, res: Response): Promise<void> {
    try {
      const driverId = (req as any).user.id;
      const location = await driverLocationService.getLatestDriverLocation(driverId);
      res.json({ success: true, data: location });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get latest location error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getNearbyDrivers(req: Request, res: Response): Promise<void> {
    try {
      const role = String((req as any).user?.role || '').toLowerCase();
      if (!role) {
        res.status(401).json({ success: false, message: 'Authentication required' });
        return;
      }

      // Allow buyer roles + admins to browse drivers.
      if (!['retailer', 'distributor', 'admin'].includes(role)) {
        res.status(403).json({ success: false, message: 'Access denied' });
        return;
      }

      const limitRaw = typeof req.query.limit === 'string' ? parseInt(req.query.limit, 10) : 30;
      const limit = Number.isFinite(limitRaw) ? Math.min(Math.max(limitRaw, 1), 100) : 30;

      const drivers = await driverLocationService.getDriversWithLatestLocations({ limit });
      res.json({ success: true, data: { drivers } });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get nearby drivers error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getLocationsInTimeRange(req: Request, res: Response): Promise<void> {
    try {
      const driverId = (req as any).user.id;
      const { startTime, endTime } = req.query;

      if (!startTime || !endTime) {
        res.status(400).json({ success: false, message: 'startTime and endTime are required' });
        return;
      }

      const start = new Date(startTime as string);
      const end = new Date(endTime as string);

      const locations = await driverLocationService.getDriverLocationsInTimeRange(driverId, start, end);
      res.json({ success: true, data: locations });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get locations in time range error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async update(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const data = req.body;
      await driverLocationService.updateLocation(id, data);
      res.json({ success: true, message: 'Driver location updated' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Update driver location error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async remove(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await driverLocationService.deleteLocation(id);
      res.json({ success: true, message: 'Driver location deleted' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Delete driver location error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  static createValidation = [
    body('order_id').optional().isUUID(),
    body('latitude').isFloat({ min: -90, max: 90 }),
    body('longitude').isFloat({ min: -180, max: 180 })
  ];

  static idValidation = [param('id').isUUID().withMessage('Invalid location ID')];
  static orderIdValidation = [param('orderId').isUUID().withMessage('Invalid order ID')];
}
