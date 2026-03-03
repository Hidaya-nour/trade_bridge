import express from 'express';
import { body, param } from 'express-validator';
import { RatingReviewController } from '../controllers/rating-review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';

const router = express.Router();
const ratingReviewController = new RatingReviewController();

const createReviewValidation = [
  body('product_id').isUUID().withMessage('Valid product ID is required'),
  body('rating')
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be a number between 0 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string'),
];

const updateReviewValidation = [
  param('id').isUUID().withMessage('Valid review ID is required'),
  body('rating')
    .optional()
    .isFloat({ min: 0, max: 5 })
    .withMessage('Rating must be a number between 0 and 5'),
  body('comment').optional().isString().withMessage('Comment must be a string'),
];

const reviewIdValidation = [param('id').isUUID().withMessage('Valid review ID is required')];
const productIdValidation = [param('productId').isUUID().withMessage('Valid product ID is required')];

// Public routes
router.get(
  '/product/:productId',
  validate(productIdValidation),
  (req, res) => ratingReviewController.getProductReviews(req, res)
);

router.get(
  '/:id',
  validate(reviewIdValidation),
  (req, res) => ratingReviewController.getReviewById(req, res)
);

// Protected routes
router.use(authenticate);

router.get(
  '/my/list',
  (req, res) => ratingReviewController.getMyReviews(req, res)
);

router.post(
  '/',
  validate(createReviewValidation),
  (req, res) => ratingReviewController.createReview(req, res)
);

router.put(
  '/:id',
  validate(updateReviewValidation),
  (req, res) => ratingReviewController.updateReview(req, res)
);

router.delete(
  '/:id',
  validate(reviewIdValidation),
  (req, res) => ratingReviewController.deleteReview(req, res)
);
export default router;
