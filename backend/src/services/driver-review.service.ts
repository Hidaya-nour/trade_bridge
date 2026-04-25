import Delivery from '../models/delivery.model';
import Driver from '../models/driver.model';
import DriverReview from '../models/driver-review.model';
import Order from '../models/order.model';
import { AppError } from '../utils/errors';

class DriverReviewService {
  private async resolveOrderAndDelivery(orderId: string) {
    const order = await Order.findByPk(orderId, {
      attributes: ['id', 'buyer_id', 'supplier_id'],
    });
    if (!order) throw new AppError('Order not found', 404);

    const delivery = await Delivery.findOne({
      where: { order_id: orderId } as any,
      attributes: ['id', 'order_id', 'status', 'driver_id'],
    });
    if (!delivery) throw new AppError('Delivery not found', 404);

    return { order, delivery };
  }

  async getForOrder(orderId: string, requesterId: string, requesterRole: string) {
    const { order, delivery } = await this.resolveOrderAndDelivery(orderId);

    const isAdmin = requesterRole === 'admin';
    const isBuyer = String((order as any).buyer_id) === requesterId;
    const isSupplier = String((order as any).supplier_id) === requesterId;

    let isAssignedDriver = false;
    if (!isAdmin && !isBuyer && !isSupplier && requesterRole === 'driver') {
      const driverRecord = await Driver.findOne({
        where: { driver_id: requesterId, active: true } as any,
        attributes: ['id'],
      });
      if (driverRecord && String((delivery as any).driver_id || '') === String(driverRecord.id)) {
        isAssignedDriver = true;
      }
    }

    if (!isAdmin && !isBuyer && !isSupplier && !isAssignedDriver) {
      throw new AppError('Not authorized to view this driver review', 403);
    }

    const review = await DriverReview.findOne({
      where: { delivery_id: (delivery as any).id } as any,
      order: [['created_at', 'DESC']],
    });

    return review;
  }

  async submitForOrder(orderId: string, buyerId: string, rating: number, comment?: string) {
    const { order, delivery } = await this.resolveOrderAndDelivery(orderId);

    if (String((order as any).buyer_id) !== buyerId) {
      throw new AppError('You can only rate drivers for your own orders', 403);
    }

    const status = String((delivery as any).status || '').trim().toLowerCase();
    if (status !== 'delivered') {
      throw new AppError('You can only rate the driver after delivery is marked delivered', 400);
    }

    const driverRecordId = String((delivery as any).driver_id || '').trim();
    if (!driverRecordId) {
      throw new AppError('No driver assigned for this delivery', 400);
    }

    const driverRecord = await Driver.findByPk(driverRecordId, {
      attributes: ['id', 'driver_id'],
    });
    if (!driverRecord) {
      throw new AppError('Driver record not found', 404);
    }

    const existing = await DriverReview.findOne({
      where: { delivery_id: (delivery as any).id, buyer_id: buyerId } as any,
    });
    if (existing) {
      throw new AppError('You already rated this driver for this delivery', 409);
    }

    const safeRating = Number(rating);
    if (!Number.isFinite(safeRating) || safeRating < 1 || safeRating > 5) {
      throw new AppError('Rating must be between 1 and 5', 400);
    }

    const created = await DriverReview.create({
      delivery_id: (delivery as any).id,
      driver_user_id: (driverRecord as any).driver_id,
      buyer_id: buyerId,
      rating: safeRating,
      comment: comment ? String(comment).trim() : null,
    } as any);

    return created;
  }
}

export default new DriverReviewService();

