import { Op, Order as SequelizeOrder } from 'sequelize';
import sequelize from '../config/database';
import { Delivery } from '../models/delivery.model';
import Document from '../models/document.model';
import Driver from '../models/driver.model';
import { Order } from '../models/order.model';
import { Payment } from '../models/payment.model';
import { Product } from '../models/product.model';
import SupplierPaymentMethod from '../models/supplier-payment-method.model';
import { User } from '../models/user.model';
import { BaseRepository } from './base.repository';

import OrderItems from '../models/order-item.model';
import { OrderFilters, OrderStatus } from '../types/order.types';

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
          attributes: ['id', 'full_name', 'email', 'business_name', 'phone', 'tin_number']
        },
        {
          model: User,
          as: 'supplier',
          attributes: ['id', 'full_name', 'email', 'business_name', 'phone', 'tin_number'],
          include: [
            {
              model: SupplierPaymentMethod,
              as: 'paymentMethods',
              attributes: [
                'id',
                'method_type',
                'provider_name',
                'account_holder_name',
                'account_display',
                'credit_limit',
                'credit_due_days',
                'is_primary',
              ],
              where: { is_active: true },
              required: false,
            },
          ],
        },
        {
          model: OrderItems,
          as: 'items',
          include: [
            {
              model: Product,
              as: 'product',
              attributes: [
                'id',
                'name',
                'category',
                'unit_type',
                'images',
                'price',
                'delivery_available',
                'delivery_pricing',
              ]
            }
          ]
        },
        {
          model: Payment,
          as: 'payment',
          include: [
            {
              model: Document,
              as: 'proofDocument',
              attributes: ['id', 'file_secure_url', 'original_file_name']
            }
          ]
        },
        {
          model: Delivery,
          as: 'delivery',
          include: [
            {
              model: Driver,
              as: 'driver',
              attributes: ['id', 'driver_id', 'vehicle_type', 'license_plate', 'driver_type'],
              include: [
                {
                  model: User,
                  as: 'driverUser',
                  attributes: ['id', 'full_name', 'phone', 'email'],
                  required: false,
                },
              ],
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
          attributes: ['id', 'full_name', 'business_name'],
          include: [
            {
              model: SupplierPaymentMethod,
              as: 'paymentMethods',
              attributes: [
                'id',
                'method_type',
                'provider_name',
                'account_holder_name',
                'account_display',
                'credit_limit',
                'credit_due_days',
                'is_primary',
              ],
              where: { is_active: true },
              required: false,
            },
          ],
        },
        {
          model: OrderItems,
          as: 'items',
          attributes: ['id', 'product_id', 'quantity', 'unit_price'],
          include: [
            {
              model: Product,
              as: 'product',
              attributes: [
                'id',
                'name',
                'sku',
                'unit_type',
                'images',
                'delivery_available',
                'delivery_pricing',
              ]
            }
          ]
        },
        {
          model: Payment,
          as: 'payment',
          attributes: ['payment_status', 'payment_method', 'total_amount', 'amount_paid', 'proof_document_id'],
          include: [
            {
              model: Document,
              as: 'proofDocument',
              attributes: ['id', 'file_secure_url', 'original_file_name']
            }
          ]
        },
        {
          model: Delivery,
          as: 'delivery',
          attributes: [
            'id',
            'driver_id',
            'pickup_location',
            'dropoff_location',
            'status',
            'started_at',
            'completed_at',
          ]
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
      // Reserve stock inside the same transaction to avoid stock changes when order creation fails.
      for (const item of items) {
        const [updated] = await Product.update(
          {
            stock_quantity: sequelize.literal(`stock_quantity - ${item.quantity}`),
            updated_at: new Date(),
          } as any,
          {
            where: {
              id: item.product_id,
              stock_quantity: { [Op.gte]: item.quantity },
            },
            transaction,
          },
        );

        if (updated === 0) {
          throw new Error(`INSUFFICIENT_STOCK:${item.product_id}`);
        }
      }

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
  async getOrderStats(options?: { userId?: string }) {
    const baseWhere: any = {};
    if (options?.userId) {
      baseWhere[Op.or] = [
        { buyer_id: options.userId },
        { supplier_id: options.userId },
      ];
    }

    const hasBase =
      Object.keys(baseWhere).length > 0 || Object.getOwnPropertySymbols(baseWhere).length > 0;

    const withWhere = (extra: any) =>
      hasBase ? ({ [Op.and]: [baseWhere, extra] } as any) : extra;

    const rows = (await this.model.findAll({
      where: baseWhere,
      attributes: [
        'order_status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
        [sequelize.fn('SUM', sequelize.col('total_price')), 'total'],
      ],
      group: ['order_status'],
      raw: true,
    })) as Array<any>;

    const counts: Record<string, number> = {};
    const totals: Record<string, number> = {};

    for (const row of rows) {
      const status = String(row.order_status || '');
      counts[status] = Number(row.count || 0);
      totals[status] = Number(row.total || 0);
    }

    const total_orders = Object.values(counts).reduce((sum, v) => sum + v, 0);
    const total_value = Object.values(totals).reduce((sum, v) => sum + v, 0);

    const now = new Date();
    const startCurrent = new Date(now);
    startCurrent.setDate(startCurrent.getDate() - 30);
    const startPrev = new Date(now);
    startPrev.setDate(startPrev.getDate() - 60);

    const currentWhere = withWhere({
      created_at: { [Op.gte]: startCurrent },
    });
    const prevWhere = withWhere({
      created_at: { [Op.gte]: startPrev, [Op.lt]: startCurrent },
    });

    const [currentOrders, prevOrders] = await Promise.all([
      this.model.count({ where: currentWhere }),
      this.model.count({ where: prevWhere }),
    ]);

    const currentValueRaw = await this.model.sum('total_price' as any, { where: currentWhere });
    const prevValueRaw = await this.model.sum('total_price' as any, { where: prevWhere });
    const currentValue = Number(currentValueRaw || 0);
    const prevValue = Number(prevValueRaw || 0);

    const pct = (current: number, previous: number) => {
      if (previous <= 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(2));
    };

    const order_growth = pct(currentOrders, prevOrders);
    const value_growth = pct(currentValue, prevValue);

    const today = new Date(now);
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const todayWhere = withWhere({
      created_at: { [Op.gte]: today, [Op.lt]: tomorrow },
    });
    const orders_today = await this.model.count({ where: todayWhere });
    const value_today_raw = await this.model.sum('total_price' as any, { where: todayWhere });
    const value_today = Number(value_today_raw || 0);

    return {
      total_orders,
      total_value: Number(total_value.toFixed(2)),
      order_growth,
      value_growth,
      orders_today,
      value_today: Number(value_today.toFixed(2)),
      pending_count: counts.pending || 0,
      approved_count: counts.approved || 0,
      processing_count: counts.processing || 0,
      shipped_count: counts.shipped || 0,
      delivered_count: counts.delivered || 0,
      closed_count: counts.closed || 0,
      cancelled_count: counts.cancelled || 0,
    };
  }
}
