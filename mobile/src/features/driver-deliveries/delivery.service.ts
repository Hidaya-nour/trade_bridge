// mobile/features/driver-deliveries/delivery.service.ts
import api from '@/lib/api'; // Ensure this points to your mobile API config

class DeliveryService {
  private readonly BASE = '/deliveries';

  async getMyDeliveries() {
    const response = await api.get(`${this.BASE}/my-deliveries`);
    return response.data;
  }

  // Standardized status updater based on your web example
  async updateStatus(deliveryId: string, status: 'assigned' | 'picked_up' | 'delivered') {
    const response = await api.patch(`${this.BASE}/${deliveryId}/status`, { status });
    return response.data;
  }
}

export default new DeliveryService();