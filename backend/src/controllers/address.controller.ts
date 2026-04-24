import { Request, Response } from 'express';
import { AddressService } from '../services/address/address.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { body, param } from 'express-validator';

const addressService = new AddressService();

export class AddressController {
  async create(req: Request, res: Response) {
    try {
      const data = req.body;
      data.user_id = (req as any).user.id;

      const addr = await addressService.createAddress(data);
      res.status(201).json({ success: true, data: addr });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Create address error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getUserAddresses(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const addrs = await addressService.getUserAddresses(userId);
      res.json({ success: true, data: addrs });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get addresses error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data = req.body;
      await addressService.updateAddress(id, data);
      res.json({ success: true, message: 'Address updated' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Update address error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async remove(req: Request, res: Response) {
    try {
      const { id } = req.params;
      await addressService.deleteAddress(id);
      res.json({ success: true, message: 'Address deleted' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Delete address error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  static createValidation = [
    body('region').isString().notEmpty(),
    body('city').isString().notEmpty(),
    body('subcity').optional().isString(),
    body('common_name').optional().isString(),
    body('latitude').optional().isDecimal(),
    body('longitude').optional().isDecimal()
  ];

  static idValidation = [param('id').isUUID().withMessage('Invalid address ID')];
}
