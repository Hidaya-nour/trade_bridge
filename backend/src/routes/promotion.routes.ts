import express from 'express';
import { PromotionController } from '../controllers/promotion.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import { authorize } from '../middleware/auth.middleware'; // Assuming there's an authorize middleware for admin

const router = express.Router();
const promotionController = new PromotionController();

// ========================================================================
// Routes
// ========================================================================

// All promotion routes require authentication and admin role
router.use(authenticate);
router.use(authorize('admin')); // Only admins can manage promotions

// ========================================================================
// GET Routes
// ========================================================================

// GET /api/promotions - Get all promotions
router.get('/', promotionController.getAllPromotions);

// GET /api/promotions/:id - Get promotion by ID
router.get('/:id', validate(PromotionController.promotionIdValidation), promotionController.getPromotionById);

// ========================================================================
// POST Routes
// ========================================================================

// POST /api/promotions - Create new promotion
router.post('/', validate(PromotionController.createPromotionValidation), promotionController.createPromotion);

// ========================================================================
// PUT Routes
// ========================================================================

// PUT /api/promotions/:id - Update promotion
router.put('/:id', validate(PromotionController.updatePromotionValidation), promotionController.updatePromotion);

// ========================================================================
// DELETE Routes
// ========================================================================

// DELETE /api/promotions/:id - Deactivate promotion
router.delete('/:id', validate(PromotionController.promotionIdValidation), promotionController.deactivatePromotion);

export default router;