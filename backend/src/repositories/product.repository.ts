import { BaseRepository } from './base.repository';
import { Op, UUIDV4 } from 'sequelize';
import { IProductFilters } from '../types/product.types';
import sequelize from '../config/database';
import { Product } from '../models/product.model';

import { User } from '../models/user.model';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(Product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.model.findByPk(id, {
      include: [{
        model: User,
        as: 'supplier',
        attributes: ['id', 'full_name', 'business_name', 'email', 'phone']
      }]
    });
  }

  async findAllWithFilters(filters: IProductFilters) {
    // ✅ FIX: Use undefined instead of null for deleted_at
    const where: any = { deleted_at: undefined };
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    if (filters.category) {
      where.category = filters.category;
    }

    if (filters.supplier_id) {
      where.supplier_id = filters.supplier_id;
    }

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price[Op.gte] = filters.minPrice;
      if (filters.maxPrice) where.price[Op.lte] = filters.maxPrice;
    }

    if (filters.is_available !== undefined) {
      where.is_available = filters.is_available ? 1 : 0;
    } else {
      where.is_available = 1;
    }

    if (filters.search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${filters.search}%` } },
        { description: { [Op.like]: `%${filters.search}%` } },
      ];
    }

    const order: any = [];
    if (filters.sortBy) {
      order.push([filters.sortBy, filters.sortOrder || 'ASC']);
    } else {
      order.push(['created_at', 'DESC']);
    }

    const { count, rows } = await this.model.findAndCountAll({
      where,
      limit,
      offset,
      order,
      include: [{
        model: User,
        as: 'supplier',
        attributes: ['id', 'full_name', 'business_name', 'email', 'phone']
      }]
    });

    return {
      products: rows,
      total: count,
      page: filters.page || 1,
      totalPages: Math.ceil(count / limit)
    };
  }

  async findBySupplier(supplierId: string): Promise<Product[]> {
    // ✅ FIX: Use undefined for deleted_at
    return this.model.findAll({
      where: { 
        supplier_id: supplierId, 
        deleted_at: undefined 
      },
      order: [['created_at', 'DESC']]
    });
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const productData = {
      ...data,
      created_at: new Date(),
      updated_at: new Date(),
    };

    return this.model.create(productData as any);
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<[number, Product[]]> {
    const updateData = {
      ...data,
      updated_at: new Date(),
    };
    return this.model.update(updateData, {
      where: { id },
      returning: true,
    });
  }

  async updateStock(productId: string, quantity: number): Promise<boolean> {
    const [updated] = await this.model.update(
      { 
        stock_quantity: quantity,
        updated_at: new Date(),
        is_available: quantity > 0 ? 1 : 0
      },
      { where: { id: productId } }
    );
    return updated > 0;
  }

  async decrementStock(productId: string, quantity: number): Promise<boolean> {
    const [updated] = await this.model.update(
      {
        stock_quantity: sequelize.literal(`stock_quantity - ${quantity}`),
        updated_at: new Date(),
      },
      { 
        where: { 
          id: productId, 
          stock_quantity: { [Op.gte]: quantity },
          deleted_at: undefined  // ✅ FIX
        } 
      }
    );
    return updated > 0;
  }

  async incrementStock(productId: string, quantity: number): Promise<boolean> {
    const [updated] = await this.model.update(
      {
        stock_quantity: sequelize.literal(`stock_quantity + ${quantity}`),
        updated_at: new Date(),
      },
      { 
        where: { 
          id: productId,
          deleted_at: undefined  // ✅ FIX
        } 
      }
    );
    return updated > 0;
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.model.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      where: { deleted_at: undefined },  // ✅ FIX
      order: [['category', 'ASC']]
    });
    return categories.map(c => c.category);
  }

  async findLowStock(threshold: number = 10): Promise<Product[]> {
    return this.model.findAll({
      where: {
        stock_quantity: { [Op.lte]: threshold },
        deleted_at: undefined,  // ✅ FIX
        is_available: 1
      },
      include: [{
        model: User,
        as: 'supplier',
        attributes: ['id', 'full_name', 'business_name']
      }]
    });
  }

  async findOutOfStock(): Promise<Product[]> {
    return this.model.findAll({
      where: {
        stock_quantity: 0,
        deleted_at: undefined  // ✅ FIX
      },
      include: [{
        model: User,
        as: 'supplier',
        attributes: ['id', 'full_name', 'business_name']
      }]
    });
  }

  async toggleAvailability(productId: string): Promise<boolean> {
    const product = await this.model.findByPk(productId);
    if (!product) return false;

    const newAvailability = product.is_available === 1 ? 0 : 1;
    const [updated] = await this.model.update(
      { 
        is_available: newAvailability,
        updated_at: new Date()
      },
      { 
        where: { 
          id: productId,
          deleted_at: undefined  // ✅ FIX
        } 
      }
    );
    return updated > 0;
  }
}