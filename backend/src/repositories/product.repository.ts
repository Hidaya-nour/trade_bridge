import { BaseRepository } from './base.repository';
import { Op, UUIDV4 } from 'sequelize';
import { IProductFilters } from '../types/product.types';
import sequelize from '../config/database';
import { Product } from '../models/product.model';

import { User } from '../models/user.model';
import Review from '../models/rating-reviews.model';

export class ProductRepository extends BaseRepository<Product> {
  constructor() {
    super(Product);
  }

  async findById(id: string): Promise<Product | null> {
    return this.model.findByPk(id, {
      include: [
    {
      model: Review,
      as: 'reviews',
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'full_name']
        }
      ]
    },
    {
      model: User,
      as: 'supplier',
      attributes: ['id', 'full_name', 'business_name']
    }
  ]
    });
  }

  async findAllWithFilters(filters: IProductFilters) {
    const where: any = { };
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    if (filters.category) {
      where.category = filters.category;
    }

if (filters.supplier_id) {
  where.supplier_id = filters.supplier_id;
} else if (filters.exclude_supplier_id) {
  where.supplier_id = { [Op.ne]: filters.exclude_supplier_id };
}

    if (filters.minPrice || filters.maxPrice) {
      where.price = {};
      if (filters.minPrice) where.price[Op.gte] = filters.minPrice;
      if (filters.maxPrice) where.price[Op.lte] = filters.maxPrice;
    }

    if (filters.is_available !== undefined) {
    where.is_available = filters.is_available ? true : false;
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
    return this.model.findAll({
      where: { 
        supplier_id: supplierId, 
      },
      order: [['created_at', 'DESC']]
    });
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const productData = {
      ...data,
          sku: data.sku || `SKU-${Date.now()}`,
      created_at: new Date(),
      updated_at: new Date(),
    };

    return this.model.create(productData as any);
  }

async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
  const product = await this.model.findByPk(id);
  if (!product) return null;

  await product.update({
    ...data,
    updated_at: new Date(),
  });

  return product;
}
async updateStock(productId: string, quantity: number): Promise<boolean> {
  const [updated] = await this.model.update(
    { 
      stock_quantity: quantity,
      updated_at: new Date(),
      is_available: quantity > 0
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
        } 
      }
    );
    return updated > 0;
  }

  async getCategories(): Promise<string[]> {
    const categories = await this.model.findAll({
      attributes: [[sequelize.fn('DISTINCT', sequelize.col('category')), 'category']],
      order: [['category', 'ASC']]
    });
    return categories.map(c => c.category);
  }

  async findLowStock(threshold: number = 10): Promise<Product[]> {
    return this.model.findAll({
      where: {
        stock_quantity: { [Op.lte]: threshold },
        is_available: true
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

    const newAvailability = product.is_available === true ? false : true;
    const [updated] = await this.model.update(
      { 
        is_available: newAvailability,
        updated_at: new Date()
      },
      { 
        where: { 
          id: productId,
        } 
      }
    );
    return updated > 0;
  }
}