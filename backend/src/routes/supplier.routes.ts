// routes/supplier.routes.ts
import express from 'express';
import { SupplierController } from '../controllers/suppliers.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = express.Router();
const supplierController = new SupplierController();
router.use(authenticate);

// POST /api/suppliers/batch - Get multiple suppliers by IDs
router.post('/batch', supplierController.getSuppliersByIds);

// Other routes...
router.get('/:id', supplierController.getSupplierById);
router.get('/', supplierController.getAllSuppliers);

export default router;