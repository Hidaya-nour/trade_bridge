import { OrderRepository } from '../../repositories/order.repository';
import { ProductRepository } from '../../repositories/product.repository';
import { UserRepository } from '../../repositories/user.repository';
import { BroadcastRepository } from '../../repositories/broadcast.repository';
import { SupplierPaymentMethodService } from '../supplier-payment-method/supplier-payment-method.service';
import { AppError } from '../../utils/errors';
import { 
  CreateOrderDTO, 
  OrderFilters, 
  OrderReceipt,
  OrderReceiptVerification,
  OrderStatus,
  // OrderWithDetails,
  UpdateOrderStatusDTO
} from '../../types/order.types';
import logger from '../../utils/logger';
import notificationService from '../../services/notification/notification.service';
import Payment from '../../models/payment.model';
import { User } from '../../models/user.model';
import { Op } from 'sequelize';

const DEFAULT_VAT_RATE = 0.15;

const supplierPaymentToOrderMethodMap: Record<
  string,
  'app_payment' | 'mobile_banking' | null
> = {
  mobile_money: 'mobile_banking',
  mobile_banking: 'mobile_banking',
  credit_card: 'app_payment',
  chapa: 'app_payment',
};

export class OrderService {
  private orderRepo = new OrderRepository();
  private productRepo = new ProductRepository();
  private userRepo = new UserRepository();
  private broadcastRepo = new BroadcastRepository();
  private supplierPaymentMethodService = new SupplierPaymentMethodService();

  // ========================================================================
  // GET ORDERS
  // ========================================================================

  async getAllOrders(filters: OrderFilters, userId?: string, userRole?: string) {
    // If user is not admin, only show their relevant orders
    if (userRole !== 'admin') {
      if (!filters.buyer_id && !filters.supplier_id) {
        // Show both as buyer and supplier by fetching both and merging
        const asBuyer = await this.orderRepo.findAllWithFilters({ ...filters, buyer_id: userId });
        const asSupplier = await this.orderRepo.findAllWithFilters({ ...filters, supplier_id: userId });

        // Merge unique orders by id
        const map = new Map<string, any>();
        asBuyer.orders.forEach((o: any) => map.set(o.id, o));
        asSupplier.orders.forEach((o: any) => map.set(o.id, o));

        const mergedOrders = Array.from(map.values());

        return {
          orders: mergedOrders,
          total: mergedOrders.length,
          page: 1,
          totalPages: 1
        };
      }
    }
    
    return this.orderRepo.findAllWithFilters(filters);
  }

  async getOrderById(orderId: string, userId: string, userRole: string) {
    const order = await this.orderRepo.findByIdWithDetails(orderId);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check authorization
    if (userRole !== 'admin' && 
        order.buyer_id !== userId && 
        order.supplier_id !== userId) {
      throw new AppError('You do not have permission to view this order', 403);
    }

    return order;
  }

  async getMyOrders(userId: string, filters: OrderFilters) {
    // fetch as buyer and supplier and merge
    const asBuyer = await this.orderRepo.findAllWithFilters({ ...filters, buyer_id: userId });
    const asSupplier = await this.orderRepo.findAllWithFilters({ ...filters, supplier_id: userId });

    const map = new Map<string, any>();
    asBuyer.orders.forEach((o: any) => map.set(o.id, o));
    asSupplier.orders.forEach((o: any) => map.set(o.id, o));

    const mergedOrders = Array.from(map.values());

    return {
      orders: mergedOrders,
      total: mergedOrders.length,
      page: 1,
      totalPages: 1
    };
  }

  async getOrdersAsBuyer(userId: string, filters: OrderFilters) {
    return this.orderRepo.findAllWithFilters({
      ...filters,
      buyer_id: userId
    });
  }

  async getOrdersAsSupplier(userId: string, filters: OrderFilters) {
    return this.orderRepo.findAllWithFilters({
      ...filters,
      supplier_id: userId
    });
  }

  // CREATE ORDER
  async createOrder(buyerId: string, orderData: CreateOrderDTO) {
    const { supplier_id, items, payment_method, delivery_address } = orderData;

    // Validate supplier exists
    const supplier = await this.userRepo.findById(supplier_id);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    // Validate products and calculate subtotal
    let subtotal = 0;
    const orderItems = [];
    const productNameById = new Map<string, string>();

    const toNumber = (value: any, fallback = 0) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : fallback;
    };

