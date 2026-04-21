import Delivery from '../../models/delivery.model';
import Order from '../../models/order.model';
import Driver from '../../models/driver.model';
import { AppError } from '../../utils/errors';
import { Op } from 'sequelize';
import { User } from '../../models/user.model';
import OrderItems from '../../models/order-item.model';
import { Product } from '../../models/product.model';

class DeliveryService {
  async getDriverDeliveries(driverUserId: string) {
    const driverRecord = await Driver.findOne({
      where: { driver_id: driverUserId, active: true },
      attributes: ['id'],
    });

    if (!driverRecord) {
      return [];
    }

    const deliveries = await Delivery.findAll({
      where: {
        driver_id: driverRecord.id as any,
        status: {
          [Op.notIn]: ['delivered', 'failed', 'cancelled'],
        } as any,
      },
      include: [
        {
          model: Order,
          as: 'order',
          attributes: ['id', 'order_status', 'created_at'],
        },
      ],
      order: [['updated_at', 'DESC']],
    });

    return deliveries;
  }

  async createDelivery(orderId: string, pickup: string, dropoff: string) {
    const delivery = await Delivery.create({
      order_id: orderId,
      pickup_location: pickup,
      dropoff_location: dropoff,
      status: 'pending'
    } as any);
    return delivery;
  }

  async updateDeliveryStatus(deliveryId: string, status: string) {
    const delivery = await Delivery.findByPk(deliveryId);
    if (!delivery) return null;
    delivery.status = status as any;
    if (status === 'picked_up') delivery.started_at = new Date() as any;
    if (status === 'delivered') delivery.completed_at = new Date() as any;
    await delivery.save();
    return delivery;
  }

  async assignDriver(deliveryId: string, supplierId: string, driverId: string) {
    const delivery = await Delivery.findByPk(deliveryId);
    if (!delivery) {
      throw new AppError('Delivery not found', 404);
    }

    const order = await Order.findByPk(delivery.order_id);
    if (!order) {
      throw new AppError('Order not found for delivery', 404);
    }
    if (order.supplier_id !== supplierId) {
      throw new AppError('You can only assign drivers for your orders', 403);
    }

    const driver = await Driver.findByPk(driverId);
    if (!driver || driver.supplier_id !== supplierId) {
      throw new AppError('Driver not found for this supplier', 404);
    }
    if (driver.active === false) {
      throw new AppError('Driver is inactive', 400);
    }

    delivery.driver_id = driverId as any;
    if (delivery.status === 'pending') {
      delivery.status = 'assigned' as any;
    }
    await delivery.save();
    return delivery;
  }

  async getSupplierDeliveries(supplierId: string) {
    const deliveries = await Delivery.findAll({
      include: [
        {
          model: Order,
          as: 'order',
          required: true,
          where: { supplier_id: supplierId },
          attributes: ['id', 'order_status', 'created_at', 'buyer_id'],
          include: [
            {
              model: User,
              as: 'buyer',
              attributes: ['id', 'full_name', 'email', 'business_name', 'phone'],
            },
            {
              model: OrderItems,
              as: 'items',
              attributes: ['id', 'quantity'],
              include: [
                {
                  model: Product,
                  as: 'product',
                  attributes: ['id', 'name', 'unit_type'],
                },
              ],
            },
          ],
        } as any,
        {
          model: Driver,
          as: 'driver',
          required: false,
          attributes: ['id', 'vehicle_type', 'license_plate', 'driver_id', 'active'],
          include: [
            {
              model: User,
              as: 'driverUser',
              attributes: ['id', 'full_name', 'email', 'phone'],
            },
          ],
        } as any,
      ],
      order: [['updated_at', 'DESC']],
    });

    return deliveries;
  }
}

export default new DeliveryService();
