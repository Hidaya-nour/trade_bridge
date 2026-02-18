import Delivery from '../../models/delivery.model';

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

  async assignDriver(deliveryId: string, driverId: string) {
    const delivery = await Delivery.findByPk(deliveryId);
    if (!delivery) return null;
    delivery.driver_id = driverId as any;
    await delivery.save();
    return delivery;
  }
}

export default new DeliveryService();
