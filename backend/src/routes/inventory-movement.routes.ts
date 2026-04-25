import express from 'express';
import { InventoryMovementController } from '../controllers/inventory-movement.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authorize } from '../middleware/auth.middleware';

const router = express.Router();
const inventoryController = new InventoryMovementController();

// ========================================================================
// Routes
// ========================================================================

// All inventory routes require authentication
router.use(authenticate);

// ========================================================================
// GET Routes
// ========================================================================

// GET /api/inventory-movements - Get all inventory movements (admin only)
router.get('/', authorize('admin'), inventoryController.getAllMovements);

// GET /api/inventory-movements/product/:productId - Get movements by product
router.get('/product/:productId', validate(InventoryMovementController.productIdValidation), inventoryController.getMovementsByProduct);

// GET /api/inventory-movements/:id - Get inventory movement by ID
router.get('/:id', validate(InventoryMovementController.movementIdValidation), inventoryController.getMovementById);

// ========================================================================
// POST Routes
// ========================================================================

// POST /api/inventory-movements - Create new inventory movement
router.post('/', validate(InventoryMovementController.createMovementValidation), inventoryController.createMovement);

export default router;
