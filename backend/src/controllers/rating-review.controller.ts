import { Request, Response } from 'express';
import { fn, col } from 'sequelize';
import Review from '../models/rating-reviews.model';
import Product from '../models/product.model';
import User from '../models/user.model';
import { AppError } from '../utils/errors';
import logger from '../utils/logger';

export class RatingReviewController {
  // =========================
  // Create a new review
  // =========================
  async createReview(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Authentication required', 401);

      const { product_id, rating, comment } = req.body;

      const product = await Product.findByPk(product_id);
      if (!product) throw new AppError('Product not found', 404);

      const existing = await Review.findOne({ where: { product_id, user_id: userId } });
      if (existing) throw new AppError('You already reviewed this product', 409);

      const review = await Review.create({ product_id, user_id: userId, rating, comment });

      await this.updateProductRatingAndCount(product_id);

      res.status(201).json({
        success: true,
        message: 'Review created successfully',
        data: { review },
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Create review error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // =========================
  // Get all reviews for a product
  // =========================
  async getProductReviews(req: Request, res: Response) {
    try {
      const { productId } = req.params;

      const reviews = await Review.findAll({
        where: { product_id: productId },
        include: [{ model: User, attributes: ['id', 'full_name', 'profile_image'] }],
        order: [['created_at', 'DESC']],
      });

      const summary = await Review.findOne({
        where: { product_id: productId },
        attributes: [
          [fn('AVG', col('rating')), 'average_rating'],
          [fn('COUNT', col('id')), 'total_reviews'],
        ],
        raw: true,
      });

      const averageRating = Number((summary as any)?.average_rating ?? 0).toFixed(2);
      const totalReviews = Number((summary as any)?.total_reviews ?? 0);

      res.json({
        success: true,
        data: { reviews, summary: { average_rating: Number(averageRating), total_reviews: totalReviews } },
      });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get product reviews error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // =========================
  // Get reviews made by the logged-in user
  // =========================
  async getMyReviews(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Authentication required', 401);

      const reviews = await Review.findAll({
        where: { user_id: userId },
        include: [{ model: Product, attributes: ['id', 'name', 'images'] }],
        order: [['created_at', 'DESC']],
      });

      res.json({ success: true, data: { reviews } });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get my reviews error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // =========================
  // Get single review by ID
  // =========================
  async getReviewById(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const review = await Review.findByPk(id, {
        include: [
          { model: User, attributes: ['id', 'full_name', 'profile_image'] },
          { model: Product, attributes: ['id', 'name'] },
        ],
      });

      if (!review) throw new AppError('Review not found', 404);

      res.json({ success: true, data: { review } });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Get review by ID error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // =========================
  // Update a review
  // =========================
  async updateReview(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Authentication required', 401);

      const { id } = req.params;
      const { rating, comment } = req.body;

      const review = await Review.findByPk(id);
      if (!review) throw new AppError('Review not found', 404);
      if (review.user_id !== userId) throw new AppError('You can only update your own review', 403);

      await review.update({ rating: rating ?? review.rating, comment: comment ?? review.comment });
      await this.updateProductRatingAndCount(review.product_id);

      res.json({ success: true, message: 'Review updated successfully', data: { review } });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Update review error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // =========================
  // Delete a review
  // =========================
  async deleteReview(req: Request, res: Response) {
    try {
      const userId = req.user?.id;
      if (!userId) throw new AppError('Authentication required', 401);

      const { id } = req.params;

      const review = await Review.findByPk(id);
      if (!review) throw new AppError('Review not found', 404);
      if (review.user_id !== userId && req.user?.role !== 'admin') throw new AppError('You can only delete your own review', 403);

      const productId = review.product_id;
      await review.destroy();
      await this.updateProductRatingAndCount(productId);

      res.json({ success: true, message: 'Review deleted successfully' });
    } catch (error: any) {
      if (error instanceof AppError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
      } else {
        logger.error('Delete review error:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
      }
    }
  }

  // =========================
  // Update product rating & review_count
  // =========================
  private async updateProductRatingAndCount(productId: string): Promise<void> {
    const summary = await Review.findOne({
      where: { product_id: productId },
      attributes: [
        [fn('AVG', col('rating')), 'average_rating'],
        [fn('COUNT', col('id')), 'total_reviews'],
      ],
      raw: true,
    });

    const averageRating = Number((summary as any)?.average_rating ?? 0).toFixed(2);
    const totalReviews = Number((summary as any)?.total_reviews ?? 0);

    await Product.update(
      { rating: Number(averageRating), review_count: totalReviews },
      { where: { id: productId } },
    );
  }
}