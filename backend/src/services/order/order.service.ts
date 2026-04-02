import { OrderRepository } from '../../repositories/order.repository';
import { ProductRepository } from '../../repositories/product.repository';
import { UserRepository } from '../../repositories/user.repository';
import { AppError } from '../../utils/errors';
import { 
  CreateOrderDTO, 
  OrderFilters, 
  OrderStatus,
  // OrderWithDetails,
  UpdateOrderStatusDTO
} from '../../types/order.types';
import logger from '../../utils/logger';
import notificationService from '../../services/notification/notification.service';
import Payment from '../../models/payment.model';

const DEFAULT_VAT_RATE = 0.15;

export class OrderService {
  private orderRepo = new OrderRepository();
  private productRepo = new ProductRepository();
  private userRepo = new UserRepository();

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
    const { supplier_id, items, payment_method, delivery_address, notes } = orderData;

    // Validate supplier exists
    const supplier = await this.userRepo.findById(supplier_id);
    if (!supplier) {
      throw new AppError('Supplier not found', 404);
    }

    // Validate products and calculate subtotal
    let subtotal = 0;
    const orderItems = [];

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

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        unit_price: product.price
      });

      // Reserve stock
      await this.productRepo.decrementStock(product.id, item.quantity);
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

    // Create order with items in a transaction
    const order = await this.orderRepo.createOrderWithItems(
      {
        buyer_id: buyerId,
        supplier_id,
        total_price,
        order_status: 'pending',
      },
      orderItems
    );

    // Create payment record only when method is explicitly provided
    if (typeof payment_method === 'string' && payment_method.trim().length > 0) {
      await this.createPaymentRecord(order.id, total_price, payment_method);
    }

    // Create delivery record if address provided
    if (delivery_address) {
      await this.createDeliveryRecord(order.id, delivery_address);
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
    return this.orderRepo.getOrderStats(
      userRole === 'supplier' ? userId : undefined
    );
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
}
