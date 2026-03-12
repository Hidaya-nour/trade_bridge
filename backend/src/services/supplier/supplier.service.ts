// services/supplier.service.ts
import { UserRepository } from '../../repositories/user.repository';
import { AppError } from '../../utils/errors';
import { Op } from 'sequelize';

export class SupplierService {
  private userRepo: UserRepository;

  constructor() {
    this.userRepo = new UserRepository();
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
          'verified', 
          'profile_image',
          'created_at'
        ]
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
        'verified', 
        'profile_image',
        'created_at'
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
          'verified', 
        //   'rating', 
          'profile_image',
          '',
          'created_at'
        ],
        // order: [['rating', 'DESC']],
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
          'verified', 
          'profile_image',
          'created_at'
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
          { full_name: { [Op.like]: `%${query}%` } },
          { description: { [Op.like]: `%${query}%` } }
        ]
      };

     

      const suppliers = await this.userRepo.findAll({
        where: whereClause,
        attributes: [
          'id', 
          'business_name', 
          'full_name', 
          'verified', 
          'profile_image',
          'created_at'
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
}
