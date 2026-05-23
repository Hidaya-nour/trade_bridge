// mobile/features/driver-deliveries/delivery.service.ts
import api from '@/lib/api'; // Ensure this points to your mobile API config
import type { DeliveryStatus, DriverDelivery } from '@/features/driver-deliveries/delivery.types';
import { mapApiDeliveryToDriverDelivery } from '@/features/driver-deliveries/delivery.utils';

class DeliveryService {
  private readonly BASE = '/deliveries';

  private parseDeliveries(payload: any): DriverDelivery[] {
    let deliveries: any[] = [];

    if (Array.isArray(payload)) deliveries = payload;
    else if (Array.isArray(payload?.data)) deliveries = payload.data;
    else if (Array.isArray(payload?.data?.deliveries)) deliveries = payload.data.deliveries;
    else if (Array.isArray(payload?.data?.rows)) deliveries = payload.data.rows;
    else if (Array.isArray(payload?.rows)) deliveries = payload.rows;
    else if (Array.isArray(payload?.deliveries)) deliveries = payload.deliveries;
    else if (Array.isArray(payload?.results)) deliveries = payload.results;
    else if (payload && typeof payload === 'object' && Array.isArray(payload?.data?.deliveries)) {
      deliveries = payload.data.deliveries;
    }

    if (!Array.isArray(deliveries)) {
      console.warn('deliveryService.parseDeliveries: unexpected response shape', payload);
      return [];
    }

    return deliveries
      .filter(Boolean)
      .map((delivery) => mapApiDeliveryToDriverDelivery(delivery));
  }

  private parseDelivery(payload: any): DriverDelivery | null {
    let delivery: any = null;

    if (!payload) return null;
    if (payload?.id) delivery = payload;
    else if (payload?.data?.delivery) delivery = payload.data.delivery;
    else if (payload?.delivery) delivery = payload.delivery;
    else if (payload?.data) delivery = payload.data;

    return delivery ? mapApiDeliveryToDriverDelivery(delivery) : null;
  }

  async getMyDeliveries(): Promise<DriverDelivery[]> {
    const response = await api.get(`${this.BASE}/my-deliveries`);
    return this.parseDeliveries(response.data);
  }

  async getDeliveryById(deliveryId: string): Promise<DriverDelivery | null> {
    const response = await api.get(`${this.BASE}/${deliveryId}`);
    return this.parseDelivery(response.data);
  }

  // Standardized status updater based on your web example
  async updateStatus(deliveryId: string, status: DeliveryStatus) {
    const response = await api.patch(`${this.BASE}/${deliveryId}/status`, { status });
    return response.data;
  }
}

export default new DeliveryService();