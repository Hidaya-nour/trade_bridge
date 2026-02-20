import express from 'express';
import { SupplierPaymentMethodController } from '../controllers/supplier-payment-method.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();
const paymentMethodController = new SupplierPaymentMethodController();

// All routes require authentication
router.use(authenticate);

// Supplier payment method routes
router.post('/', validate(SupplierPaymentMethodController.createValidation), paymentMethodController.create);
router.get('/', paymentMethodController.getSupplierPaymentMethods);
router.get('/active', paymentMethodController.getActivePaymentMethods);
router.get('/primary', paymentMethodController.getPrimaryPaymentMethod);
router.put('/:id', validate(SupplierPaymentMethodController.idValidation), paymentMethodController.update);
router.patch('/:id/primary', validate(SupplierPaymentMethodController.idValidation), paymentMethodController.setPrimary);
router.delete('/:id', validate(SupplierPaymentMethodController.idValidation), paymentMethodController.remove);

export default router;