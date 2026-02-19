import { PromotionRepository } from '../../repositories/promotion.repository';
import { AppError } from '../../utils/errors';
import { CreatePromotionDTO, UpdatePromotionDTO, IPromotion, AppliedPromotion } from '../../types/promotion.types';
import { UserRole } from '../../types/auth.types';
import logger from '../../utils/logger';

export class PromotionService {
  private promotionRepo = new PromotionRepository();

  // ============================================================
  // CREATE PROMOTION
  // ============================================================

  async createPromotion(data: CreatePromotionDTO): Promise<IPromotion> {
    // Validate date range
    if (data.start_date >= data.end_date) {
      throw new AppError('Start date must be before end date', 400);
    }

    // Validate discount value
    if (data.discount_value <= 0) {
      throw new AppError('Discount value must be greater than 0', 400);
    }

    // Validate percentage discount
    if (data.discount_type === 'percentage' && data.discount_value > 100) {
      throw new AppError('Percentage discount cannot exceed 100%', 400);
    }

    // Validate target role
    const validRoles: (UserRole | 'all')[] = ['retailer', 'distributor', 'factory', 'driver', 'admin', 'all'];
    if (!validRoles.includes(data.target_role)) {
      throw new AppError('Invalid target role', 400);
    }

    // Validate target region (basic validation - can be extended)
    if (!data.target_region || data.target_region.trim() === '') {
      throw new AppError('Target region is required', 400);
    }

    const promotion = await this.promotionRepo.createPromotion(data);

    logger.info(`Promotion created: ${promotion.name}`);

    return promotion;
  }

  // ============================================================
  // GET ALL PROMOTIONS
  // ============================================================

  async getAllPromotions(): Promise<IPromotion[]> {
    return this.promotionRepo.findAll({
      order: [['created_at', 'DESC']]
    });
  }

  // ============================================================
  // GET PROMOTION BY ID
  // ============================================================

  async getPromotionById(id: string): Promise<IPromotion | null> {
    return this.promotionRepo.findById(id);
  }

  // ============================================================
  // UPDATE PROMOTION
  // ============================================================

  async updatePromotion(id: string, data: UpdatePromotionDTO): Promise<IPromotion> {
    const promotion = await this.promotionRepo.findById(id);
    if (!promotion) {
      throw new AppError('Promotion not found', 404);
    }

    // Validate date range if dates are being updated
    if (data.start_date && data.end_date && data.start_date >= data.end_date) {
      throw new AppError('Start date must be before end date', 400);
    }

    // Validate discount value
    if (data.discount_value !== undefined && data.discount_value <= 0) {
      throw new AppError('Discount value must be greater than 0', 400);
    }

    // Validate percentage discount
    if (data.discount_type === 'percentage' && data.discount_value && data.discount_value > 100) {
      throw new AppError('Percentage discount cannot exceed 100%', 400);
    }

    // Validate target role
    if (data.target_role) {
      const validRoles: (UserRole | 'all')[] = ['retailer', 'distributor', 'factory', 'driver', 'admin', 'all'];
      if (!validRoles.includes(data.target_role)) {
        throw new AppError('Invalid target role', 400);
      }
    }

    // Validate target region
    if (data.target_region && data.target_region.trim() === '') {
      throw new AppError('Target region is required', 400);
    }

    const [affectedRows, updatedPromotions] = await this.promotionRepo.updatePromotion(id, data);
    if (affectedRows === 0) {
      throw new AppError('Failed to update promotion', 500);
    }

    logger.info(`Promotion updated: ${id}`);

    return updatedPromotions[0];
  }

  // ============================================================
  // DEACTIVATE PROMOTION
  // ============================================================

  async deactivatePromotion(id: string): Promise<{ success: boolean; message: string }> {
    const promotion = await this.promotionRepo.findById(id);
    if (!promotion) {
      throw new AppError('Promotion not found', 404);
    }

    await this.promotionRepo.deactivatePromotion(id);

    logger.info(`Promotion deactivated: ${id}`);

    return {
      success: true,
      message: 'Promotion deactivated successfully'
    };
  }

  // ============================================================
  // APPLY PROMOTIONS TO CART
  // ============================================================

  async applyPromotionsToCart(
    userRole: UserRole,
    region: string,
    cartTotal: number,
    currentDate: Date = new Date()
  ): Promise<AppliedPromotion[]> {
    const applicablePromotions = await this.promotionRepo.findApplicablePromotions(
      userRole,
      region,
      cartTotal,
      currentDate
    );

    const appliedPromotions: AppliedPromotion[] = [];

    for (const promotion of applicablePromotions) {
      let discountAmount = 0;

      if (promotion.discount_type === 'percentage') {
        discountAmount = (cartTotal * promotion.discount_value) / 100;
      } else {
        discountAmount = Math.min(promotion.discount_value, cartTotal);
      }

      appliedPromotions.push({
        promotion,
        discount_amount: discountAmount
      });
    }

    // Sort by discount amount descending
    appliedPromotions.sort((a, b) => b.discount_amount - a.discount_amount);

    return appliedPromotions;
  }

  // ============================================================
  // CALCULATE CART TOTAL WITH PROMOTIONS
  // ============================================================

  async calculateCartTotalWithPromotions(
    userRole: UserRole,
    region: string,
    cartTotal: number,
    currentDate: Date = new Date()
  ): Promise<{
    original_total: number;
    discount_total: number;
    final_total: number;
    applied_promotions: AppliedPromotion[];
  }> {
    const appliedPromotions = await this.applyPromotionsToCart(userRole, region, cartTotal, currentDate);

    const discountTotal = appliedPromotions.reduce((sum, applied) => sum + applied.discount_amount, 0);
    const finalTotal = Math.max(0, cartTotal - discountTotal);

    return {
      original_total: cartTotal,
      discount_total: discountTotal,
      final_total: finalTotal,
      applied_promotions: appliedPromotions
    };
  }
}