    const applyDiscountPromotion = (
      baseUnitPrice: number,
      quantity: number,
      promotion: any,
    ) => {
      if (!promotion) return baseUnitPrice;
      if (promotion.type !== 'discount') return baseUnitPrice;

      const discountType = promotion.discount_type;
      const discountValue = toNumber(promotion.discount_value, 0);
      const minOrder = promotion.min_order !== null && promotion.min_order !== undefined
        ? toNumber(promotion.min_order, 0)
        : null;
      const maxDiscount = promotion.max_discount !== null && promotion.max_discount !== undefined
        ? toNumber(promotion.max_discount, 0)
        : null;

      if (minOrder !== null && minOrder > 0 && quantity < minOrder) return baseUnitPrice;
      if (!discountType || discountValue <= 0) return baseUnitPrice;

      let perUnitDiscount = 0;
      if (discountType === 'percentage') {
        perUnitDiscount = baseUnitPrice * Math.min(100, discountValue) / 100;
      } else if (discountType === 'fixed') {
        perUnitDiscount = discountValue;
      }

      let totalDiscount = perUnitDiscount * quantity;
      if (maxDiscount !== null && maxDiscount > 0) {
        totalDiscount = Math.min(totalDiscount, maxDiscount);
      }

      const unitPrice = baseUnitPrice - totalDiscount / Math.max(1, quantity);
      return Math.max(0, Number(unitPrice.toFixed(2)));
    };

