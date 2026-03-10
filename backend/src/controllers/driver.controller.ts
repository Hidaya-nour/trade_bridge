import { Request, Response } from 'express';
import driverService from '../services/driver/driver.service';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';
import { body, param } from 'express-validator';

class DriverController {
  async create(req: Request, res: Response): Promise<any> {
    try {
      const supplierId = (req as any).user.id as string;
      const { driver_id, vehicle_type, license_plate } = req.body;

      const record = await driverService.addDriverToSupplier(supplierId, {
        driver_id,
        vehicle_type,
        license_plate,
      });

      return res.status(201).json({ success: true, data: { driver: record } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('Create driver error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async list(req: Request, res: Response): Promise<any> {
    try {
      const supplierId = (req as any).user.id as string;
      const rows = await driverService.listDrivers(supplierId);
      // Serialize to plain objects so nested `driver` (User) is included for frontend
      const drivers = (rows as any[]).map((r) => {
        const plain = typeof r.get === 'function' ? r.get({ plain: true }) : { ...r };
        if (plain.driver && typeof (plain.driver as any).get === 'function') {
          plain.driver = (plain.driver as any).get({ plain: true });
        }
        return plain;
      });
      return res.json({ success: true, data: { drivers } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('List drivers error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /** GET available driver users (role=driver) for supplier to link. */
  async getAvailableDrivers(req: Request, res: Response): Promise<any> {
    try {
      const supplierId = (req as any).user.id as string;
      const search = (req.query.search as string) || '';
      const drivers = await driverService.getAvailableDrivers(supplierId, search);
      return res.json({ success: true, data: { drivers } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('Get available drivers error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async update(req: Request, res: Response): Promise<any> {
    try {
      const supplierId = (req as any).user.id as string;
      const { id } = req.params;
      const updated = await DriverService.updateDriver(id, supplierId, req.body);
      return res.json({ success: true, data: { driver: updated } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('Update driver error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async remove(req: Request, res: Response): Promise<any> {
    try {
      const supplierId = (req as any).user.id as string;
      const { id } = req.params;
      await driverService.removeDriver(id, supplierId);
      return res.json({ success: true, message: 'Driver removed from supplier' });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('Remove driver error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  static createValidation = [
    body('driver_id').isUUID().withMessage('driver_id must be a valid UUID'),
    body('vehicle_type').optional().isString().isLength({ max: 100 }),
    body('license_plate').optional().isString().isLength({ max: 50 }),
  ];

  static idValidation = [param('id').isUUID().withMessage('Invalid driver ID')];
}

export default new DriverController();

