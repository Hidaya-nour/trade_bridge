// controllers/supplier.controller.ts
import { Request, Response } from 'express';
import { AppError } from '../utils/errors';
import { SupplierService } from '../services/supplier/supplier.service';

const supplierService = new SupplierService();

export class SupplierController {
  async getSuppliersByIds(req: Request, res: Response) {
    try {
      const { supplierIds } = req.body;
      
      if (!supplierIds || !Array.isArray(supplierIds)) {
        return res.status(400).json({
          success: false,
          message: 'supplierIds must be an array'
        });
      }

      const suppliers = await supplierService.getSuppliersByIds(supplierIds);
      
      res.json({
        success: true,
        data: { suppliers }
      });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to fetch suppliers'
        });
      }
    }
  }

  async getSupplierById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const supplier = await supplierService.getSupplierById(id);
      
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }

      res.json({
        success: true,
        data: { supplier }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch supplier'
      });
    }
  }

  async getAllSuppliers(req: Request, res: Response) {
    try {
      const suppliers = await supplierService.getAllSuppliers();
      
      res.json({
        success: true,
        data: { suppliers }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch suppliers'
      });
    }
  }
}