    for (const item of items) {
      const product = await this.productRepo.findById(item.product_id);
      
      if (!product) {
        throw new AppError(`Product ${item.product_id} not found`, 404);
      }

      if (product.supplier_id !== supplier_id) {
        throw new AppError(`Product ${product.name} does not belong to this supplier`, 400);
      }

      if (!product.is_available) {
        throw new AppError(`Product ${product.name} is not available`, 400);
      }

      if (product.stock_quantity < item.quantity) {
        throw new AppError(`Insufficient stock for ${product.name}`, 400);
      }

      if (item.quantity < product.min_order_amount) {
        throw new AppError(`Minimum order for ${product.name} is ${product.min_order_amount}`, 400);
      }

      productNameById.set(product.id, product.name);

      const promotion = await this.broadcastRepo.findActiveDiscountByOwnerAndCode(
        supplier_id,
        product.sku,
      );

      const unitPrice = applyDiscountPromotion(toNumber(product.price, 0), item.quantity, promotion);
      const itemTotal = unitPrice * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: unitPrice,
      });
    }

    const supplierVatRegistered = supplier.is_vat_registered === true;
    const supplierVatRate =
      supplierVatRegistered && supplier.vat_rate !== undefined && supplier.vat_rate !== null
        ? Number(supplier.vat_rate)
        : supplierVatRegistered
          ? DEFAULT_VAT_RATE
          : 0;
    const taxAmount = Number((subtotal * supplierVatRate).toFixed(2));
    const total_price = Number((subtotal + taxAmount).toFixed(2));

    // Validate supplier payment methods
    const activeMethods = await this.supplierPaymentMethodService.getActiveSupplierPaymentMethods(supplier_id);
    const mappedMethods = activeMethods
      .map((m: any) => supplierPaymentToOrderMethodMap[m.method_type])
      .filter(Boolean) as Array<'app_payment' | 'mobile_banking'>;
    const availablePaymentMethods = Array.from(new Set(mappedMethods));

    if (availablePaymentMethods.length === 0) {
      throw new AppError(
        'Supplier has no active payment methods. Please ask supplier to add one before placing orders.',
        400,
      );
    }


    if (payment_method && payment_method.trim().length > 0) {
      if (!availablePaymentMethods.includes(payment_method as any)) {
        throw new AppError(
          `Payment method '${payment_method}' is not available for this supplier`,
          400,
        );
      }
    }

    // Create order with items in a transaction
    let order: any;
    try {
      order = await this.orderRepo.createOrderWithItems(
        {
          buyer_id: buyerId,
          supplier_id,
          total_price,
          order_status: 'pending',
        },
        orderItems
      );
    } catch (err: any) {
      const message = typeof err?.message === 'string' ? err.message : '';
      if (message.startsWith('INSUFFICIENT_STOCK:')) {
        const productId = message.split(':')[1] || '';
        const productName = productNameById.get(productId);
        throw new AppError(
          productName ? `Insufficient stock for ${productName}` : 'Insufficient stock',
          400,
        );
      }
      throw err;
    }

    // Create payment record only when method is explicitly provided
    if (typeof payment_method === 'string' && payment_method.trim().length > 0) {
      try {
        await this.createPaymentRecord(order.id, total_price, payment_method);
      } catch (err) {
        logger.error(`Failed to create payment record for order ${order.id}`, err);
      }
    }

    // Create delivery record if address provided
    if (delivery_address) {
      try {
        await this.createDeliveryRecord(order.id, delivery_address);
      } catch (err) {
        logger.error(`Failed to create delivery record for order ${order.id}`, err);
      }
    }

    logger.info(`Order created: ${order.id} by buyer: ${buyerId}`);

    // Notify supplier about new order
    try {
      const buyer = await this.userRepo.findById(buyerId);
      await notificationService.createNotification({
        user_id: supplier_id,
        type: 'order',
        title: 'New Order Received',
        message: `New order ${order.id} placed by ${buyer?.full_name || buyerId}`
      });
      // Optionally notify buyer (order placed)
      await notificationService.createNotification({
        user_id: buyerId,
        type: 'order',
        title: 'Order Placed',
        message: `Your order ${order.id} was placed successfully`
      });
    } catch (err) {
      logger.error('Failed to create notifications for order creation', err);
    }

    return this.orderRepo.findByIdWithDetails(order.id);
  }

  private async createPaymentRecord(orderId: string, amount: number, method: string) {
    const paymentService = await import('../payment/payment.service');
    return paymentService.default.createPayment(orderId, amount, method);
  }

  private async createDeliveryRecord(orderId: string, address: string) {
    const deliveryService = await import('../delivery/delivery.service');
    // address currently stored as dropoff_location, pickup left empty
    return deliveryService.default.createDelivery(orderId, '', address);
  }

  // UPDATE ORDER STATUS
  async updateOrderStatus(
    orderId: string, 
    userId: string, 
    userRole: string, 
    statusData: UpdateOrderStatusDTO
  ) {
    const order = await this.orderRepo.findById(orderId);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check authorization
    if (userRole === 'supplier' && order.supplier_id !== userId) {
      throw new AppError('You can only update your own orders', 403);
    }

    // Validate status transition
    this.validateStatusTransition(order.order_status, statusData.status);

    const updated = await this.orderRepo.updateOrderStatus(orderId, statusData.status);
    
    if (!updated) {
      throw new AppError('Failed to update order status', 500);
    }

    logger.info(`Order ${orderId} status updated to ${statusData.status} by user ${userId}`);

    // Notify parties about status change
    try {
      await notificationService.createNotification({
        user_id: order.buyer_id,
        type: 'order',
        title: `Order ${statusData.status}`,
        message: `Order ${orderId} status changed to ${statusData.status}`
      });

      await notificationService.createNotification({
        user_id: order.supplier_id,
        type: 'order',
        title: `Order ${statusData.status}`,
        message: `Order ${orderId} status changed to ${statusData.status}`
      });
    } catch (err) {
      logger.error('Failed to create notifications for status change', err);
    }

    if (statusData.status === 'delivered') {
      const payment = await Payment.findOne({ where: { order_id: orderId } });
      if (payment?.payment_status === 'completed') {
        await this.orderRepo.updateOrderStatus(orderId, 'closed');
        try {
          await notificationService.createNotification({
            user_id: order.buyer_id,
            type: 'order',
            title: 'Order Closed',
            message: `Order ${orderId} is now closed (delivered and paid)`,
          });
          await notificationService.createNotification({
            user_id: order.supplier_id,
            type: 'order',
            title: 'Order Closed',
            message: `Order ${orderId} is now closed (delivered and paid)`,
          });
        } catch (err) {
          logger.error('Failed to create notifications for order close', err);
        }
      }
    }

    return this.orderRepo.findByIdWithDetails(orderId);
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      'pending': ['approved', 'cancelled'],
      'approved': ['processing', 'cancelled'],
      'processing': ['shipped', 'cancelled'],
      'shipped': ['delivered', 'cancelled'],
      'delivered': ['closed'],
      'closed': [],
      'cancelled': []
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new AppError(
        `Cannot transition from ${currentStatus} to ${newStatus}`,
        400
      );
    }
  }

  // ========================================================================
  // CANCEL ORDER
  // ========================================================================

  async cancelOrder(orderId: string, userId: string, userRole: string, reason?: string) {
    const order = await this.orderRepo.findById(orderId);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    // Check authorization
    if (userRole !== 'admin' && 
        order.buyer_id !== userId && 
        order.supplier_id !== userId) {
      throw new AppError('You do not have permission to cancel this order', 403);
    }

    // Only pending or approved orders can be cancelled
    if (!['pending', 'approved'].includes(order.order_status)) {
      throw new AppError(`Cannot cancel order in ${order.order_status} status`, 400);
    }

    // Release reserved stock - fetch order with items
    const orderWithDetails = await this.orderRepo.findByIdWithDetails(orderId);
    const items = orderWithDetails?.items || [];
    for (const item of items) {
      await this.productRepo.incrementStock(item.product_id, item.quantity);
    }

    const updated = await this.orderRepo.updateOrderStatus(orderId, 'cancelled');
    
    if (!updated) {
      throw new AppError('Failed to cancel order', 500);
    }

    logger.info(`Order ${orderId} cancelled by user ${userId}. Reason: ${reason || 'Not provided'}`);

    try {
      await notificationService.createNotification({ user_id: order.buyer_id, type: 'order', title: 'Order Cancelled', message: `Order ${orderId} has been cancelled.`, } as any);
      await notificationService.createNotification({ user_id: order.supplier_id, type: 'order', title: 'Order Cancelled', message: `Order ${orderId} has been cancelled.`, } as any);
    } catch (err) {
      logger.error('Failed to notify about order cancellation', err);
    }

    return { success: true, message: 'Order cancelled successfully' };
  }

  // ========================================================================
  // ORDER STATS
  // ========================================================================

  async getOrderStats(userId?: string, userRole?: string) {
    const isAdmin = userRole === 'admin';

    const stats = await this.orderRepo.getOrderStats(
      isAdmin ? undefined : userId ? { userId } : undefined,
    );

    if (!isAdmin) {
      return {
        ...stats,
        total_spent: stats.total_value,
        spent_growth: stats.value_growth,
      };
    }

    const [activeUsers, totalSuppliers] = await Promise.all([
      User.count({
        where: {
          deleted_at: null,
          status: 'active',
        } as any,
      }),
      User.count({
        where: {
          deleted_at: null,
          status: 'active',
          role: { [Op.in]: ['factory', 'distributor'] },
        } as any,
      }),
    ]);

    const now = new Date();
    const startCurrent = new Date(now);
    startCurrent.setDate(startCurrent.getDate() - 30);
    const startPrev = new Date(now);
    startPrev.setDate(startPrev.getDate() - 60);

    const currentUsers = await User.count({
      where: {
        deleted_at: null,
        created_at: { [Op.gte]: startCurrent },
      } as any,
    });
    const prevUsers = await User.count({
      where: {
        deleted_at: null,
        created_at: { [Op.gte]: startPrev, [Op.lt]: startCurrent },
      } as any,
    });

    const pct = (current: number, previous: number) => {
      if (previous <= 0) return current > 0 ? 100 : 0;
      return Number((((current - previous) / previous) * 100).toFixed(2));
    };

    const user_growth = pct(currentUsers, prevUsers);

    return {
      ...stats,
      total_revenue: stats.total_value,
      revenue_today: stats.value_today,
      orders_today: stats.orders_today,
      active_users: activeUsers,
      total_suppliers: totalSuppliers,
      user_growth,
      platform_growth: Number(((stats.order_growth + user_growth) / 2).toFixed(2)),
    };
  }

  async getOrderSummary(orderId: string, userId: string, userRole: string) {
    const order = await this.orderRepo.findById(orderId);
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (userRole !== 'admin' && 
        order.buyer_id !== userId && 
        order.supplier_id !== userId) {
      throw new AppError('You do not have permission to view this order', 403);
    }

    return this.orderRepo.getOrderSummary(orderId);
  }

  async getOrderReceipt(orderId: string, userId: string, userRole: string): Promise<OrderReceipt> {
    const order = await this.orderRepo.findByIdWithDetails(orderId) as any;

    if (!order) {
      throw new AppError('Order not found', 404);
    }

    if (userRole !== 'admin' && order.buyer_id !== userId && order.supplier_id !== userId) {
      throw new AppError('You do not have permission to view this receipt', 403);
    }

    const toNumber = (value: unknown) => {
      const parsed = Number(value);
      return Number.isFinite(parsed) ? parsed : 0;
    };

    const items = (order.items || []).map((item: any) => {
      const unitPrice = toNumber(item.unit_price || item.product?.price || 0);
      const quantity = toNumber(item.quantity || 0);
      return {
        product_id: item.product_id,
        product_name: item.product?.name || 'Product',
        unit_type: item.product?.unit_type || 'unit',
        quantity,
        unit_price: unitPrice,
        line_total: Number((quantity * unitPrice).toFixed(2)),
      };
    });

    const subtotal = Number(
      items.reduce((sum: number, item: any) => sum + item.line_total, 0).toFixed(2)
    );
    const total = Number(toNumber(order.total_price).toFixed(2));
    const tax = Number(Math.max(total - subtotal, 0).toFixed(2));
    const paymentStatus = String(order.payment?.payment_status || 'pending');
    const receiptStatus: 'draft' | 'final' =
      paymentStatus === 'completed' ? 'final' : 'draft';

    return {
      receipt_number: this.buildReceiptNumber(order.id),
      receipt_status: receiptStatus,
      issued_at: new Date().toISOString(),
      order_id: order.id,
      order_date: new Date(order.created_at).toISOString(),
      buyer: {
        id: order.buyer?.id || order.buyer_id,
        name: order.buyer?.full_name || 'Buyer',
        business_name: order.buyer?.business_name || undefined,
        tin_number: order.buyer?.tin_number || undefined,
      },
      supplier: {
        id: order.supplier?.id || order.supplier_id,
        name: order.supplier?.full_name || 'Supplier',
        business_name: order.supplier?.business_name || undefined,
        tin_number: order.supplier?.tin_number || undefined,
      },
      payment: {
        method: order.payment?.payment_method || 'Not selected',
        status: paymentStatus,
        amount_paid: Number(toNumber(order.payment?.amount_paid || 0).toFixed(2)),
        payment_date: order.payment?.payment_date
          ? new Date(order.payment.payment_date).toISOString()
          : undefined,
      },
      currency: 'ETB',
      subtotal,
      shipping: 0,
      discount: 0,
      tax,
      total,
      items,
    };
  }

  private buildReceiptNumber(orderId: string) {
    return `RCP-${String(orderId).replace(/-/g, '').toUpperCase()}`;
  }

  private parseReceiptNumber(receiptNumber: string): string | null {
    const cleaned = String(receiptNumber || '').trim().toUpperCase();
    const match = cleaned.match(/^RCP-([0-9A-F]{32})$/);
    if (!match) return null;
    const hex = match[1];
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`.toLowerCase();
  }

  async verifyReceiptPublic(receiptNumber: string): Promise<OrderReceiptVerification> {
    const orderId = this.parseReceiptNumber(receiptNumber);
    if (!orderId) {
      throw new AppError('Invalid receipt number format', 400);
    }

    const order = await this.orderRepo.findByIdWithDetails(orderId) as any;
    if (!order) {
      throw new AppError('Receipt not found', 404);
    }

    const paymentStatus = String(order.payment?.payment_status || 'pending');
    const receiptStatus: 'draft' | 'final' =
      paymentStatus === 'completed' ? 'final' : 'draft';

    return {
      valid: true,
      receipt_number: this.buildReceiptNumber(order.id),
      receipt_status: receiptStatus,
      order_id: order.id,
      order_status: order.order_status,
      order_date: new Date(order.created_at).toISOString(),
      issued_at: new Date().toISOString(),
      buyer_name: order.buyer?.business_name || order.buyer?.full_name || 'Buyer',
      supplier_name: order.supplier?.business_name || order.supplier?.full_name || 'Supplier',
      total: Number(order.total_price || 0),
      payment_status: paymentStatus,
    };
  }
}
