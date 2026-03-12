import express from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, authorize, requireVerifiedSupplier } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { body, query, param } from 'express-validator';

const router = express.Router();
const productController = new ProductController();

// Validation rules
const productValidation = [
  body('name').notEmpty().withMessage('Product name is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('price').isNumeric().withMessage('Price must be a number').custom(value => value >= 0),
  body('unit_type').notEmpty().withMessage('Unit type is required'),
  body('min_order_amount').optional().isInt({ min: 1 }).withMessage('Min order must be at least 1'),
  body('stock_quantity').optional().isInt({ min: 0 }).withMessage('Stock quantity must be 0 or more'),
  body('is_available').optional().isBoolean().withMessage('is_available must be true or false'),
  body('images').optional().isArray(),
];

// Public routes
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/low-stock', productController.getLowStock);
router.get('/out-of-stock', productController.getOutOfStock);
router.get('/:id', productController.getProductById);
router.get('/supplier/:supplierId', productController.getProductsBySupplier);

// Protected routes (require authentication)
router.post(
  '/',
  authenticate,
  requireVerifiedSupplier,
  authorize('distributor', 'factory', 'admin'),
  productValidation,
  productController.createProduct
);

router.put(
  '/:id',
  authenticate,
  requireVerifiedSupplier,
  authorize('distributor', 'factory', 'admin'),
  productValidation,
  productController.updateProduct
);

router.patch(
  '/:id/stock',
  authenticate,
  requireVerifiedSupplier,
  authorize('distributor', 'factory', 'admin'),
  body('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
  productController.updateStock
);

router.patch(
  '/:id/toggle-availability',
  authenticate,
  requireVerifiedSupplier,
  authorize('distributor', 'factory', 'admin'),
  productController.toggleAvailability
);

router.delete(
  '/:id',
  authenticate,
  requireVerifiedSupplier,
  authorize('distributor', 'factory', 'admin'),
  productController.deleteProduct
);

export default router;
