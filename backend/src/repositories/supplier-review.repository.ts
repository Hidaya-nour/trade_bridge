import { fn, col } from 'sequelize';
import SupplierReview from '../models/supplier-review.model';
import { BaseRepository } from './base.repository';
import User from '../models/user.model';

export class SupplierReviewRepository extends BaseRepository<SupplierReview> {
  constructor() {
    super(SupplierReview);
  }

  findBySupplierAndReviewer(supplierId: string, userId: string) {
    return this.model.findOne({ where: { supplier_id: supplierId, user_id: userId } });
  }

  async findAndCountBySupplier(
    supplierId: string,
    params: { page?: number; limit?: number; rating?: number; sort_by?: 'date' | 'rating' | 'helpful' } = {},
  ) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? Math.min(params.limit, 50) : 10;
    const offset = (page - 1) * limit;

    const order = (() => {
      switch (params.sort_by) {
        case 'rating':
          return [['rating', 'DESC']] as any;
        case 'helpful':
          return [['helpful_count', 'DESC']] as any;
        default:
          return [['created_at', 'DESC']] as any;
      }
    })();

    const where: any = { supplier_id: supplierId };
    if (params.rating) where.rating = params.rating;

    const { count, rows } = await this.model.findAndCountAll({
      where,
      include: [{ model: User, as: 'reviewer', attributes: ['id', 'full_name', 'business_name', 'profile_image'] }],
      order,
      limit,
      offset,
    });

    return { total: count, page, limit, reviews: rows };
  }

  async getSummaryBySupplier(supplierId: string) {
    const summary = await this.model.findOne({
      where: { supplier_id: supplierId },
      attributes: [
        [fn('AVG', col('rating')), 'average_rating'],
        [fn('COUNT', col('id')), 'total_reviews'],
      ],
      raw: true,
    });

    const average_rating = Number((summary as any)?.average_rating ?? 0);
    const total_reviews = Number((summary as any)?.total_reviews ?? 0);

    return { average_rating: Number(average_rating.toFixed(2)), total_reviews };
  }
}

export default new SupplierReviewRepository();

