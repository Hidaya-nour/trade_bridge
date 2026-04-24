import { Request, Response } from 'express';
import driverService from '../services/driver/driver.service';
import logger from '../utils/logger';
import { AppError } from '../utils/errors';
import { body, param } from 'express-validator';

class DriverController {
  /** Driver self: list vehicle records linked to the authenticated driver user. */
  async me(req: Request, res: Response): Promise<any> {
    try {
      const driverId = (req as any).user.id as string;
      const rows = await driverService.listMyDriverLinks(driverId);
      const drivers = (rows as any[]).map((r) =>
        typeof r.get === 'function' ? r.get({ plain: true }) : { ...r },
      );
      return res.json({ success: true, data: { drivers } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('Driver me error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  /** Driver self: update vehicle info for one linked driver record. */
  async updateMe(req: Request, res: Response): Promise<any> {
    try {
      const driverId = (req as any).user.id as string;
      const { id } = req.params;
      const updated = await driverService.updateMyDriverLink(id, driverId, req.body || {});
      const driver =
        updated && typeof (updated as any).get === 'function'
          ? (updated as any).get({ plain: true })
          : updated;
      return res.json({ success: true, data: { driver } });
    } catch (err) {
      if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, message: err.message });
      }
      logger.error('Update driver me error', err);
      return res.status(500).json({ success: false, message: 'Internal server error' });
    }
  }

  async create(req: Request, res: Response): Promise<any> {
    try {
      const supplierId = (req as any).user.id as string;
      const { driver_id, driver_type, vehicle_type, license_plate } = req.body;

      const record = await driverService.addDriverToSupplier(supplierId, {
        driver_id,
        driver_type,
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
      // Serialize to plain objects so nested driver user is included for frontend
      const drivers = (rows as any[]).map((r) => {
        const plain = typeof r.get === 'function' ? r.get({ plain: true }) : { ...r };
        if (plain.driverUser && typeof (plain.driverUser as any).get === 'function') {
          plain.driverUser = (plain.driverUser as any).get({ plain: true });
        }
        // Preserve API shape expected by frontend
        if (plain.driverUser && !plain.driver) {
          plain.driver = plain.driverUser;
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
      const updated = await driverService.updateDriver(id, supplierId, req.body);
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
    body('driver_type').optional().isString().isLength({ max: 50 }),
    body('vehicle_type').optional().isString().isLength({ max: 100 }),
    body('license_plate').optional().isString().isLength({ max: 50 }),
  ];

  static idValidation = [param('id').isUUID().withMessage('Invalid driver ID')];

  static updateMeValidation = [
    param('id').isUUID().withMessage('Invalid driver ID'),
    body('vehicle_type').optional().isString().isLength({ max: 100 }),
    body('license_plate').optional().isString().isLength({ max: 50 }),
  ];
}

export default new DriverController();
