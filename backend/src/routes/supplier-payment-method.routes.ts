import express from 'express';
import { SupplierPaymentMethodController } from '../controllers/supplier-payment-method.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();
const paymentMethodController = new SupplierPaymentMethodController();

// All routes require authentication
router.use(authenticate);

// Supplier payment method routes
router.post(
  '/',
  validate(SupplierPaymentMethodController.createValidation),
  (req, res) => paymentMethodController.create(req, res)
);
router.get('/', (req, res) => paymentMethodController.getSupplierPaymentMethods(req, res));
router.get('/active', (req, res) => paymentMethodController.getActivePaymentMethods(req, res));
router.get('/supplier/:supplierId/active', (req, res) => paymentMethodController.getActivePaymentMethodsForSupplier(req, res));
router.get('/primary', (req, res) => paymentMethodController.getPrimaryPaymentMethod(req, res));
router.put(
  '/:id',
  validate(SupplierPaymentMethodController.idValidation),
  (req, res) => paymentMethodController.update(req, res)
);
router.patch(
  '/:id/primary',
  validate(SupplierPaymentMethodController.idValidation),
  (req, res) => paymentMethodController.setPrimary(req, res)
);
router.delete(
  '/:id',
  validate(SupplierPaymentMethodController.idValidation),
  (req, res) => paymentMethodController.remove(req, res)
);

export default router;
