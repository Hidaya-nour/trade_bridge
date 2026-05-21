// mobile/features/driver-deliveries/delivery.service.ts
import api from '@/lib/api'; // Ensure this points to your mobile API config

class DeliveryService {
  private readonly BASE = '/deliveries';

  async getMyDeliveries() {
    const response = await api.get(`${this.BASE}/my-deliveries`);
    const payload = response.data;

    if (Array.isArray(payload)) return payload;
    if (Array.isArray(payload?.data)) return payload.data;
    if (Array.isArray(payload?.rows)) return payload.rows;
    if (Array.isArray(payload?.deliveries)) return payload.deliveries;
    if (Array.isArray(payload?.results)) return payload.results;

    // Unknown shape — return empty array to avoid runtime errors
    console.warn('deliveryService.getMyDeliveries: unexpected response shape', payload);
    return [];
  }

  // Standardized status updater based on your web example
  async updateStatus(deliveryId: string, status: 'assigned' | 'picked_up' | 'delivered') {
    const response = await api.patch(`${this.BASE}/${deliveryId}/status`, { status });
    return response.data;
  }
}

export default new DeliveryService();