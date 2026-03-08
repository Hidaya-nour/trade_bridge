import express from 'express';
import { DocumentController } from '../controllers/document.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { uploadDocumentMiddleware } from '../middleware/upload.middleware';

const router = express.Router();
const docController = new DocumentController();

router.use(authenticate);

// Upload document (user)
router.post('/', uploadDocumentMiddleware, validate(DocumentController.uploadValidation), docController.upload);

// Get current user's documents
router.get('/', docController.getUserDocs);

// Get specific document (admin or owner)
router.get('/:id', validate(DocumentController.idValidation), docController.getById);

// Admin verify/reject
router.put('/:id/verify', authorize('admin'), validate(DocumentController.idValidation), docController.verify);

export default router;
