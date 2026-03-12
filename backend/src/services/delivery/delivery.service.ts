import Delivery from '../../models/delivery.model';
import Order from '../../models/order.model';
import Driver from '../../models/driver.model';
import { AppError } from '../../utils/errors';

class DeliveryService {
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
}

export default new DeliveryService();
