// services/supplier.service.ts
import { UserRepository } from '../../repositories/user.repository';
import { AppError } from '../../utils/errors';
import { Op } from 'sequelize';
import Order from '../../models/order.model';
import Address from '../../models/address.model';
import supplierReviewRepository from '../../repositories/supplier-review.repository';

export class SupplierService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
  }

  async canUserReviewSupplier(userId: string, supplierId: string) {
    const order = await Order.findOne({
      where: {
        buyer_id: userId,
        supplier_id: supplierId,
        order_status: { [Op.in]: ['delivered', 'closed'] },
      },
      attributes: ['id'],
    });

    return Boolean(order);
  }

  async getSuppliersByIds(supplierIds: string[]) {
    try {
      // Use the existing findAll method from BaseRepository
      const suppliers = await this.userRepo.findAll({
        where: {
          id: {
            [Op.in]: supplierIds
          },
          role: {
            [Op.in]: ['factory', 'distributor'] // Only get suppliers
          }
        },
        attributes: [
          'id', 
          'business_name', 
          'full_name', 
          'email', 
          'phone', 
          'role',
          'verified', 
          'is_vat_registered',
          'vat_rate',
          'profile_image',
          'created_at'
        ],
        include: [
          {
            model: Address,
            as: 'addresses',
            required: false,
            where: { deleted_at: null },
            attributes: ['id', 'region', 'city', 'subcity', 'common_name'],
          },
        ],
      });

      return suppliers;
    } catch (error) {
      console.error('Error fetching suppliers by IDs:', error);
      throw new AppError('Failed to fetch suppliers', 500);
    }
  }

 async getSupplierById(id: string) {
  try {
    const suppliers = await this.userRepo.findAll({
      where: {
        id,
        role: {
          [Op.in]: ['factory', 'distributor']
        }
      },
      attributes: [
        'id', 
        'business_name', 
        'full_name', 
        'email', 
        'phone', 
        'role',
        'verified', 
        'is_vat_registered',
        'vat_rate',
        'profile_image',
        'created_at'
      ],
      include: [
        {
          model: Address,
          as: 'addresses',
          required: false,
          where: { deleted_at: null },
          attributes: ['id', 'region', 'city', 'subcity', 'common_name'],
        },
      ],
      limit: 1
    });

    const supplier = suppliers[0] || null;

    return supplier;
  } catch (error) {
    console.error('Error fetching supplier by ID:', error);
    throw new AppError('Failed to fetch supplier', 500);
  }
}

  async getAllSuppliers() {
    try {
      const suppliers = await this.userRepo.findAll({
        where: {
          role: {
            [Op.in]: ['factory', 'distributor']
          },
          status: 'active', // Only active suppliers
          verified: true
        },
        attributes: [
          'id', 
          'business_name', 
          'full_name', 
          'role',
          'verified', 
          'profile_image',
          'created_at'
        ],
        include: [
          {
            model: Address,
            as: 'addresses',
            required: false,
            where: { deleted_at: null },
            attributes: ['id', 'region', 'city', 'subcity', 'common_name'],
          },
        ],
        limit: 50
      });

      return suppliers;
    } catch (error) {
      console.error('Error fetching all suppliers:', error);
      throw new AppError('Failed to fetch suppliers', 500);
    }
  }

  async getTopSuppliers(limit: number = 10) {
    try {
      const suppliers = await this.userRepo.findAll({
        where: {
          role: {
            [Op.in]: ['factory', 'distributor']
          },
          status: 'active',
          verified: true
        },
        attributes: [
          'id', 
          'business_name', 
          'full_name', 
          'role',
          'verified', 
          'profile_image',
          'created_at'
        ],
        include: [
          {
            model: Address,
            as: 'addresses',
            required: false,
            where: { deleted_at: null },
            attributes: ['id', 'region', 'city', 'subcity', 'common_name'],
          },
        ],
        // order: [['rating', 'DESC']],
        limit
      });

      return suppliers;
    } catch (error) {
      console.error('Error fetching top suppliers:', error);
      throw new AppError('Failed to fetch top suppliers', 500);
    }
  }

  async searchSuppliers(query: string, filters?: any) {
    try {
      const whereClause: any = {
        role: {
          [Op.in]: ['factory', 'distributor']
        },
        status: 'active',
        [Op.or]: [
          { business_name: { [Op.like]: `%${query}%` } },
          { full_name: { [Op.like]: `%${query}%` } }
        ]
      };

     

      const suppliers = await this.userRepo.findAll({
        where: whereClause,
        attributes: [
          'id', 
          'business_name', 
          'full_name', 
          'role',
          'verified', 
          'profile_image',
          'created_at'
        ],
        include: [
          {
            model: Address,
            as: 'addresses',
            required: false,
            where: { deleted_at: null },
            attributes: ['id', 'region', 'city', 'subcity', 'common_name'],
          },
        ],
        limit: filters?.limit || 20,
        offset: filters?.page ? (filters.page - 1) * (filters.limit || 20) : 0
      });

      return suppliers;
    } catch (error) {
      console.error('Error searching suppliers:', error);
      throw new AppError('Failed to search suppliers', 500);
    }
  }

  async getSupplierReviews(
    supplierId: string,
    params: { page?: number; limit?: number; rating?: number; sort_by?: 'date' | 'rating' | 'helpful' } = {},
  ) {
    const supplier = await this.getSupplierById(supplierId);
    if (!supplier) throw new AppError('Supplier not found', 404);

    const fallbackPage = params.page && params.page > 0 ? params.page : 1;

    try {
      const { reviews, total, page, limit } = await supplierReviewRepository.findAndCountBySupplier(
        supplierId,
        params,
      );
      const summary = await supplierReviewRepository.getSummaryBySupplier(supplierId);

      return {
        reviews: reviews.map((review: any) => ({
          id: review.id,
          user_id: review.user_id,
          user_name:
            review.reviewer?.business_name ||
            review.reviewer?.full_name ||
            'Buyer',
          rating: review.rating,
          comment: review.comment,
          date: review.created_at,
          helpful_count: review.helpful_count || 0,
          verified_purchase: review.verified_purchase === true,
        })),
        total,
        page,
        totalPages: Math.max(1, Math.ceil(total / limit)),
        average_rating: summary.average_rating,
        total_reviews: summary.total_reviews,
      };
    } catch (error: any) {
      const dbCode = error?.original?.code || error?.parent?.code;

      // If the DB schema is missing the supplier review table/columns (common in older envs),
      // avoid breaking supplier profile pages. Log and return empty review data.
      if (dbCode === 'ER_NO_SUCH_TABLE' || dbCode === 'ER_BAD_FIELD_ERROR') {
        console.error('Supplier reviews query failed due to schema mismatch', error);
        return {
          reviews: [],
          total: 0,
          page: fallbackPage,
          totalPages: 1,
          average_rating: 0,
          total_reviews: 0,
        };
      }

      throw error;
    }
  }

  async submitSupplierReview(userId: string, supplierId: string, data: { rating: number; comment?: string }) {
    if (userId === supplierId) throw new AppError('You cannot review yourself', 400);

    const supplier = await this.getSupplierById(supplierId);
    if (!supplier) throw new AppError('Supplier not found', 404);

    const eligible = await this.canUserReviewSupplier(userId, supplierId);
    if (!eligible) throw new AppError('You can only rate suppliers you have ordered from', 403);

    const existing = await supplierReviewRepository.findBySupplierAndReviewer(supplierId, userId);
    if (existing) throw new AppError('You already reviewed this supplier', 409);

    const rating = Number(data.rating);
    if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const created = await supplierReviewRepository.create({
      supplier_id: supplierId,
      user_id: userId,
      rating,
      comment: data.comment?.trim() || null,
      verified_purchase: true,
    } as any);

    return created;
  }
}
