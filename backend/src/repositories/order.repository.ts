import { BaseRepository } from './base.repository';
import { Op } from 'sequelize';
import sequelize from '../config/database';
import { Order as SequelizeOrder } from 'sequelize';
import { Order } from '../models/order.model';
import { Product } from '../models/product.model';
import { Payment } from '../models/payment.model';
import { Delivery } from '../models/delivery.model';
import { User } from '../models/user.model';

import { OrderFilters, OrderStatus } from '../types/order.types';
import OrderItems from '../models/order-item.model';

export class OrderRepository extends BaseRepository<Order> {
  constructor() {
    super(Order);
  }

  // ============================================================
  // Find Order with Full Details
  // ============================================================

  async findByIdWithDetails(id: string): Promise<Order | null> {
    return this.model.findByPk(id, {
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'full_name', 'email', 'business_name', 'phone']
        },
        {
          model: User,
          as: 'supplier',
          attributes: ['id', 'full_name', 'email', 'business_name', 'phone']
        },
        {
          model: OrderItems,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['id', 'name', 'category', 'unit_type', 'images']
            }
          ]
        },
        {
          model: Payment,
          as: 'payment'
        },
        {
          model: Delivery,
          as: 'delivery',
          include: [
            {
              model: User,
              as: 'driver',
              attributes: ['id', 'full_name', 'phone']
            }
          ]
        }
      ]
    });
  }

  // Find All with Filters
  async findAllWithFilters(filters: OrderFilters) {
    const where: any = {};
    const limit = filters.limit || 20;
    const offset = ((filters.page || 1) - 1) * limit;

    if (filters.buyer_id) {
      where.buyer_id = filters.buyer_id;
    }

    if (filters.supplier_id) {
      where.supplier_id = filters.supplier_id;
    }

    if (filters.status) {
      where.order_status = filters.status;
    }

    if (filters.from_date || filters.to_date) {
      where.created_at = {};
      if (filters.from_date) {
        where.created_at[Op.gte] = new Date(filters.from_date);
      }
      if (filters.to_date) {
        where.created_at[Op.lte] = new Date(filters.to_date);
      }
    }

    const order = filters.sortBy
      ? [[filters.sortBy, filters.sortOrder || 'DESC']]
      : [['created_at', 'DESC']];const orderSequelize: SequelizeOrder = filters.sortBy
  ? [[filters.sortBy, filters.sortOrder || 'DESC']]
  : [['created_at', 'DESC']];


    const { count, rows } = await this.model.findAndCountAll({
      where,
      limit,
      offset,
      order: orderSequelize,
      distinct: true, // important when using include
      include: [
        {
          model: User,
          as: 'buyer',
          attributes: ['id', 'full_name', 'business_name']
        },
        {
          model: User,
          as: 'supplier',
          attributes: ['id', 'full_name', 'business_name']
        },
        {
          model: OrderItems,
          as: 'items',
          attributes: ['id', 'product_id', 'quantity', 'unit_price']
        },
        {
          model: Payment,
          as: 'payment',
          attributes: ['payment_status', 'payment_method']
        },
        {
          model: Delivery,
          as: 'delivery',
          attributes: ['status']
        }
      ]
    });

    return {
      orders: rows,
      total: count,
      page: filters.page || 1,
      totalPages: Math.ceil(count / limit)
    };
  }

  // Create Order With Items (Transactional)
  async createOrderWithItems(
    orderData: Partial<Order>,
    items: { product_id: string; quantity: number; unit_price: number }[]
  ): Promise<Order> {

    const transaction = await sequelize.transaction();

    try {
      const order = await this.model.create(orderData as any, { transaction });

      const orderItems = items.map(item => ({
        order_id: order.id,
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: item.unit_price
      }));

      await OrderItems.bulkCreate(orderItems, { transaction });

      await transaction.commit();
      return order;

    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }

  // Update Status
  async updateOrderStatus(orderId: string, status: OrderStatus): Promise<boolean> {
    const [updated] = await this.model.update(
      { order_status: status },
      { where: { id: orderId } }
    );

    return updated > 0;
  }

  // Order Summary
  async getOrderSummary(orderId: string) {
    const order = await this.model.findByPk(orderId, {
      include: [
        {
          model: OrderItems,
          as: 'items',
          attributes: ['quantity', 'unit_price'],
          include: [
            {
              model: Product,
              as: 'product',
              attributes: ['name', 'category']
            }
          ]
        },
        {
          model: Payment,
          as: 'payment',
          attributes: ['payment_status', 'amount_paid']
        }
      ]
    });

    if (!order) return null;

    const totalItems =
      order.items?.reduce((sum: number, item: any) => sum + item.quantity, 0) || 0;

    return {
      id: order.id,
      total_price: order.total_price,
      total_items: totalItems,
      status: order.order_status,
      created_at: order.created_at
    };
  }

  // Orders by Date Range
  async getOrdersByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
    return this.model.findAll({
      where: {
        created_at: {
          [Op.between]: [startDate, endDate]
        }
      },
      order: [['created_at', 'DESC']]
    });
  }

  // Order Stats
  async getOrderStats(supplierId?: string) {
    const where: any = {};
    if (supplierId) {
      where.supplier_id = supplierId;
    }

    return this.model.findAll({
      where,
      attributes: [
        'order_status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'total']
      ],
      group: ['order_status']
    });
  }
}
