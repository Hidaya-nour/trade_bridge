// controllers/supplier.controller.ts
import { Request, Response } from 'express';
import { AppError } from '../utils/errors';
import { SupplierService } from '../services/supplier/supplier.service';

const supplierService = new SupplierService();

export class SupplierController {
  async reviewEligibility(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Authentication required', 401);

      const { id } = req.params;
      const can_review = await supplierService.canUserReviewSupplier(userId, id);

      return res.json({
        success: true,
        data: { can_review },
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }

      return res.status(500).json({ success: false, message: 'Failed to check review eligibility' });
    }
  }

  async getSupplierReviews(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const params = {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 10,
        rating: req.query.rating ? Number(req.query.rating) : undefined,
        sort_by: (req.query.sort_by as any) || 'date',
      };

      const result = await supplierService.getSupplierReviews(id, params);
      return res.json({ success: true, data: result });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }

      return res.status(500).json({ success: false, message: 'Failed to fetch supplier reviews' });
    }
  }

  async submitSupplierReview(req: Request, res: Response): Promise<any> {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Authentication required', 401);

      const { id } = req.params;
      const { rating, comment } = req.body || {};

      const review = await supplierService.submitSupplierReview(userId, id, { rating, comment });
      return res.status(201).json({ success: true, message: 'Review submitted', data: { review } });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }

      return res.status(500).json({ success: false, message: 'Failed to submit supplier review' });
    }
  }

  async searchSuppliers(req: Request, res: Response): Promise<any> {
    try {
      const query = String(req.query.query || '').trim();
      if (!query) {
        return res.json({ success: true, data: { suppliers: [] } });
      }

      const suppliers = await supplierService.searchSuppliers(query, {
        page: req.query.page ? Number(req.query.page) : 1,
        limit: req.query.limit ? Number(req.query.limit) : 20,
      });

      return res.json({ success: true, data: { suppliers } });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }

      return res.status(500).json({ success: false, message: 'Failed to search suppliers' });
    }
  }

  async getTopSuppliers(req: Request, res: Response): Promise<any> {
    try {
      const limit = req.query.limit ? Number(req.query.limit) : 10;
      const suppliers = await supplierService.getTopSuppliers(limit);

      return res.json({ success: true, data: { suppliers } });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }

      return res.status(500).json({ success: false, message: 'Failed to fetch top suppliers' });
    }
  }

  async getSuppliersByIds(req: Request, res: Response): Promise<any> {
    try {
      const { supplierIds } = req.body;
      
      if (!supplierIds || !Array.isArray(supplierIds)) {
        return res.status(400).json({
          success: false,
          message: 'supplierIds must be an array'
        });
      }

      const suppliers = await supplierService.getSuppliersByIds(supplierIds);
      
      return res.json({
        success: true,
        data: { suppliers }
      });
    } catch (error) {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        return res.status(500).json({
          success: false,
          message: 'Failed to fetch suppliers'
        });
      }
    }
  }

  async getSupplierById(req: Request, res: Response): Promise<any> {
    try {
      const { id } = req.params;
      const supplier = await supplierService.getSupplierById(id);
      
      if (!supplier) {
        return res.status(404).json({
          success: false,
          message: 'Supplier not found'
        });
      }

      return res.json({
        success: true,
        data: { supplier }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch supplier'
      });
    }
  }

  async getAllSuppliers(req: Request, res: Response): Promise<any> {
    try {
      const suppliers = await supplierService.getAllSuppliers();
      
      return res.json({
        success: true,
        data: { suppliers }
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch suppliers'
      });
    }
  }
}
