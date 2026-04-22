// routes/supplier.routes.ts
import express from 'express';
import { SupplierController } from '../controllers/suppliers.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const supplierController = new SupplierController();
router.use(authenticate);

// POST /api/suppliers/batch - Get multiple suppliers by IDs
router.post('/batch', supplierController.getSuppliersByIds);

// GET /api/suppliers/search?query=... - Search suppliers
router.get('/search', supplierController.searchSuppliers);

// GET /api/suppliers/top?limit=10 - Top suppliers
router.get('/top', supplierController.getTopSuppliers);

// Supplier reviews
router.get('/:id/review-eligibility', supplierController.reviewEligibility);
router.get('/:id/reviews', supplierController.getSupplierReviews);
router.post('/:id/reviews', supplierController.submitSupplierReview);

// Other routes...
router.get('/:id', supplierController.getSupplierById);
router.get('/', supplierController.getAllSuppliers);

export default router;
