import { Request, Response } from 'express';
import { DocumentService } from '../services/document/document.service';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';
import { body, param } from 'express-validator';

const documentService = new DocumentService();

export class DocumentController {
  async upload(req: Request, res: Response) {
    try {
      const data = req.body;
      const file = req.file;
      data.user_id = (req as any).user.id;

      const doc = await documentService.uploadDocument(data, file as Express.Multer.File);
      res.status(201).json({ success: true, data: doc });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Upload document error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getUserDocs(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const docs = await documentService.getUserDocuments(userId);
      res.json({ success: true, data: docs });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get documents error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getAllForAdmin(req: Request, res: Response) {
    try {
      const docs = await documentService.getAllForAdmin();
      res.json({ success: true, data: docs });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get admin documents error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const doc = await documentService.getDocumentById(id);
      if (!doc) return res.status(404).json({ success: false, message: 'Document not found' });
      res.json({ success: true, data: doc });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get document error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // Admin verification
  async verify(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      const adminId = (req as any).user.id;

      await documentService.updateVerification(id, status, adminId, reason);
      res.json({ success: true, message: 'Document verification updated' });
    } catch (error) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Verify document error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  static uploadValidation = [
    body('document_type').isIn(['id_card','business_license','tax_certificate','other']).withMessage('Invalid document type'),
    body('issued_date').optional().isISO8601().withMessage('issued_date must be a valid date'),
    body('expiry_date').optional().isISO8601().withMessage('expiry_date must be a valid date')
  ];

  static idValidation = [param('id').isUUID().withMessage('Invalid document ID')];
}
