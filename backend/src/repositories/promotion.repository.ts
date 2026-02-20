import { BaseRepository } from "./base.repository";
import { Promotion } from "../models/promotion.model";
import { CreatePromotionDTO, UpdatePromotionDTO } from "../types/promotion.types";
import { Op } from "sequelize";

export class PromotionRepository extends BaseRepository<Promotion> {
  constructor() {
    super(Promotion);
  }

  // ============================================================
  // Find Active Promotions
  // ============================================================

  async findActivePromotions(userRole: string, region: string = 'all', currentDate: Date = new Date()): Promise<Promotion[]> {
    const whereClause: any = {
      is_active: true,
      start_date: { [Op.lte]: currentDate },
      end_date: { [Op.gte]: currentDate },
      [Op.or]: [
        { target_role: userRole },
        { target_role: 'all' },
        { target_region: region },
        { target_region: 'all' }
      ]
    };

    return this.model.findAll({
      where: whereClause,
      order: [['created_at', 'DESC']]
    });
  }

  // ============================================================
  // Find Applicable Promotions for Cart
  // ============================================================

  async findApplicablePromotions(
    userRole: string,
    region: string = 'all',
    cartTotal: number,
    currentDate: Date = new Date()
  ): Promise<Promotion[]> {
    const promotions = await this.findActivePromotions(userRole, region, currentDate);

    // Filter by minimum order amount
    return promotions.filter(promo =>
      !promo.minimum_order_amount || cartTotal >= promo.minimum_order_amount
    );
  }

  // ============================================================
  // Create Promotion
  // ============================================================

  async createPromotion(data: CreatePromotionDTO): Promise<Promotion> {
    return this.create(data as any);
  }

  // ============================================================
  // Update Promotion
  // ============================================================

  async updatePromotion(id: string, data: UpdatePromotionDTO): Promise<[number, Promotion[]]> {
    return this.update(id, data as any);
  }

  // ============================================================
  // Deactivate Promotion
  // ============================================================

  async deactivatePromotion(id: string): Promise<[number, Promotion[]]> {
    return this.update(id, { is_active: false } as any);
  }
}